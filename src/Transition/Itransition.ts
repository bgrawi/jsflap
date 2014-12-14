module jsflap.Transition {

    /**
     * The interface all transitions follow
     */
    export interface ITransition {}

    /**
     * A Transition of a single character in an NFA
     */
    export class NFATransition implements ITransition {

        /**
         * The character transition
         */
        public character: string;

        constructor(character: string) {
            this.character = character;
        }
    }
}