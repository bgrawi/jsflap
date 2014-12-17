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
        private model: Edge;

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
    }
}