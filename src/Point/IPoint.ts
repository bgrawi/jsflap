module jsflap.Point {

    /**
     * The point interface
     */
    export interface IPoint {
        x: number;
        y: number;
        getMPoint(): MPoint;
        getIMPoint(): IMPoint;
        getDistanceTo(point: IPoint): number;
        getAngleTo(point: IPoint): number;
    }
}