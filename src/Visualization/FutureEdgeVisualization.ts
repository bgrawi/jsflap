module jsflap.Visualization {
    export class FutureEdgeVisualization {

        /**
         * The location of the node
         */
        public start: Point.IPoint;

        /**
         * The location of the node
         */
        public end: Point.IPoint;

        /**
         * The actual line elm
         */
        public elm: D3.Selection;

        /**
         * Creates the node
         * @param start
         * @param end
         */
        constructor(start: Point.MutablePoint, end: Point.MutablePoint) {
            this.start = start;
            this.end = end;
            this.elm = null;
        }

        addTo(svg: D3.Selection) {
            this.elm = svg.append('line')
                .attr("x1", this.start.x)
                .attr("y1", this.start.y)
                .attr("x2", this.end.x)
                .attr("y2", this.end.y)
                .attr('stroke', "#888");
        }
    }
}