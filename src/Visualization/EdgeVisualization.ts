module jsflap.Visualization {
    export class EdgeVisualization {

        /**
         * The start point
         */
        private start: Point.MutablePoint;

        /**
         * The end point
         */
        private end: Point.MutablePoint;

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
         * @param model
         */
        constructor(start: Point.MutablePoint, end: Point.MutablePoint, model: Edge) {
            this.start = start;
            this.end = end;
            this.model = model;
        }

        get pathCoords() {
            var midpointX =  (this.start.x + this.end.x) / 2,
                midpointY =  (this.start.y + this.end.y) / 2;
            return [
                this.start,
                new Point.MutablePoint(midpointX, midpointY),
                this.end
            ];
        }
    }
}