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

        /**
         * Adds a point
         * @param other
         */
        public add(other: Point.IPoint): MPoint {
            this.x += other.x;
            this.y += other.y;
            return this;
        }

        /**
         * Subtracts a point
         * @param other
         */
        public subtract(other: Point.IPoint): MPoint {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        }

        /**
         * Rounds this point to the nearest pixel
         */
        public round(precision?:number): MPoint {
            if(!precision) {
                precision = 1;
            }
            this.x = Math.round(this.x / precision) * precision;
            this.y = Math.round(this.y / precision) * precision;
            return this;
        }

        /**
         * Helper function to generate a new point that is the midpoint between two other points
         * @param point1
         * @param point2
         * @returns {jsflap.Point.MPoint}
         */
        static getMidpoint(point1: Point.IPoint, point2: Point.IPoint): Point.MPoint {
            return new Point.MPoint(
                ((point1.x + point2.x) / 2),
                ((point1.y + point2.y) / 2)
            );
        }

        /**
         * Gets the normal offset point based on two points, an offset, and an option initial theta
         * @param point1
         * @param point2
         * @param distance
         * @param theta0
         * @returns {jsflap.Point.MPoint}
         */
        static getNormalOffset(point1: Point.IPoint, point2: Point.IPoint, distance: number, theta0: number = Math.PI / 2): Point.MPoint {
            var theta1 = point1.getAngleTo(point2) + theta0;
            return new Point.MPoint(distance * Math.cos(theta1), distance * Math.sin(theta1));
        }

        /**
         * Gets the coordinates as a string separated by a comma and a space: "x, y"
         * @returns {string}
         */
        public toString() {
            return this.x + ', ' + this.y;
        }
    }
}