module jsflap.Transition {

    /**
     * The interface all transitions follow
     */
    export interface ITransition {
        pending: boolean;
        toString(): string;
        getTransitionParts(): ITransitionPart[];
        clone(): ITransition;
    }

}