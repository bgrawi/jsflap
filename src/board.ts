
module jsflap {
    export class MouseEvent {
        public event: D3.D3Event;
        public point: Point.ImmutablePoint;
        constructor(event: D3.D3Event, context: any) {
            this.event = event;
            var rawPoint = d3.mouse(context);
            this.point = new Point.ImmutablePoint(rawPoint[0], rawPoint[1]);
        }
    }
    export class Board {

        /**
         * The actual svg element being used
         */
        private svg: D3.Selection;

        /**
         * The graph containing the edges and nodes
         */
        private graph: Graph.IGraph;

        /**
         * The futureEdge when the user is dragging
         */
        private futureEdge: Visualization.FutureEdgeVisualization;

        constructor(svg: Element, graph: Graph.IGraph) {
            this.svg = d3.select(svg);
            this.graph = graph;

            this.setupBindings();
        }

        private setupBindings() {
            var _this = this;
            this.svg.on('mouseup', function() {
                _this.mouseup(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousedown', function() {
                _this.mousedown(new MouseEvent(d3.event, this));
            });
            this.svg.on('mousemove', function() {
                _this.mousemove(new MouseEvent(d3.event, this));
            });
        }

        private mouseup(event: MouseEvent) {
            if(this.futureEdge) {
                this.futureEdge = null;

            }
            var node = this.graph.addNode('q' + this.graph.getNodes().size);
            var nodeVisualization = new Visualization.NodeVisualization(event.point.getMutablePoint(), node);
            nodeVisualization.addTo(this.svg);
        }

        private mousedown(event: MouseEvent) {
            event.event.preventDefault();
            this.futureEdge = new Visualization.FutureEdgeVisualization(event.point.getMutablePoint(), event.point.getMutablePoint());
            this.futureEdge.addTo(this.svg);
        }
        private mousemove(event: MouseEvent) {
            if(this.futureEdge) {
                console.log('HEHE' + event.point);
                this.futureEdge.elm.attr('x2', event.point.x);
                this.futureEdge.elm.attr('y2', event.point.y);
            }
        }
    }
}