module jsflap.Transition {
    
    export enum TuringTransitionDirection {
        LEFT = -1,
        RIGHT = 1
    }

    /**
     * A Transition of a single character in an NFA
     */
    export class TuringTransition implements ITransition {

        /**
         * The the read string
         */
        public read: string;
        
        /**
         * The character transition
         */
        public write: string;
        
        public direction: TuringTransitionDirection;

        /**
         * Creates a new single char transition
         * @param character
         */
        constructor(read: string, write: string, direction: TuringTransitionDirection) {
            if(read.length > 1 || write.length > 1) {
                throw new Error("Turing Transition read and write length must be less than or equal to 1");
            } else {
                this.read = read;
                this.write = write;
                this.direction = direction;
            }
        }
        
        getDirectionString() {
            switch(this.direction) {
                case TuringTransitionDirection.LEFT:
                    return 'L';
                case TuringTransitionDirection.RIGHT:
                    return 'R';
                default:
                    return 'H';
            }
        }

        /**
         * Gets the string representation of the transition
         * @returns {string}
         */
        toString(): string {
            return this.read + '/' + this.write + ', ' + this.getDirectionString();
        }

        /**
         * Determines if the input matches this transition
         * @param input
         * @returns {boolean}
         */
        canFollowOn(input: string[]): boolean {
            return this.read === LAMBDA? true: (input[0] === this.read);
        }
    }
}