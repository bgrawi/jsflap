module jsflap.Point {

    /**
     * The point interface
     */
    export interface IPoint {
        x: number;
        y: number;
        getMutablePoint(): MutablePoint;
        getImmutablePoint(): ImmutablePoint;
        getDistanceTo(point: IPoint): number;
    }
}