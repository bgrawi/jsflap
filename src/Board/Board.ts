module jsflap.Board {
    export class Board {

        /**
         * The actual svg element being used
         */
        private svg: D3.Selection;
        
        /**
         * The container element
         */
        private container: Element;

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
        
        public settings: BoardSettings = {
            theme: "modern",
            transitionStyle: TransitionStyle.PERPENDICULAR
        };

        /**
         * The visualizations
         */
        public visualizations: Visualization.VisualizationCollection;

        /**
         * The function to call after the board has been updated
         */
        public onBoardUpdateFn: Function = null;

        /**
         * The Invocation stack
         * @type {jsflap.Board.BoardInvocationStack}
         */
        public invocationStack: BoardInvocationStack;
        
        /**
         * Quick test to determine if the platform is Apple-based for modifier keys
         */
        private platformIsApple: boolean = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

        /**
         * Represents both the visualization and the graph underneath
         * @param svg
         * @param graph
         * @param $rootScope The scope to broadcast events on
         */
        constructor(svg: Element, container: Element, graph: Graph.IGraph, $rootScope) {
            this.svg = d3.select(svg);
            this.container = container;
            this.boardBase = this.svg.select('g.background').append("rect")
                .attr("fill", "url(#grid)")
                .attr("opacity", 1)
                .attr("width","100%")
                .attr("height", "100%");
            this.setNewGraph(graph);
            this.registerBindings($rootScope);
        }
        
        /**
         * Sets the board's new graph, resets all states
         */
        public setNewGraph(graph: Graph.IGraph) {
            this.graph = graph;
            this.state = new BoardState();
            this.visualizations = new Visualization.VisualizationCollection(this.svg, this);
            this.visualizations.update();
            this.invocationStack = new BoardInvocationStack();
        }
        
        public getSvg(): D3.Selection {
            return this.svg;
        }
        
        public getContainer(): Element {
            return this.container;
        }

        public reindexNodeNames() {
            var cmd = new Command.ReindexNodeLabelsCommand(this);
            this.invocationStack.trackExecution(cmd);
        }
        
        /**
         * Get the next valid node label
         */
        public getNextNodeLabel(): string {
            
            
            // A sparse array for checking the next lowest value
            var nodeIndexArray =[];
            
            this.visualizations.nodes.forEach((node: Visualization.NodeVisualization) => {
                var curLabel = node.model.label;
                
                // Loop through each node and see if its label starts with a q
                if(curLabel.charAt(0) === "q") {
                    var value = parseInt(curLabel.substr(1));
                    if(!isNaN(value)) {
                        
                        // If it does and its a valid nuber
                        nodeIndexArray[value] = true;
                    }
                }
            });
            
            var maxLength = nodeIndexArray.length;
            if(maxLength == 0) {
                return "q0";
            }
            
            for(var index = 0; index < maxLength; index++) {
                if(!nodeIndexArray[index]) {
                    return "q" + index;
                }
            }
            
            return "q" + maxLength;
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
                // Do not track modifier keys if the event was in an input field
                // TODO: Better input field detection (e.g. textarea/select lists w/o multiple compares)
                if ((<HTMLElement> event.target).tagName.toLowerCase() === 'input') {
                    return;
                }
                
                switch(event.which) {
                   case 16:
                       _this.state.shiftKeyPressed = true;
                       _this.boardBase.transition().duration(250).attr("opacity", 0);
                       break;
                   case 17:
                       _this.state.ctrlKeyPressed = true;
                       break;
                   case 91:
                   case 93:
                   case 224:
                       _this.state.metaKeyPressed = true;
                       break; 
                }

                if(!(event.target instanceof HTMLInputElement)) {
                    var result = _this.keydown(event);
                    $rootScope.$digest();
                }
                return result;
            });
            document.addEventListener('keyup', function (event) {

                // Always monitor modifier keys regardless of context
                switch(event.which) {
                   case 16:
                       _this.state.shiftKeyPressed = false;
                       _this.boardBase.transition().duration(250).attr("opacity", 1);
                       break;
                   case 17:
                       _this.state.ctrlKeyPressed = false;
                       break;
                   case 91:
                   case 93:
                   case 224:
                       _this.state.metaKeyPressed = false;
                       break; 
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

            if(this.state.mode === BoardMode.DRAW) {

                if (this.state.futureEdge) {

                    var cmd = new Command.AddEdgeFromNodeCommand(this, this.state.futureEdgeFrom, this.state.futureEdge.end);

                    var endingNode = cmd.getEndNodeV();
                    this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;

                    this.invocationStack.trackExecution(cmd);
                    
                    this.editEdgeTransition(cmd.getEdge());

                    // Remove the future edge
                    this.state.futureEdge.remove();
                }

                this.state.futureEdge = null;
                this.state.futureEdgeFrom = null;
                this.state.futureEdgeFromValid = false;
                this.state.futureEdgeFromCreated = false;
            } else if(this.state.mode === BoardMode.MOVE) {
                if(this.state.draggingCommand !== null) {
                    this.invocationStack.trackExecution(this.state.draggingCommand);
                    this.state.draggingCommand = null;
                }
                this.state.draggingNode = null;
                this.state.modifyEdgeControl = null;
                this.state.isDraggingBoard = false;
            } else if(this.state.mode === BoardMode.ERASE) {
                this.state.isErasing = false;
            }
        }

        /**
         * Adds an edge to the board given two nodes and a future edge
         * @param existingEdgeV
         * @param from
         * @param to
         * @param transition
         * @param index
         */
        public addEdge(existingEdgeV: Visualization.EdgeVisualization, from: Visualization.NodeVisualization, to: Visualization.NodeVisualization, transition?: Transition.ITransition, index?: number, pending?: boolean) {
            var edge = this.graph.addEdge(from.model, to.model, transition || LAMBDA, pending),
                foundEdgeV;

            foundEdgeV =  this.visualizations.getEdgeVisualizationByNodes(from.model, to.model);

            // If there already is a visualization between these two edges, add the edge to that model
            if(foundEdgeV) {
                foundEdgeV.addEdgeModel(edge, typeof index === 'number'? index: null);
                if(typeof index === 'number') {
                    foundEdgeV.reindexEdgeModels();
                }

                // Visualizations don't auto-update here, so we need to force call it
                if(this.visualizations.shouldAutoUpdateOnModify) {
                    this.visualizations.update();
                }
                return foundEdgeV;
            } else {
                if(existingEdgeV) {
                    var edgeV = existingEdgeV;
                    edgeV.addEdgeModel(edge);

                } else {
                    var edgeV = new Visualization.EdgeVisualization(edge);
                }

                this.handleOppositeEdgeExpanding(edgeV);
                return this.visualizations.addEdge(edgeV);
            }
        }

        public addEdgeVisualization(edgeV: Visualization.EdgeVisualization) {
            edgeV.models.items.forEach((edge: Edge) => {
               this.graph.addEdge(edge);
            });
            this.visualizations.addEdge(edgeV);
        }

        /**
         * Handles the opposite edge expanding animations
         * @param edgeV
         */
        public handleOppositeEdgeExpanding(edgeV: Visualization.EdgeVisualization) {
            var foundOppositeEdgeV = this.visualizations.getEdgeVisualizationByNodes(edgeV.toModel, edgeV.fromModel);
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
        }

        /**
         * Starts editing the edge transition
         * @param edge
         */
        public editEdgeTransition(edge: Edge) {
            //setTimeout(() => {
                var elm = this.svg.selectAll('g.edgeTransitions text.transition')
                    .filter((possibleEdge: Edge) => possibleEdge === edge)
                    .select("tspan:first-child");

                if (elm.length > 0) {
                    this.visualizations.update();
                    this.visualizations.editTransition(edge, <SVGTextElement> elm.node());
                }
            //}, 20);
        }

        /**
         * Sets the initial node for the graph
         * @param node
         * @param trackHistory
         */
        public setInitialNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            var cmd = new Command.SetInitialNodeCommand(this, node? node.model: null);
            if(trackHistory) {
                this.invocationStack.trackExecution(cmd);
            } else {
                cmd.execute();
            }
        }

        /**
         * Marks the final node for the graph
         * @param node
         * @param trackHistory
         */
        public markFinalNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            var cmd = new Command.MarkFinalNodeCommand(this, node? node.model: null);
            if(trackHistory) {
                this.invocationStack.trackExecution(cmd);
            } else {
                cmd.execute();
            }
        }

        /**
         * Unmarks the final node for the graph
         * @param node
         * @param trackHistory
         */
        public unmarkFinalNode(node: Visualization.NodeVisualization, trackHistory?: boolean) {
            var cmd = new Command.UnmarkFinalNodeCommand(this, node? node.model: null);
            if(trackHistory) {
                this.invocationStack.trackExecution(cmd);
            } else {
                cmd.execute();
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
                if(this.state.editableTextInputField === null) {
                    if (nearestNode.node && nearestNode.distance < 70) {
                        this.state.futureEdgeFrom = nearestNode.node;
                    } else {
                        
                        var snappedPoint = event.point.getMPoint();
                        if(!this.state.shiftKeyPressed) {
                            snappedPoint.round(20);
                        }
    
                        var cmd = new Command.AddNodeAtPointCommand(this, snappedPoint);
    
                        // Only add a node if the user is not currently click out of editing a transition OR is near a node
                        this.invocationStack.trackExecution(cmd);
                        this.state.futureEdgeFromCreated = true;
                        this.state.futureEdgeFrom = cmd.getNodeV();
                        
                    }
                }
            } else if(this.state.mode === BoardMode.MOVE && !this.state.modifyEdgeControl) {
                if (nearestNode.node && nearestNode.hover) {
                    this.state.draggingNode = nearestNode.node;
                    this.state.draggingCommand = new Command.MoveNodeCommand(this, this.state.draggingNode);
                } else {
                    this.state.isDraggingBoard = true;
                    this.state.draggingCommand = new Command.MoveBoardCommand(this);
                }
            } else if(this.state.mode === BoardMode.ERASE) {
                this.state.isErasing = true;
                this.handleErasing(event.point);
            }

            // If the user was focused on modifying an edge transition, blur it.
            if(this.state.editableTextInputField !== null) {
                this.state.editableTextInputField.blur();
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
                    if (!this.state.shiftKeyPressed) {
                        point.round(20);
                    }

                    var nearestNode = this.visualizations.getNearestNode(point);
                    if (nearestNode.node && nearestNode.distance < 40) {
                        this.state.futureEdge.end = nearestNode.node.getAnchorPointFrom(this.state.futureEdge.start);
                    } else {
                        this.state.futureEdge.end = point;
                    }
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(this.state.futureEdge.end);
                } else if (this.state.futureEdgeFrom !== null) {
                    if(!this.state.futureEdgeFromValid) {
                        // See if the user has dragged outside the node
                        var distance = point.getDistanceTo(this.state.futureEdgeFrom.position);
                        if(distance > this.state.futureEdgeFrom.radius) {
                            this.state.futureEdgeFromValid = true;
                        }
                    }
                    // Check again becuase it may have changed in the above if block
                    if(this.state.futureEdgeFromValid) {
                        this.state.futureEdge = new Visualization.FutureEdgeVisualization(event.point.getMPoint(), event.point.getMPoint());
                        this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                        this.state.futureEdge.addTo(this.svg);
                    }
                }
            } else if(this.state.mode === BoardMode.MOVE && (this.state.draggingNode || this.state.modifyEdgeControl || this.state.isDraggingBoard)) {
                var snappedPoint = point.getMPoint();
                if(!this.state.shiftKeyPressed) {
                    snappedPoint.round(20);
                }

                if(this.state.draggingNode) {
                    var oldDraggingNodePoint = this.state.draggingNode.position.getMPoint();
                    this.state.draggingNode.position = snappedPoint;
                    var newDraggingNodePoint = this.state.draggingNode.position;

                    var updateFn: (edgeModel: Edge) => void = null;

                    /// Allow toggling off control point re-drawing. CTRL Key is not the best key but will do for now
                    if(!this.state.ctrlKeyPressed) {

                        var adjustedEdges: Object = {};

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
                    
                    if(!this.state.shiftKeyPressed) {
                        point.round(20);
                    }                 
                    point.subtract(this.state.lastMousePoint);

                    this.visualizations.nodes.forEach((nodeV: Visualization.NodeVisualization) => {
                        nodeV.position.add(point);
                    });
                    this.visualizations.edges.forEach((edgeV: Visualization.EdgeVisualization) => {
                        var controlPoint: Point.MPoint = null;

                        // Only bother keeping the relative location of the control point if it has been moved
                        if(edgeV.hasMovedControlPoint()) {
                            controlPoint = edgeV.control.add(point);
                        }
                        edgeV.recalculatePath(controlPoint?controlPoint: null);
                    });
                }
                this.visualizations.update();
            } else if(this.state.mode === BoardMode.ERASE && this.state.isErasing) {
                this.handleErasing(point);
            }
            
            var snappedMousePoint = event.point.getMPoint();
            
            if(!this.state.shiftKeyPressed) {
                snappedMousePoint.round(20);
            }

            this.state.lastMousePoint = snappedMousePoint;
        }

        /**
         * Handles erasing at a point
         * @param point
         */
        private handleErasing(point: Point.IPoint) {

            // If we are hovering over an edge and we have not yet erased at least the first edge model from it yet
            if(this.state.hoveringEdge && this.graph.hasEdge(this.state.hoveringEdge.models.items[0])) {
                var cmd = new Command.EraseEdgeCommand(this, this.state.hoveringEdge);
                this.invocationStack.trackExecution(cmd);
            }
            // If we are hovering over a specific transition and have not already erased it
            else if(this.state.hoveringTransition && this.graph.hasEdge(this.state.hoveringTransition)) {
                var cmd1 = new Command.EraseEdgeTransitionCommand(this, this.state.hoveringTransition);
                this.invocationStack.trackExecution(cmd1);
            } else {
                var nearestNode = this.visualizations.getNearestNode(point);
                if(nearestNode.node && nearestNode.hover) {
                    var cmd2 = new Command.EraseNodeCommand(this, nearestNode.node);
                    this.invocationStack.trackExecution(cmd2);
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
            // Do not alow any undo/redo, mode changes, or node settings while drawing new edge
            if(this.state.futureEdgeFrom !== null) {
                return;
            }
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
                    if(this.isModifierKeyPressed()) {
                        this.invocationStack.redo();
                        event.preventDefault();
                    }
                    return false;
                    break;

                case 90: // Z (For CTRL-Z)
                    if(this.isModifierKeyPressed()) {
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
        
        private isModifierKeyPressed() {
            return this.platformIsApple? this.state.metaKeyPressed: this.state.ctrlKeyPressed;
        }

        public getBounds() {
            var minX = Number.MAX_VALUE,
                maxX = 0,
                minY = Number.MAX_VALUE,
                maxY = 0,
                posX: number,
                posY: number,
                radius: number,
                curMinX: number,
                curMaxX: number,
                curMinY: number,
                curMaxY: number;


            this.visualizations.nodes.forEach((node: Visualization.NodeVisualization) => {
                posX = node.position.x;
                posY = node.position.y;
                radius = node.radius;

                curMinX = posX - radius;
                curMaxX = posX + radius;

                curMinY = posY - radius;
                curMaxY = posY + radius;

                if(node.model.final) {
                    curMinX -= 20;
                }

                minX = Math.min(curMinX, minX);
                maxX = Math.max(curMaxX, maxX);
                minY = Math.min(curMinY, minY);
                maxY = Math.max(curMaxY, maxY);
            });

            var startPos: Point.MPoint,
                endPos: Point.MPoint,
                controlPos: Point.MPoint;

            this.visualizations.edges.forEach((edge: Visualization.EdgeVisualization) => {
                startPos = edge.start;
                controlPos = edge.control;
                endPos = edge.end;
                curMinX = Math.min(startPos.x, controlPos.x, endPos.x);
                curMaxX = Math.max(startPos.x, controlPos.x, endPos.x);

                curMinY = Math.min(startPos.y, controlPos.y, endPos.y);
                curMaxY = Math.max(startPos.y, controlPos.y, endPos.y);

                minX = Math.min(curMinX, minX);
                maxX = Math.max(curMaxX, maxX);
                minY = Math.min(curMinY, minY);
                maxY = Math.max(curMaxY, maxY);
            });

            return {
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY
            };
        }

        public toLaTeX(): string {
            var texData = '';

            var bounds = this.getBounds();

            var minX = bounds.minX,
                maxX = bounds.maxX,
                minY = bounds.minY,
                maxY = bounds.maxY;


            var offsetPoint = new Point.IMPoint(minX, minY);

            this.visualizations.nodes.forEach((node: Visualization.NodeVisualization) => {
                var pos = node.position.getMPoint().subtract(offsetPoint).round();
                texData += '    \\draw (' + pos.x + ',' + pos.y + ') circle (' + node.radius + '); \n';
                texData += '    \\draw (' + pos.x + ',' + pos.y + ') node[nodeLabel] {$' + node.model.label + '$}; \n';

                if(node.model.final) {
                    texData += '    \\draw (' + pos.x + ',' + pos.y + ') circle (' + (node.radius - 2) + '); \n';
                }

                if(node.model.initial) {
                    texData += '    \\draw (' + (pos.x - node.radius) + ',' + pos.y + ') -- (' + (pos.x - node.radius - 20) + ',' + (pos.y - 20) + ') -- (' + (pos.x - node.radius - 20) + ',' + (pos.y + 20) + ') --  cycle;\n';
                }
            });


            this.visualizations.edges.forEach((edge: Visualization.EdgeVisualization) => {
                var startPos = edge.start.getMPoint().subtract(offsetPoint).round(),
                    endPos = edge.end.getMPoint().subtract(offsetPoint).round(),
                    controlPos = edge.control.getMPoint().subtract(offsetPoint).round();

                // Need to convert to cubic Bezier points instead of quadratic Bezier.
                var cubicControlPos1 = new Point.MPoint((1/3) * startPos.x + (2/3) * controlPos.x, (1/3) * startPos.y + (2/3) * controlPos.y).round(),
                    cubicControlPos2 = new Point.MPoint((2/3) * controlPos.x + (1/3) * endPos.x, (2/3) * controlPos.y + (1/3) * endPos.y).round();
                texData += '    \\draw [edge] (' + startPos.x + ',' + startPos.y + ') .. controls(' + cubicControlPos1.x + ',' + cubicControlPos1.y + ') and (' + cubicControlPos2.x + ',' + cubicControlPos2.y + ') .. (' + endPos.x + ',' + endPos.y  + '); \n';

                edge.models.items.forEach((edgeModel: Edge) => {
                   var textPos = edge.getTransitionPoint(edgeModel.visualizationNumber).getMPoint().subtract(offsetPoint).round(),
                       textContent = edgeModel.transition.toString();
                    if(textContent === jsflap.LAMBDA) {
                        textContent = '\\lambda';
                    } else if(textContent === jsflap.BLANK) {
                        textContent = '\\Box';
                    }
                    texData += '    \\draw (' + textPos.x + ', ' + textPos.y + ') node[edgeTransition] {$' + textContent + '$}; \n';
                });
            });

            return '\\documentclass[12pt]{article}\n' +
                '\\usepackage{tikz}\n' +
                '\\usetikzlibrary{arrows.meta}\n' +
                '\n' +
                '\\begin{document}\n' +
                '\n' +
                '\\begin{center}\n' +
                '\\resizebox{\\columnwidth}{!}{\n' +
                '    \\begin{tikzpicture}[y=-1, x = 1]\n' +
                '    \\tikzstyle{nodeLabel}+=[inner sep=0pt, font=\\large]\n' +
                '    \\tikzstyle{edge}+=[-{Latex[length=5, width=7]}]\n' +
                '    \\tikzstyle{edgeTransition}+=[draw=white, fill=white, inner sep = 1] \n' +
                texData +
                '    \\end{tikzpicture}\n' +
                '}\n' +
                '\\end{center}\n' +
                '\n' +
                '\\end{document}\n';
        }

    }
}
