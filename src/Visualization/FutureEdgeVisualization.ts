module jsflap.Visualization {
    export class FutureEdgeVisualization {

        /**
         * The start point
         */
        private _start: Point.MPoint;

        /**
         * The end point
         */
        private _end: Point.MPoint;

        /**
         * The actual line elm
         */
        public elm: D3.Selection;

        /**
         * Creates the node
         * @param start
         * @param end
         */
        constructor(start: Point.MPoint, end: Point.MPoint) {
            this._start = start;
            this._end = end;
            this.elm = null;
        }

        /**
         * Adds the visualization to the svg
         * @param svg
         */
        addTo(svg: D3.Selection) {
            this.elm = svg.append('line')
                .attr('stroke', "#888");
            this.update();
        }

        /**
         * Removes the element from the svg
         */
        remove() {
            this.elm.remove();
            this.elm = null;
        }

        /**
         * Sets the starting point and updates the element if it exists
         * @param point
         */
        set start(point: Point.IPoint) {
            this._start.x = point.x;
            this._start.y = point.y;
            if(this.elm && point) {
                this.elm
                    .attr('x1', point.x)
                    .attr('y1', point.y);
            }
        }

        /**
         * Gets the starting point
         * @returns {Point.IPoint}
         */
        get start(): Point.IPoint {
            return this._start;
        }

        /**
         * Sets the ending point and updates the element if it exists
         * @param point
         */
        set end(point: Point.IPoint) {
            this._end.x = point.x;
            this._end.y = point.y;
            if(this.elm && point) {
                this.elm
                    .attr('x2', point.x)
                    .attr('y2', point.y);
            }
        }

        /**
         * Gets the ending point
         * @returns {Point.MPoint}
         */
        get end(): Point.IPoint {
            return this._end;
        }

        /**
         * Refresh the start and end points
         */
        update() {

            // Updates the start/end points
            this.start = this._start;
            this.end = this._end;
        }
    }
}