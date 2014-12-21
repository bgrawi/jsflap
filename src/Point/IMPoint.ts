///<reference path="MPoint.ts"/>
module jsflap.Point {
    /**
     * The point class
     */
    export class IMPoint extends MPoint implements IPoint {

        /**
         * Create a new imutable point
         * @param x
         * @param y
         */
        constructor(x: number, y: number) {
            super(x, y);
        }

        static set x(value) {
            throw new Error("Can't change coordinates of an immutable point");
        }

        static set y(value) {
            throw new Error("Can't change coordinates of an immutable point");
        }
    }
}