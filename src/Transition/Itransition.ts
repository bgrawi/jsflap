module jsflap.Transition {

    /**
     * The interface all transitions follow
     */
    export interface ITransition {
        toString(): string;
        getTransitionParts(): ITransitionPart[]
        clone(): ITransition;
    }

}