module jsflap.Point {

    /**
     * The point class which is immutable
     */
    export class ImmutablePoint implements IPoint {

        /**
         * The x dimension coordinate
         */
        private _x: number;

        /**
         * The y dimension coordinate
         */
        private _y: number;

        /**
         * Gets the x dimension
         * @returns {number}
         */
        get x() {
            return this._x;
        }

        /**
         * Gets the y dimension
         * @returns {number}
         */
        get y() {
            return this._y;
        }

        /**
         * Gets a mutable point from this immutable one
         * @returns {jsflap.Point.MutablePoint}
         */
        getMutablePoint(): Point.MutablePoint {
            return new Point.MutablePoint(this._x, this._y);
        }

        /**
         * Gets a mutable point from this immutable one
         * @returns {jsflap.Point.ImmutablePoint}
         */
        getImmutablePoint(): Point.ImmutablePoint {
            return new Point.ImmutablePoint(this.x, this.y);
        }

        /**
         * Create a new immutable point
         * @param x
         * @param y
         */
        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
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