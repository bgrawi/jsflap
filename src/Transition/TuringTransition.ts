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
         * Whether or not this transition is pending editing
         */
        public pending: boolean = false;

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
        constructor(read: string, write: string, direction: TuringTransitionDirection, pending?: boolean) {
            if(pending !== null) {
                this.pending = pending;
            }
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
                    return 'S';
            }
        }
        
        setDirectionFromString(directionString: string) {
            switch(directionString) {
                case 'L':
                case 'l':
                    this.direction = TuringTransitionDirection.LEFT;
                    break;
                case 'R':
                case 'r':
                    this.direction = TuringTransitionDirection.RIGHT;
                    break;
                default:
                    this.direction = null;
            }
        }

        /**
         * Gets the string representation of the transition
         * @returns {string}
         */
        toString(): string {
            if(this.pending) {
                return UNKNOWN;
            }
            return this.read + '/' + this.write + '; ' + this.getDirectionString();
        }

        /**
         * Determines if the input matches this transition
         * @param input
         * @returns {boolean}
         */
        canFollowOn(input: string): boolean {
            if(this.pending) {
                return false;
            }
            if(this.read === BLANK || this.read === null || this.read === '') {
                return input === BLANK || input === null || input === '';
            } else {
                return input === this.read;
            }
        }
        
        getTransitionParts(): ITransitionPart[] {
            return [
                new EditableTransitionPart(this.read, (newContent: string, transition: ITransition) => (<TuringTransition> transition).read = newContent),
                new StaticTransitionPart("/"),
                new EditableTransitionPart(this.write, (newContent: string, transition: ITransition) => (<TuringTransition> transition).write = newContent),
                new StaticTransitionPart(";"),
                new EditableTransitionPart(this.getDirectionString(), (newContent: string, transition: ITransition) => (<TuringTransition> transition).setDirectionFromString(newContent))
            ];
        }
        
        clone(): ITransition {
            return new TuringTransition(this.read, this.write, this.direction);
        }
    }
}