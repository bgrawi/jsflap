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
        private graph: Graph.IGraph;

        /**
         * The current state of the board
         */
        public state: BoardState;

        /**
         * The visualizations
         */
        private visualizations: Visualization.VisualizationCollection;

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
            this.svg.on('mouseup', function () {
                _this.mouseup(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousedown', function () {
                _this.mousedown(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousemove', function () {
                _this.mousemove(new MouseEvent(d3.event, this));
            });
            this.svg.on('touchmove', function () {
                _this.mousemove(new MouseEvent(d3.event, this));
            });
            this.svg.on("contextmenu", function() {
                $rootScope.$broadcast('contextmenu', {options: _this.state.contextMenuOptions, event: d3.event});
                _this.state.contextMenuOptions = null;
                d3.event.preventDefault();
            });
            document.addEventListener('keydown', function (event) {
                _this.keydown(event);
                $rootScope.$digest();
            });
            document.addEventListener('keyup', function (event) {
                _this.keyup(event);
                $rootScope.$digest();
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
                    var nearestNode = this.visualizations.getNearestNode(this.state.futureEdge.end);
                    var endingNode;
                    if (nearestNode.node && nearestNode.distance < 40) {
                        endingNode = nearestNode.node;
                    } else {
                        endingNode = this.addNode(this.state.futureEdge.end);
                    }
                    this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;

                    var newEdge = this.addEdge(this.state.futureEdgeFrom, endingNode);
                    setTimeout(() => {
                        var elm = this.svg.select('g.edgeTransitions:last-child text.transition:last-child');
                        if (elm.length > 0) {
                            this.visualizations.editTransition(newEdge.models.edges[newEdge.models.edges.length - 1], <SVGTextElement> elm.node());
                        }
                    }, 10);
                    this.state.futureEdge.remove();
                    this.state.futureEdge = null;
                    this.state.futureEdgeFrom = null;
                }

                this.state.futureEdgeFrom = null;
            } else if(this.state.mode === BoardMode.MOVE) {
                this.state.draggingNode = null;
                this.state.modifyEdgeControl = null;
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

            if(this.nodeCount === 1) {
                this.setInitialNode(nodeV);
            }
            return this.visualizations.addNode(nodeV);
        }

        /**
         * Adds an edge to the board given two nodes and a future edge
         * @param from
         * @param to
         * @param transition
         */
        public addEdge(from: Visualization.NodeVisualization, to: Visualization.NodeVisualization, transition?: Transition.ITransition) {
            var edge = this.graph.addEdge(from.model, to.model, transition || LAMBDA);
            var foundEdgeV = this.visualizations.getEdgeVisualizationByNodes(from.model, to.model);
            if(foundEdgeV) {
                console.log('GOT HERE');
                foundEdgeV.addEdgeModel(edge);
                this.visualizations.update();
                return foundEdgeV;
            } else {
                var edgeV = new Visualization.EdgeVisualization(edge, from, to);
                return this.visualizations.addEdge(edgeV);
            }
        }

        /**
         * Updates a edge's transition by also updating all known hashes as well
         * @param edge
         * @param transition
         */
        public updateEdgeTransition(edge: Edge, transition: Transition.ITransition) {
            var oldHash = edge.toString();
            edge.transition = transition;
            this.graph.getEdges().updateEdgeHash(oldHash);
            edge.visualization.models.updateEdgeHash(oldHash);
            edge.from.toEdges.updateEdgeHash(oldHash);
            edge.to.fromEdges.updateEdgeHash(oldHash);
        }

        /**
         * Sets the initial node for the graph
         * @param node
         */
        public setInitialNode(node: Visualization.NodeVisualization) {
            if(node) {
                this.graph.setInitialNode(node.model);
            } else {
                this.graph.setInitialNode(null);
            }
        }

        /**
         * Marks the final node for the graph
         * @param node
         */
        public markFinalNode(node: Visualization.NodeVisualization) {
            this.graph.markFinalNode(node.model);
        }

        /**
         * Unmarks the final node for the graph
         * @param node
         */
        public unmarkFinalNode(node: Visualization.NodeVisualization) {
            this.graph.unmarkFinalNode(node.model);
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

                    // Only add a node if the user is not currently click out of editing a transition OR is near a node

                    this.state.futureEdgeFrom = this.addNode(event.point);
                }
            } else if(this.state.mode === BoardMode.MOVE) {
                if (nearestNode.node && nearestNode.hover) {
                    this.state.draggingNode = nearestNode.node;
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
            this.state.lastMousePoint = event.point.getMPoint();

            if(event.event.which > 1) {
                return false;
            }

            if(this.state.mode === BoardMode.DRAW) {

                if (this.state.futureEdge !== null) {
                    if (this.state.futureEdgeSnapping) {
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
            } else if(this.state.mode === BoardMode.MOVE && (this.state.draggingNode || this.state.modifyEdgeControl)) {
                var newPoint = point.getMPoint();
                if(this.state.futureEdgeSnapping) {
                    newPoint.x = (Math.round(newPoint.x / 20) * 20);
                    newPoint.y = (Math.round(newPoint.y / 20) * 20);
                }

                if(this.state.draggingNode) {
                    this.state.draggingNode.position = newPoint;
                    this.state.draggingNode.model.toEdges.edges.forEach((edgeModel) => {
                        var hasMovedControlPoint = edgeModel.visualization.hasMovedControlPoint(edgeModel.from.visualization, edgeModel.to.visualization);
                        edgeModel.visualization.recalculatePath(edgeModel.from.visualization, edgeModel.to.visualization, hasMovedControlPoint? edgeModel.visualization.control: null);
                    });

                    this.state.draggingNode.model.fromEdges.edges.forEach((edgeModel) => {
                        var hasMovedControlPoint = edgeModel.visualization.hasMovedControlPoint(edgeModel.from.visualization, edgeModel.to.visualization);
                        edgeModel.visualization.recalculatePath(edgeModel.from.visualization, edgeModel.to.visualization, hasMovedControlPoint? edgeModel.visualization.control: null);
                    });
                } else {
                    // Can only be modify Edge control now
                    this.state.modifyEdgeControl.recalculatePath(this.state.modifyEdgeControl.fromModel.visualization, this.state.modifyEdgeControl.toModel.visualization, newPoint)
                }
                this.visualizations.update();
            } else if(this.state.mode === BoardMode.ERASE && this.state.isErasing) {
                this.handleErasing(point);
            }
        }

        /**
         * Handles erasing at a point
         * @param point
         */
        private handleErasing(point: Point.IPoint) {
            if(this.state.hoveringEdge) {
                this.state.hoveringEdge.models.edges.forEach((edge: Edge) => this.graph.removeEdge(edge));
                this.visualizations.removeEdge(this.state.hoveringEdge);
            } else {
                var nearestNode = this.visualizations.getNearestNode(point);
                if(nearestNode.node && nearestNode.hover) {

                    // Need to copy the edges because when the edges are deleted, the indexing gets messed up
                    var toEdges = nearestNode.node.model.toEdges.edges.slice(0);
                    toEdges.forEach((edgeModel) => {
                        console.log(edgeModel.toString());

                        this.graph.removeEdge(edgeModel);
                        this.visualizations.removeEdge(edgeModel.visualization);
                    });

                    var fromEdges = nearestNode.node.model.fromEdges.edges.slice(0);
                    fromEdges.forEach((edgeModel) => {
                        this.graph.removeEdge(edgeModel);
                        this.visualizations.removeEdge(edgeModel.visualization);
                    });
                    this.graph.removeNode(nearestNode.node.model);
                    this.visualizations.removeNode(nearestNode.node);
                }
            }
        }

        /**
         * The keydown event listener
         * @param event
         */
        private keydown(event) {
            if(event.which === 16 && !this.state.futureEdgeSnapping) {
                this.state.futureEdgeSnapping = true;
            }

            // if not editing a textbox
            if(this.state.modifyEdgeTransition === null) {
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
                        if(this.state.mode !== BoardMode.DRAW) {
                            this.state.mode = BoardMode.DRAW;
                            this.visualizations.update();
                        }
                        break;
                    case 69: // e
                        if(this.state.mode !== BoardMode.ERASE) {
                            this.state.mode = BoardMode.ERASE;
                            this.visualizations.update();
                        }
                        break;
                    case 77: // m
                        if(this.state.mode !== BoardMode.MOVE) {
                            this.state.mode = BoardMode.MOVE;
                            this.visualizations.update();
                        }
                        break;

                    // QUICK NODE SETTINGS
                    case 70: // f
                        var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                        if(nearestNode.node && nearestNode.hover) {
                            nearestNode.node.model.final? this.unmarkFinalNode(nearestNode.node): this.markFinalNode(nearestNode.node);
                            this.visualizations.update();
                        }
                        break;
                    case 73: // i
                        var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                        if(nearestNode.node && nearestNode.hover) {
                            this.setInitialNode(nearestNode.node);
                            this.visualizations.update();
                        }
                        break;
                }
            }
        }

        /**
         * The keyup event listener
         * @param event
         */
        private keyup(event) {
            if(event.which === 16 && this.state.futureEdgeSnapping) {
                this.state.futureEdgeSnapping = false;
            }

            if (event.which === 32) {
                this.state.draggingNode = null;
                this.state.modifyEdgeControl = null;
                this.state.mode = this.state.quickMoveFrom;
                this.state.quickMoveFrom = null;
                if(this.state.modifyEdgeControl) {
                    this.state.modifyEdgeControl = null;
                }
                this.visualizations.update();
            }

        }
    }
}