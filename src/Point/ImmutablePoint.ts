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
         * Create a new immutable point
         * @param x
         * @param y
         */
        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
        }
    }
}