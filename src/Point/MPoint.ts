module jsflap.Point {

    /**
     * The point class
     */
    export class MPoint implements IPoint {

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
         * @returns {jsflap.Point.MPoint}
         */
        public getMPoint(): Point.MPoint {
            return new Point.MPoint(this.x, this.y);
        }

        /**
         * Gets a mutable point from this immutable one
         * @returns {jsflap.Point.IMPoint}
         */
        public getIMPoint(): Point.IMPoint {
            return new Point.IMPoint(this.x, this.y);
        }

        /**
         * Gets the distance between two points
         * @param other
         * @returns {number}
         */
        public getDistanceTo(other: Point.IPoint): number {
            return Math.sqrt(
                Math.pow(this.x - other.x, 2) +
                Math.pow(this.y - other.y, 2)
            );
        }

        /**
         * Gets the angle between two points
         * @param other
         * @returns {number}
         */
        public getAngleTo(other: Point.IPoint): number {
            return Math.atan2((this.y - other.y), (this.x - other.x));
        }

        public toString() {
            return this.x + ', ' + this.y;
        }
    }
}