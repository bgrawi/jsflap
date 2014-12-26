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
        public model: Edge;

        /**
         * The path value for the visualization
         */
        public path;

        /**
         * Creates the node
         * @param start
         * @param end
         * @param control
         * @param model
         */
        constructor(model: Edge, start: Visualization.NodeVisualization, end: Visualization.NodeVisualization, control?: Point.MPoint) {
            this.model = model;
            this.model.setVisualization(this);
            this.recalculatePath(start, end, control);
        }

        /**
         * Recalculates the path between nodes and a possibly already given control point
         * @param start
         * @param end
         * @param control
         */
        recalculatePath(start: NodeVisualization, end: NodeVisualization, control?: Point.MPoint) {
            if(start !== end) {
                this.start = start.getAnchorPointFrom(end.position);
                this.end = end.getAnchorPointFrom(start.position);
                this.control = control? control: new Point.MPoint((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
            } else {
                var anchorPoints = start.getSelfAnchorPoints();
                this.start = anchorPoints[0];
                this.end = anchorPoints[1];
                this.control = control? control: new Point.MPoint((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2 - 80);
            }
        }

        /**
         * Gets the path string
         */
        getPath() {
            return 'M' + this.start + ' Q' + this.control + ' ' + this.end;
        }

        /**
         * Gets the position of where the transition text should be
         * @returns {jsflap.Point.IMPoint}
         */
        getTransitionPoint() {

            // Quadratic Bezier Curve formula evaluated halfway
            var t = 0.5,
                x = (1 - t) * (1 - t) * this.start.x + 2 * (1 - t) * t * this.control.x + t * t * this.end.x,
                y = (1 - t) * (1 - t) * this.start.y + 2 * (1 - t) * t * this.control.y + t * t * this.end.y;
            return new Point.IMPoint(x, y);
        }
    }
}