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
            this.visualizations = new Visualization.VisualizationCollection(this.svg);
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
                this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start);

                this.addEdge(this.state.futureEdgeFrom, endingNode, this.state.futureEdge);
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
                nodeV = new Visualization.NodeVisualization(point.getMutablePoint(), node);
            return this.visualizations.addNode(nodeV);
        }

        /**
         * Adds an edge to the board given two nodes and a future edge
         * @param from
         * @param to
         * @param futureEdge
         */
        public addEdge(from: Visualization.NodeVisualization, to: Visualization.NodeVisualization, futureEdge: Visualization.FutureEdgeVisualization) {
            var edge = this.graph.addEdge(from.model, to.model, LAMBDA),
                edgeV = new Visualization.EdgeVisualization(futureEdge.start, futureEdge.end, edge);
            futureEdge.remove();
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
            } else {
                this.addNode(event.point);
            }
        }

        /**
         * Mousemove event listener
         * @param event
         */
        private mousemove(event: MouseEvent) {
            var point = event.point.getMutablePoint();

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
                if(this.state.futureEdgeFrom.position.getDistanceTo(event.point) > 20) {
                    this.state.futureEdge = new Visualization.FutureEdgeVisualization(event.point.getMutablePoint(), event.point.getMutablePoint());
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                    this.state.futureEdge.addTo(this.svg);
                }
            }
        }

        private keydown(event) {
            if(event.which === 16 && !this.state.futureEdgeSnapping) {
                this.state.futureEdgeSnapping = true;
            }
        }

        private keyup(event) {
            if(event.which === 16 && this.state.futureEdgeSnapping) {
                this.state.futureEdgeSnapping = false;
            }
        }
    }
}