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
        private state: BoardState;

        /**
         * The visualizations
         */
        private visualizations: Visualization.VisualizationCollection;

        /**
         * Represents both the visualization and the graph underneath
         * @param svg
         * @param graph
         */
        constructor(svg: Element, graph: Graph.IGraph) {
            this.svg = d3.select(svg);
            this.boardBase = this.svg.append("rect")
                .attr("fill", "#FFFFFF")
                .attr("width", svg.getBoundingClientRect().width)
                .attr("height", svg.getBoundingClientRect().height);
            this.graph = graph;
            this.state = new BoardState();
            this.visualizations = new Visualization.VisualizationCollection(this.svg, this.state);
            this.registerBindings();
        }

        /**
         * Registers event bindings
         */
        private registerBindings() {
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
            document.addEventListener('keydown', function (event) {
                _this.keydown(event);
            });
            document.addEventListener('keyup', function (event) {
                _this.keyup(event);
            });
        }

        /**
         * Mouseup event listener
         * @param event
         */
        private mouseup(event: MouseEvent) {
            if (this.state.futureEdge) {
                var nearestNode = this.visualizations.getNearestNode(this.state.futureEdge.end);
                var endingNode;
                if(nearestNode.node && nearestNode.distance < 40) {
                    endingNode = nearestNode.node;
                } else {
                    endingNode = this.addNode(this.state.futureEdge.end);
                }
                this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;

                var newEdge = this.addEdge(this.state.futureEdgeFrom, endingNode);
                setTimeout(() => {
                    var elm = this.svg.select('text.transition:last-child');
                    if(elm.length > 0) {
                        this.visualizations.editTransition(newEdge, <SVGTextElement> elm.node());
                    }
                }, 10);
                this.state.futureEdge.remove();
                this.state.futureEdge = null;
                this.state.futureEdgeFrom = null;
            }

            this.state.futureEdgeFrom = null;
        }

        /**
         * Adds a node to the board
         * @param point
         * @returns {jsflap.Visualization.NodeVisualization}
         */
        public addNode(point: Point.IPoint): Visualization.NodeVisualization {
            var node = this.graph.addNode('q' + this.graph.getNodes().size),
                nodeV = new Visualization.NodeVisualization(node, point.getMPoint());
            return this.visualizations.addNode(nodeV);
        }

        /**
         * Adds an edge to the board given two nodes and a future edge
         * @param from
         * @param to
         * @param transition
         */
        public addEdge(from: Visualization.NodeVisualization, to: Visualization.NodeVisualization, transition?: Transition.ITransition) {
            var edge = this.graph.addEdge(from.model, to.model, transition || LAMBDA),
                edgeV = new Visualization.EdgeVisualization(edge, from, to);
            return this.visualizations.addEdge(edgeV);
        }

        /**
         * Mousedown event listener
         * @param event
         */
        private mousedown(event: MouseEvent) {
            event.event.preventDefault();


            var nearestNode = this.visualizations.getNearestNode(event.point);
            if(nearestNode.node && nearestNode.distance < 70) {
                this.state.futureEdgeFrom = nearestNode.node;
            } else if (this.state.modifyEdgeTransition === null) {

                // Only add a node if the user is not currently click out of editing a transition OR is near a node
                this.addNode(event.point);
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

            if (this.state.futureEdge !== null) {
                if(this.state.futureEdgeSnapping) {
                    var x1 = this.state.futureEdge.start.x,
                        x2 = point.x,
                        y1 = this.state.futureEdge.start.y,
                        y2 = point.y,
                        dx = x2 - x1,
                        dy = y2 - y1,
                        theta = Math.atan(dy/dx),
                        dTheta = Math.round(theta / (Math.PI / 4)) * (Math.PI / 4),
                        distance = Math.sqrt(
                            Math.pow(y2 - y1, 2) +
                            Math.pow(x2 - x1, 2)
                        ),
                        trigSide = dx >= 0? 1: -1;
                    if(dx !== 0) {
                        point.x = x1 + trigSide * distance * Math.cos(dTheta);
                        point.y = y1 + trigSide * distance * Math.sin(dTheta);
                    }
                }

                var nearestNode = this.visualizations.getNearestNode(point);
                if(nearestNode.node && nearestNode.distance < 40) {
                    this.state.futureEdge.end = nearestNode.node.getAnchorPointFrom(this.state.futureEdge.start);
                } else {
                    this.state.futureEdge.end = point;
                }
                this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(this.state.futureEdge.end);
            } else if(this.state.futureEdgeFrom !== null) {
                this.state.futureEdge = new Visualization.FutureEdgeVisualization(event.point.getMPoint(), event.point.getMPoint());
                this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                this.state.futureEdge.addTo(this.svg);
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
        }

        /**
         * The keyup event listener
         * @param event
         */
        private keyup(event) {
            if(event.which === 16 && this.state.futureEdgeSnapping) {
                this.state.futureEdgeSnapping = false;
            }
        }
    }
}