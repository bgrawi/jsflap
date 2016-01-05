module jsflap.Board {
    
    export enum TransitionStyle {
        UPRIGHT,
        PERPENDICULAR
    }
    
    export interface BoardSettings {
        theme: string;
        transitionStyle: TransitionStyle;
    }
}