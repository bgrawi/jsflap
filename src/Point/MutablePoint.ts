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
    }
}