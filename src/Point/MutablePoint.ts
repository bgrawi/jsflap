module jsflap.Point {

    /**
     * The point class
     */
    export class MutablePoint implements IPoint {

        /**
         * The x dimension coordinate
         */
        public x: number;

        /**
         * The y dimension coordinate
         */
        public y: number;

        /**
         * Create a new mutable point
         * @param x
         * @param y
         */
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        /**
         * Gets a mutable point from this immutable one
         * @returns {jsflap.Point.MutablePoint}
         */
        getMutablePoint(): Point.MutablePoint {
            return new Point.MutablePoint(this.x, this.y);
        }

        /**
         * Gets a mutable point from this immutable one
         * @returns {jsflap.Point.ImmutablePoint}
         */
        getImmutablePoint(): Point.ImmutablePoint {
            return new Point.ImmutablePoint(this.x, this.y);
        }

        /**
         * Gets the distance between two points
         * @param point
         * @returns {number}
         */
        getDistanceTo(point: Point.IPoint): number {
            return Math.sqrt(
                Math.pow(this.x - point.x, 2) +
                Math.pow(this.y - point.y, 2)
            );
        }
    }
}