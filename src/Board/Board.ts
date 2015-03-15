module jsflap.Board {
    export class Board {

        /**
         * The actual svg element being used
         */
        private svg: D3.Selection;

        /**
         * The base of the board for the svg
         */
        private boardBase: D3.Selection;

        /**
         * The graph containing the edges and nodes
         */
        public graph: Graph.IGraph;

        /**
         * The current state of the board
         */
        public state: BoardState;

        /**
         * The visualizations
         */
        public visualizations: Visualization.VisualizationCollection;

        /**
         * The function to call after the board has been updated
         */
        public onBoardUpdateFn: Function = null;

        /**
         * To keep track of the number of nodes
         * @type {number}
         */
        public nodeCount = 0;

        /**
         * The undo manager
         * @type {{add: (function(any): (any|any)), setCallback: (function(any): undefined), undo: (function(): (any|any)), execute: (function(): (any|any)), clear: (function(): undefined), hasUndo: (function(): boolean), hasRedo: (function(): boolean), getCommands: (function(): Array)}}
         */
        public undoManager = jsflap.getUndoManager();

        /**
         * The Invocation stack
         * @type {jsflap.Board.BoardInvocationStack}
         */
        public invocationStack: BoardInvocationStack = new BoardInvocationStack();

        /**
         * Represents both the visualization and the graph underneath
         * @param svg
         * @param graph
         * @param $rootScope The scope to broadcast events on
         */
        constructor(svg: Element, graph: Graph.IGraph, $rootScope) {
            this.svg = d3.select(svg);
            this.boardBase = this.svg.select('g.background').append("rect")
                .attr("fill", "#FFFFFF")
                .attr("width", svg.getBoundingClientRect().width)
                .attr("height", svg.getBoundingClientRect().height);
            this.graph = graph;
            this.state = new BoardState();
            this.visualizations = new Visualization.VisualizationCollection(this.svg, this);
            this.registerBindings($rootScope);
        }

        /**
         * Registers event bindings
         */
        private registerBindings($rootScope) {
            var _this = this;

            // Mouse events
            this.svg.on('mouseup', function () {
                _this.mouseup(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousedown', function () {
                _this.mousedown(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousemove', function () {
                _this.mousemove(new MouseEvent(d3.event, this));
            });

            // Touch events
            this.svg.on('touchstart', function () {
                _this.mousedown(new MouseEvent(d3.event, this));
            });
            this.svg.on('touchmove', function () {
                _this.mousemove(new MouseEvent(d3.event, this));
            });
            this.svg.on('touchend', function () {
                _this.mouseup(new MouseEvent(d3.event, this));
            });

            // Context menu events
            this.svg.on("contextmenu", function() {
                $rootScope.$broadcast('contextmenu', {options: _this.state.contextMenuOptions, event: d3.event});
                _this.state.contextMenuOptions = null;
                d3.event.preventDefault();
            });
            document.addEventListener('keydown', function (event) {

                // Always monitor modifier keys regardless of context
                if(event.which === 16) {
                    _this.state.shiftKeyPressed = true;
                }
                if(event.which === 17) {
                    _this.state.ctrlKeyPressed = true;
                }

                if(!(event.target instanceof HTMLInputElement)) {
                    var result = _this.keydown(event);
                    $rootScope.$digest();
                }
                return result;
            });
            document.addEventListener('keyup', function (event) {

                // Always monitor modifier keys regardless of context
                if(event.which === 16) {
                    _this.state.shiftKeyPressed = false;
                }
                if(event.which === 17) {
                    _this.state.ctrlKeyPressed = false;
                }

                if(!(event.target instanceof HTMLInputElement)) {
                    var result = _this.keyup(event);
                    $rootScope.$digest();
                }
                return result
            });
        }

        /**
         * Mouseup event listener
         * @param event
         */
        private mouseup(event: MouseEvent) {
            if(event.event.which > 1) {
                return false;
            }

            if(this.state.shiftKeyPressed) {
                this.state.shiftKeyPressed = false;
            }

            if(this.state.mode === BoardMode.DRAW) {

                if (this.state.futureEdge) {
                    var nearestNode = this.visualizations.getNearestNode(this.state.futureEdge.end);
                    var endingNode,
                        neededToCreateNode = false;
                    if (nearestNode.node && nearestNode.distance < 40) {
                        endingNode = nearestNode.node;
                    } else {
                        endingNode = this.addNode(this.state.futureEdge.end);
                        neededToCreateNode = true;
                    }
                    this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;

                    var newEdge = this.addEdge(this.state.futureEdgeFrom, endingNode),
                        newEdgeModelIndex = newEdge.models.items.length - 1,
                        newEdgeModel = newEdge.models.items[newEdgeModelIndex];
                    setTimeout(() => {
                        var elm = this.svg.selectAll('g.edgeTransitions text.transition')
                            .filter((possibleEdge: Edge) => possibleEdge === newEdgeModel);
                        //console.log(elm);
                        if (elm.length > 0) {
                            this.visualizations.editTransition(newEdgeModel, <SVGTextElement> elm.node());
                        }
                    }, 10);

                    // Manage undoing and redoing of this action
                    var startingNodeV: Visualization.NodeVisualization = this.state.futureEdgeFrom,
                        endingNodeV: Visualization.NodeVisualization = endingNode,
                        edgeV: Visualization.EdgeVisualization = newEdge;
                    this.undoManager.add({
                        undo: () => {
                            var foundStartingNodeModel = this.visualizations.getNodeVisualizationByLabel(startingNodeV.model.label).model,
                                foundEndingNodeModel = this.visualizations.getNodeVisualizationByLabel(endingNodeV.model.label).model;
                            edgeV = this.visualizations.getEdgeVisualizationByNodes(foundStartingNodeModel, foundEndingNodeModel);
                            var foundEdge = edgeV.models.items[newEdgeModelIndex];
                            //debugger;
                            if(foundEdge) {
                                newEdgeModel = foundEdge;
                                this.removeEdgeTransistion(edgeV, newEdgeModel);
                            }
                            if(neededToCreateNode) {
                                this.removeNodeAndSaveSettings(endingNodeV);
                            }
                        },
                        execute: () => {
                            var foundStartingNode = this.visualizations.getNodeVisualizationByLabel(startingNodeV.model.label),
                                foundEndingNode = this.visualizations.getNodeVisualizationByLabel(endingNodeV.model.label);
                            if(foundStartingNode) {
                                if (foundStartingNode !== startingNodeV) {
                                    startingNodeV = foundStartingNode;
                                }
                                if (foundEndingNode !== null && foundEndingNode !== endingNodeV) {
                                    endingNodeV = foundEndingNode;
                                }

                                if(neededToCreateNode) {
                                    endingNodeV = this.restoreNode(endingNodeV);
                                }
                                edgeV = this.addEdge(startingNodeV, endingNodeV, newEdgeModel.transition, newEdgeModelIndex);
                                newEdgeModel = edgeV.models.items[edgeV.models.items.length - 1];
                            }
                        }
                    });

                    // Remove the future edge
                    this.state.futureEdge.remove();
                    this.state.futureEdge = null;
                    this.state.futureEdgeFrom = null;
                }

                this.state.futureEdgeFrom = null;
            } else if(this.state.mode === BoardMode.MOVE) {
                this.state.draggingNode = null;
                this.state.modifyEdgeControl = null;
                this.state.isDraggingBoard = false;
            } else if(this.state.mode === BoardMode.ERASE) {
                this.state.isErasing = false;
            }
        }

        /**
         * Adds a node to the board
         * @param point
         * @returns {jsflap.Visualization.NodeVisualization}
         */
        public addNode(point: Point.IPoint): Visualization.NodeVisualization {
            var node = this.graph.addNode('q' + this.nodeCount++),
                nodeV = new Visualization.NodeVisualization(node, point.getMPoint());

            if(this.visualizations.nodes.length === 0) {
                this.setInitialNode(nodeV);
            }
            return this.visualizations.addNode(nodeV);
        }

        /**
         * Restores a node visualization to the board
         * @param nodeV
         * @returns {Visualization.NodeVisualization}
         */
        public restoreNode(nodeV: Visualization.NodeVisualization) {
            var node = this.graph.addNode(nodeV.model.label),
                newNodeV = new Visualization.NodeVisualization(node, nodeV.position);
            if(nodeV.model.final) {
                this.markFinalNode(newNodeV);
            }
            if(nodeV.model.initial) {
                this.setInitialNode(newNodeV);
            }
            return this.visualizations.addNode(newNodeV);
        }

        /**
         * Adds an edge to the board given two nodes and a future edge
         * @param from
         * @param to
         * @param transition
         */
        public addEdge(from: Visualization.NodeVisualization, to: Visualization.NodeVisualization, transition?: Transition.ITransition, index?: number) {
            var edge = this.graph.addEdge(from.model, to.model, transition || LAMBDA),
                foundEdgeV = this.visualizations.getEdgeVisualizationByNodes(from.model, to.model);

            // If there already is a visualization between these two edges, add the edge to that model
            if(foundEdgeV) {
                foundEdgeV.addEdgeModel(edge, typeof index === 'number'? index: null);
                if(typeof index === 'number') {
                    foundEdgeV.reindexEdgeModels();
                }

                // Visualizations don't auto-update here, so we need to force call it
                this.visualizations.update();
                return foundEdgeV;
            } else {
                var foundOppositeEdgeV = this.visualizations.getEdgeVisualizationByNodes(to.model, from.model);
                var edgeV = new Visualization.EdgeVisualization(edge);
                if(foundOppositeEdgeV) {
                    // If there is an opposing edge already and its control point is unmoved, move it to separate the edges
                    if(foundOppositeEdgeV.getDirection() === 1) {
                        foundOppositeEdgeV.pathMode = Visualization.EdgeVisualizationPathMode.OPPOSING_A;
                        edgeV.pathMode = Visualization.EdgeVisualizationPathMode.OPPOSING_B;
                    } else {
                        foundOppositeEdgeV.pathMode = Visualization.EdgeVisualizationPathMode.OPPOSING_B;
                        edgeV.pathMode = Visualization.EdgeVisualizationPathMode.OPPOSING_A;
                    }
                    foundOppositeEdgeV.recalculatePath(foundOppositeEdgeV.hasMovedControlPoint()? foundOppositeEdgeV.control: null);
                    edgeV.recalculatePath(foundOppositeEdgeV.hasMovedControlPoint()? edgeV.control: null);
                }

                return this.visualizations.addEdge(edgeV);
            }
        }

        /**
         * Updates a edge's transition by also updating all known hashes as well
         * @param edge
         * @param transition
         */
        public updateEdgeTransition(edge: Edge, transition: Transition.ITransition) {
            //var oldHash = edge.toString();
            edge.transition = transition;
            //this.graph.getEdges().updateEdgeHash(oldHash);
            //edge.visualization.models.updateEdgeHash(oldHash);
            //edge.from.toEdges.updateEdgeHash(oldHash);
            //edge.to.fromEdges.updateEdgeHash(oldHash);
        }

        /**
         * Sets the initial node for the graph
         * @param node
         * @param trackHistory
         */
        public setInitialNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            var prevInitialNode = this.graph.getInitialNode();
            if(node) {
                this.graph.setInitialNode(node.model);
                if(trackHistory) {
                    this.undoManager.add({
                        undo: () => {
                            var foundNode;
                            if(prevInitialNode) {
                                foundNode = this.visualizations.getNodeVisualizationByLabel(prevInitialNode.label);
                            } else {
                                foundNode = null;
                            }
                            if(foundNode) {
                                this.graph.setInitialNode(foundNode.model);
                            } else {
                                this.graph.setInitialNode(null);
                            }
                            this.visualizations.update();
                        },
                        execute: () => {
                            var foundNode;
                            if(prevInitialNode) {
                                foundNode = this.visualizations.getNodeVisualizationByLabel(node.model.label);
                            } else {
                                foundNode = null;
                            }
                            if(foundNode) {
                                if(foundNode) {
                                    this.graph.setInitialNode(foundNode.model);
                                } else {
                                    this.graph.setInitialNode(null);
                                }
                                this.visualizations.update();
                            }
                        }
                    });
                }
            } else {
                this.graph.setInitialNode(null);
                if(trackHistory) {
                    this.undoManager.add({
                        undo: () => {
                            var foundNode;
                            if(prevInitialNode) {
                                 foundNode = this.visualizations.getNodeVisualizationByLabel(prevInitialNode.label);
                            } else {
                                foundNode = null;
                            }
                            if(foundNode) {
                                this.graph.setInitialNode(foundNode.model);
                            } else {
                                this.graph.setInitialNode(null);
                            }
                            this.visualizations.update();
                        },
                        execute: () => {
                            this.graph.setInitialNode(null);
                            this.visualizations.update();
                        }
                    });
                }
            }
        }

        /**
         * Marks the final node for the graph
         * @param node
         * @param trackHistory
         */
        public markFinalNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            this.graph.markFinalNode(node.model);
            if(trackHistory) {
                this.undoManager.add({
                    undo: () => {
                        var foundNode = this.visualizations.getNodeVisualizationByLabel(node.model.label);
                        if(foundNode) {
                            this.graph.unmarkFinalNode(foundNode.model);
                            this.visualizations.update();
                        }
                    },
                    execute: () => {
                        var foundNode = this.visualizations.getNodeVisualizationByLabel(node.model.label);
                        if(foundNode) {
                            this.graph.markFinalNode(foundNode.model);
                            this.visualizations.update();
                        }
                    }
                });
            }
        }

        /**
         * Unmarks the final node for the graph
         * @param node
         * @param trackHistory
         */
        public unmarkFinalNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            this.graph.unmarkFinalNode(node.model);

            if(trackHistory) {
                this.undoManager.add({
                    undo: () => {
                        var foundNode = this.visualizations.getNodeVisualizationByLabel(node.model.label);
                        if(foundNode) {
                            this.graph.markFinalNode(foundNode.model);
                            this.visualizations.update();
                        }
                    },
                    execute: () => {
                        var foundNode = this.visualizations.getNodeVisualizationByLabel(node.model.label);
                        if(foundNode) {
                            this.graph.unmarkFinalNode(foundNode.model);
                            this.visualizations.update();
                        }
                    }
                });
            }
        }

        /**
         * Mousedown event listener
         * @param event
         */
        private mousedown(event: MouseEvent) {
            event.event.preventDefault();

            if(event.event.which > 1) {
                return false;
            }

            var nearestNode = this.visualizations.getNearestNode(event.point);
            if(this.state.mode === BoardMode.DRAW) {
                if (nearestNode.node && nearestNode.distance < 70) {
                    this.state.futureEdgeFrom = nearestNode.node;
                } else if (this.state.modifyEdgeTransition === null) {

                    var cmd = new Command.AddNodeAtPointCommand(this, event.point);

                    // Only add a node if the user is not currently click out of editing a transition OR is near a node
                    this.invocationStack.trackExecution(cmd);
                    this.state.futureEdgeFrom = cmd.getNodeV();
                }
            } else if(this.state.mode === BoardMode.MOVE && !this.state.modifyEdgeControl) {
                if (nearestNode.node && nearestNode.hover) {
                    this.state.draggingNode = nearestNode.node;
                } else {
                    this.state.isDraggingBoard = true;
                }
            } else if(this.state.mode === BoardMode.ERASE) {
                this.state.isErasing = true;
                this.handleErasing(event.point);
            }

            // If the user was focused on modifying an edge transition, blur it.
            if(this.state.modifyEdgeTransition !== null) {
                this.state.modifyEdgeTransition.blur();
            }
        }

        /**
         * Mousemove event listener
         * @param event
         */
        private mousemove(event: MouseEvent) {
            var point = event.point.getMPoint();

            if(event.event.which > 1) {
                return false;
            }

            if(this.state.mode === BoardMode.DRAW) {

                if (this.state.futureEdge !== null) {
                    if (this.state.shiftKeyPressed) {
                        var x1 = this.state.futureEdge.start.x,
                            x2 = point.x,
                            y1 = this.state.futureEdge.start.y,
                            y2 = point.y,
                            dx = x2 - x1,
                            dy = y2 - y1,
                            theta = Math.atan(dy / dx),
                            dTheta = Math.round(theta / (Math.PI / 4)) * (Math.PI / 4),
                            distance = Math.sqrt(
                                Math.pow(y2 - y1, 2) +
                                Math.pow(x2 - x1, 2)
                            ),
                            trigSide = dx >= 0 ? 1 : -1;
                        if (dx !== 0) {
                            point.x = x1 + trigSide * distance * Math.cos(dTheta);
                            point.y = y1 + trigSide * distance * Math.sin(dTheta);

                            // Also snap to a 20-pixel gid disabled for now
                            //point.x = (Math.round(point.x / 20) * 20);
                            //point.y = (Math.round(point.y / 20) * 20);
                        }
                    }

                    var nearestNode = this.visualizations.getNearestNode(point);
                    if (nearestNode.node && nearestNode.distance < 40) {
                        this.state.futureEdge.end = nearestNode.node.getAnchorPointFrom(this.state.futureEdge.start);
                    } else {
                        this.state.futureEdge.end = point;
                    }
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(this.state.futureEdge.end);
                } else if (this.state.futureEdgeFrom !== null) {
                    this.state.futureEdge = new Visualization.FutureEdgeVisualization(event.point.getMPoint(), event.point.getMPoint());
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                    this.state.futureEdge.addTo(this.svg);
                }
            } else if(this.state.mode === BoardMode.MOVE && (this.state.draggingNode || this.state.modifyEdgeControl || this.state.isDraggingBoard)) {
                var snappedPoint = point.getMPoint();
                if(this.state.shiftKeyPressed) {
                    snappedPoint.x = (Math.round(snappedPoint.x / 20) * 20);
                    snappedPoint.y = (Math.round(snappedPoint.y / 20) * 20);
                }

                if(this.state.draggingNode) {
                    var oldDraggingNodePoint = this.state.draggingNode.position.getMPoint();
                    this.state.draggingNode.position = snappedPoint;
                    var newDraggingNodePoint = this.state.draggingNode.position;

                    var updateFn: (edgeModel: Edge) => void = null;

                    /// Allow toggling off control point re-drawing. CTRL Key is not the best key but will do for now
                    if(!this.state.ctrlKeyPressed) {

                        var adjustedEdges = {};

                        updateFn = (edgeModel: Edge) => {
                            var edgeV = edgeModel.visualization,
                                edgeVHash = edgeV.fromModel.toString() + ', ' + edgeV.toModel.toString();

                            // Only do this function ONCE per edge visualization
                            if(!adjustedEdges.hasOwnProperty(edgeVHash)) {
                                adjustedEdges[edgeVHash] = true;
                            }  else {
                                return;
                            }
                            var controlPoint;
                            if (edgeV.hasMovedControlPoint() && edgeV.pathMode !== Visualization.EdgeVisualizationPathMode.SELF) {
                                var otherNode = edgeModel.from === this.state.draggingNode.model ? edgeModel.to.visualization : edgeModel.from.visualization;

                                // Complicated algorithm to determine new control point location:
                                // Setup common points
                                var oldControlPoint = edgeV.control.getMPoint(),
                                    axisNodePosition = otherNode.position,

                                    // Calculate the initial and final midpoints
                                    oldMidpoint = Point.MPoint.getMidpoint(oldDraggingNodePoint, axisNodePosition),
                                    newMidpoint = Point.MPoint.getMidpoint(newDraggingNodePoint, axisNodePosition),

                                    // Calculate the angles between the old midpoint and the old control point
                                    theta1 = oldMidpoint.getAngleTo(oldControlPoint),

                                    // With respect to closest x-axis, calculate the angle of the slope of the line
                                    theta2 = Math.PI - oldMidpoint.getAngleTo(axisNodePosition),

                                    // Get the total angle between the x-axis and the point that is off the old midpoint
                                    theta3 = (theta1 + theta2),

                                    // Find the original offset distance from the old midpoint
                                    oldDistance = oldMidpoint.getDistanceTo(oldControlPoint),

                                    oldLength = oldMidpoint.getDistanceTo(axisNodePosition),
                                    newLength = newMidpoint.getDistanceTo(axisNodePosition),

                                    // Calculate the change in length to get a new distance from the control point
                                    lengthRatio = newLength / oldLength,
                                    newDistance = lengthRatio * oldDistance,

                                    // Now, from the new dragging point and the new midpoint, calculate the new midpoint offset
                                    offset = Point.MPoint.getNormalOffset(newDraggingNodePoint, newMidpoint, newDistance, theta3);

                                // We now know we need to adjust our new midpoint by the offset to get our point!
                                controlPoint = newMidpoint.add(offset);
                                // end 3 hours of work
                            } else if(edgeV.hasMovedControlPoint() && edgeV.pathMode === Visualization.EdgeVisualizationPathMode.SELF) {
                                controlPoint = edgeV.control.getMPoint().add(newDraggingNodePoint.getMPoint().subtract(oldDraggingNodePoint));
                            }
                            edgeV.recalculatePath(controlPoint ? controlPoint : null);
                        };
                    }
                    this.state.draggingNode.updateEdgeVisualizationPaths(updateFn);
                } else if(this.state.modifyEdgeControl) {

                    // Update the control point
                    this.state.modifyEdgeControl.control = snappedPoint;
                    this.state.modifyEdgeControl.recalculatePath(this.state.modifyEdgeControl.control)
                } else if(this.state.isDraggingBoard) {
                    // Move all the elements of the board
                    // Gets the delta between the points
                    point.subtract(this.state.lastMousePoint);

                    // Keep track of control points so that they are only added once
                    var controlPoints = {};

                    // Custom update function to ensure control points are moved correctly
                    var updateFn = (edgeModel: Edge) => {
                        var controlPoint: Point.MPoint = null;

                        // Only bother keeping the relative location of the control point if it has been moved
                        if(edgeModel.visualization.hasMovedControlPoint()) {
                            var edgeHash = edgeModel.toString();

                            // Only do the addition once per edge
                            if(!controlPoints.hasOwnProperty(edgeHash)) {
                                controlPoints[edgeHash] = edgeModel.visualization.control.add(point);
                                controlPoint = controlPoints[edgeHash];
                            } else {
                                controlPoint = controlPoints[edgeHash];
                            }
                        }
                        edgeModel.visualization.recalculatePath(controlPoint?controlPoint: null);
                    };
                    this.visualizations.nodes.forEach((node: Visualization.NodeVisualization) => {
                        node.position.add(point);
                        node.updateEdgeVisualizationPaths(updateFn);
                    });
                }
                this.visualizations.update();
            } else if(this.state.mode === BoardMode.ERASE && this.state.isErasing) {
                this.handleErasing(point);
            }

            this.state.lastMousePoint = event.point.getMPoint();
        }

        /**
         * Handles erasing at a point
         * @param point
         */
        private handleErasing(point: Point.IPoint) {

            // If we are hovering over an edge and we have not yet erased at least the first edge model from it yet
            if(this.state.hoveringEdge && this.graph.hasEdge(this.state.hoveringEdge.models.items[0])) {
                this.removeEdge(this.state.hoveringEdge);
            }
            // If we are hovering over a specific transition and have not already erased it
            else if(this.state.hoveringTransition && this.graph.hasEdge(this.state.hoveringTransition)) {
                var edge = this.state.hoveringTransition,
                    edgeV = edge.visualization,
                    edgeT = edge.transition,
                    fromNodeV = edgeV.fromModel.visualization,
                    toNodeV = edgeV.toModel.visualization,
                    edgeIndex = edgeV.models.items.indexOf(edge);
                this.removeEdgeTransistion(edgeV, edge);
                this.undoManager.add({
                    undo: () => {

                        fromNodeV = this.visualizations.getNodeVisualizationByLabel(edge.from.label);
                        toNodeV = this.visualizations.getNodeVisualizationByLabel(edge.to.label);
                        this.addEdge(fromNodeV, toNodeV, edgeT, edgeIndex);
                    },
                    execute: () => {
                        var fromModel = this.visualizations.getNodeVisualizationByLabel(edge.from.label).model,
                            toModel = this.visualizations.getNodeVisualizationByLabel(edge.to.label).model;
                        edgeV = this.visualizations.getEdgeVisualizationByNodes(fromModel, toModel);
                        if(edgeV) {
                            fromNodeV = edgeV.fromModel.visualization;
                            toNodeV = edgeV.toModel.visualization;
                            this.removeEdgeTransistion(edgeV, edge);
                        }
                    }
                });
            } else {
                var nearestNode = this.visualizations.getNearestNode(point);
                if(nearestNode.node && nearestNode.hover) {
                    this.removeNode(nearestNode.node);
                }
            }
        }

        /**
         * Handles collapsing other edges when removing their opposing edge
         * @param edgeV
         * @private
         */
        private _handleOpposingEdgeCollapsing(edgeV: Visualization.EdgeVisualization) {
            if(edgeV.pathMode === Visualization.EdgeVisualizationPathMode.OPPOSING_A ||
                edgeV.pathMode === Visualization.EdgeVisualizationPathMode.OPPOSING_B) {
                var otherEdgeV = this.visualizations.getEdgeVisualizationByNodes(edgeV.toModel, edgeV.fromModel);
                if(otherEdgeV) {
                    otherEdgeV.pathMode = Visualization.EdgeVisualizationPathMode.DEFAULT;
                    otherEdgeV.recalculatePath(otherEdgeV.hasMovedControlPoint()? otherEdgeV.control: null);
                }
            }
        }

        /**
         * Removes a transition from an edge, and the edge itself if its the last transition
         * @param edgeV
         * @param edgeModel
         */
        public removeEdgeTransistion(edgeV: Visualization.EdgeVisualization, edgeModel: Edge) {

            // If this is the last transition on the edge, just remove the whole edge
            if(edgeV.models.size === 1) {
                return this.removeEdge(edgeV);
            }
            // Delete this edge from the visualization
            edgeV.models.remove(edgeModel);
            this.graph.removeEdge(edgeModel);

            // Now we need to re-index the visualizations
            edgeV.reindexEdgeModels();

            // And force a update
            this.visualizations.update();
        }

        /**
         * Removes an edge from the graph
         * @param edgeV
         */
        public removeEdge(edgeV: Visualization.EdgeVisualization) {

            // Delete each edge from this visualization
            if(edgeV.models.size > 0) {
                edgeV.models.items.forEach((edge: Edge) => this.graph.removeEdge(edge));
            }

            this._handleOpposingEdgeCollapsing(edgeV);
            this.visualizations.removeEdge(edgeV);
        }

        /**
         * Removes a node from the graph
         * @param nodeV
         */
        public removeNode(nodeV: Visualization.NodeVisualization) {
            // Need to copy the edges because when the edges are deleted, the indexing gets messed up

            var toEdges = nodeV.model.toEdges.items.slice(0),
                fromEdges = nodeV.model.fromEdges.items.slice(0),
                deleteFn = (edgeModel: Edge) => {
                    this.graph.removeEdge(edgeModel);
                    this.visualizations.removeEdge(edgeModel.visualization);
                };

            toEdges.forEach(deleteFn);
            fromEdges.forEach(deleteFn);

            this.graph.removeNode(nodeV.model);
            this.visualizations.removeNode(nodeV);
        }

        /**
         * Removes a node, but saves the node's settings before it is removed
         * @param nodeV
         */
        public removeNodeAndSaveSettings(nodeV: Visualization.NodeVisualization) {
            var saveInitial = nodeV.model.initial,
                saveFinal = nodeV.model.final;
            this.removeNode(nodeV);
            nodeV.model.initial = saveInitial;
            nodeV.model.final = saveFinal;
        }

        /**
         * The keydown event listener
         * @param event
         */
        private keydown(event) {
            switch(event.which) {

                // QUICK EDIT
                case 32: // spacebar
                    if(this.state.mode !== BoardMode.MOVE) {
                        this.state.quickMoveFrom = this.state.mode;
                        this.state.mode = BoardMode.MOVE;
                        this.visualizations.update();
                    }
                    break;

                // MODE SWITCHING
                case 68: // d
                    this.setMode(BoardMode.DRAW);
                    break;
                case 69: // e
                    this.setMode(BoardMode.ERASE);
                    break;
                case 77: // m
                    this.setMode(BoardMode.MOVE);
                    break;

                // QUICK NODE SETTINGS
                case 70: // f
                    var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                    if(nearestNode.node && nearestNode.hover) {
                        nearestNode.node.model.final? this.unmarkFinalNode(nearestNode.node, true): this.markFinalNode(nearestNode.node, true);
                        this.visualizations.update();
                    }
                    break;
                case 73: // i
                    var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                    if(nearestNode.node && nearestNode.hover) {
                        if(!nearestNode.node.model.initial) {
                            this.setInitialNode(nearestNode.node, true);
                        } else {
                            this.setInitialNode(null, true);
                        }
                        this.visualizations.update();
                    }
                    break;

                case 89: // Y (For CTRL-Y)
                    if(this.state.ctrlKeyPressed) {
                        this.invocationStack.redo();
                        event.preventDefault();
                    }
                    return false;
                    break;

                case 90: // Z (For CTRL-Z)
                    if(this.state.ctrlKeyPressed) {
                        if(this.state.shiftKeyPressed) {
                            this.invocationStack.redo();
                        } else {
                            this.invocationStack.undo();
                        }
                        event.preventDefault();
                    }
                    return false;
                    break;
            }
            return true;
        }

        /**
         * Sets the board mode and updates accordingly
         * @param mode
         */
        public setMode(mode: BoardMode): boolean {
            mode = +mode;
            if(mode !== this.state.mode) {
                this.state.mode = mode;
                this.visualizations.update();
                return true;
            } else {
                return false;
            }
        }

        /**
         * The keyup event listener
         * @param event
         */
        private keyup(event) {
            if (event.which === 32 && this.state.mode === BoardMode.MOVE && this.state.quickMoveFrom !== null) {
                this.state.draggingNode = null;
                this.state.modifyEdgeControl = null;
                this.state.isDraggingBoard = false;
                this.state.mode = this.state.quickMoveFrom;
                this.state.quickMoveFrom = null;
                if(this.state.modifyEdgeControl) {
                    this.state.modifyEdgeControl = null;
                }
                this.visualizations.update();
            }
            return true;
        }

    }
}