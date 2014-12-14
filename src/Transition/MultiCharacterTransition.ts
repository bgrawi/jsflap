module jsflap.Transition {

    /**
     * A Transition of a multi character in an DFA
     */
    export class MultiCharacterTransition implements ITransition {

        /**
         * The characters transition
         */
        public characters: string;

        /**
         * Creates a new multi char transition
         * @param characters
         */
        constructor(characters: string) {
            this.characters = characters;
        }

        /**
         * Gets the string representation of the transition
         * @returns {string}
         */
        toString(): string {
            return this.characters;
        }
    }
}