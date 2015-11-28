module jsflap.Transition {

    /**
     * A Transition of a single character in an NFA
     */
    export class CharacterTransition implements ITransition {

        /**
         * The character transition
         */
        public character: string;

        /**
         * Creates a new single char transition
         * @param character
         */
        constructor(character: string) {
            if(character.length > 1) {
                throw new Error("Character Transition length must be less than or equal to 1");
            } else {
                this.character = character;
            }
        }

        /**
         * Gets the string representation of the transition
         * @returns {string}
         */
        toString(): string {
            return this.character;
        }

        /**
         * Determines if the input matches this transition
         * @param input
         * @returns {boolean}
         */
        canFollowOn(input: string): boolean {
            return this.character === LAMBDA? true: (input.charAt(0) === this.character);
        }
        
        getTransitionParts(): ITransitionPart[] {
            return [
                new EditableTransitionPart(this.character, (newContent: string, transition: ITransition) => (<CharacterTransition> transition).character = newContent)
            ];
        }
        
        clone(): ITransition {
            return new CharacterTransition(this.character);
        }
    }
}