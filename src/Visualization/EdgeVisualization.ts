module jsflap.Visualization {
    export class EdgeVisualization {

        /**
         * The start point
         */
        public start: Point.MPoint;

        /**
         * The end point
         */
        public end: Point.MPoint;

        /**
         * The control point
         */
        public control: Point.MPoint;

        /**
         * The actual model that this is representing
         */
        public models: EdgeList;

        /**
         * The start node model
         */
        public fromModel: Node;

        /**
         * The end node model
         */
        public toModel: Node;

        /**
         * The path value for the visualization
         */
        public path;

        /**
         * Creates the node
         * @param start
         * @param end
         * @param control
         * @param models
         */
        constructor(models: any, start: Visualization.NodeVisualization, end: Visualization.NodeVisualization, control?: Point.MPoint) {
            var edgeListModels: Array<Edge>;
            if(typeof models === 'array') {
                edgeListModels = models;
            } else if(models instanceof Edge) {
                edgeListModels = [models];
            }
            this.models = new EdgeList();
            edgeListModels.forEach((edge: Edge) => this.addEdgeModel(edge));
            this.recalculatePath(start, end, control);
        }

        /**
         * Adds an edge model to this visualization
         * @param edge
         */
        public addEdgeModel(edge: Edge): Edge {
            if(!this.fromModel || !this.toModel) {
                this.fromModel = edge.from;
                this.toModel = edge.to;
                edge.setVisualization(this, this.models.edges.length);
                return this.models.add(edge);
            } else if(edge.from === this.fromModel && edge.to === this.toModel) {
                edge.setVisualization(this, this.models.edges.length);
                return this.models.add(edge);
            } else {
                return null;
            }
        }

        /**
         * Recalculates the path between nodes and a possibly already given control point
         * @param start
         * @param end
         * @param control
         */
        public recalculatePath(start: NodeVisualization, end: NodeVisualization, control?: Point.MPoint) {
            var pointOffset = new Point.MPoint(0, 0);
            if(start !== end) {
                this.start = start.getAnchorPointFrom(control? control: end.position);
                this.end = end.getAnchorPointFrom(control? control: start.position);
                this.control = control? control: this.getInitialControlPoint(pointOffset)
            } else {
                var anchorPoints = start.getSelfAnchorPoints(control);
                this.start = anchorPoints[0];
                this.end = anchorPoints[1];
                pointOffset.y -= 80;
                this.control = control? control: this.getInitialControlPoint(pointOffset);
            }

        }

        /**
         * Gets the intial control point with a given offset
         * @param pointOffset
         * @returns {jsflap.Point.MPoint}
         */
        public getInitialControlPoint(pointOffset?: Point.IPoint) {
            return new Point.MPoint(
                ((this.start.x + this.end.x) / 2) + (pointOffset? pointOffset.x: 0),
                ((this.start.y + this.end.y) / 2) + (pointOffset? pointOffset.y: 0)
            );
        }

        /**
         * Determines if the control point has been moved from the start
         * @param start
         * @param end
         * @returns {boolean}
         */
        public hasMovedControlPoint(start: NodeVisualization, end: NodeVisualization): boolean {
            var initialControlPoint;
            if(start !== end) {
                initialControlPoint = this.getInitialControlPoint();
            } else {
                initialControlPoint = this.getInitialControlPoint(new Point.IMPoint(0, -80));
            }
            return !(Math.abs(this.control.x - initialControlPoint.x) <= 1 && Math.abs(this.control.y - initialControlPoint.y) <= 1);
        }

        /**
         * Gets the path string
         */
        public getPath(): string {
            return 'M' + this.start + ' Q' + this.control + ' ' + this.end;
        }

        /**
         * Gets the position of where the transition text should be
         * @returns {jsflap.Point.IMPoint}
         */
        public getTransitionPoint(modelNumber?: number): Point.IMPoint {
            // Quadratic Bezier Curve formula evaluated halfway
            var t = 0.5,
                x = (1 - t) * (1 - t) * this.start.x + 2 * (1 - t) * t * this.control.x + t * t * this.end.x,
                y = (1 - t) * (1 - t) * this.start.y + 2 * (1 - t) * t * this.control.y + t * t * this.end.y - (this.getDirection() * (modelNumber? modelNumber: 0) * 20);
            return new Point.IMPoint(x, y);
        }

        /**
         * Gets the direction of the edge
         * @returns {number} 1: right, -1: left
         */
        public getDirection() {
            return this.start.x < this.end.x? 1: -1;
        }
    }
}