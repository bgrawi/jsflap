module jsflap.Graph {
    export class TMGraph extends FAGraph {
        public shortName = "TM";
        
        createTransitionFromString(transition: string, pending: boolean): jsflap.Transition.ITransition {
            var read, write, direction;
            if(transition !== null && transition.length === 6) {
                read = transition[0];
                write = transition[2];
                var directionStr = transition[5];
                direction = (directionStr === "L"? jsflap.Transition.TuringTransitionDirection.LEFT:(directionStr === "R"? jsflap.Transition.TuringTransitionDirection.RIGHT: null));
            } else {
                read = BLANK;
                write = BLANK;
                direction = jsflap.Transition.TuringTransitionDirection.RIGHT;
            }
            return new jsflap.Transition.TuringTransition(read, write, direction, pending);
        }
        
        updateAlphabetForEdge(edge: Edge) {
            var transitionCharRead = (<Transition.TuringTransition> edge.transition).read;
            var transitionCharWrite = (<Transition.TuringTransition> edge.transition).write;
            if (transitionCharRead !== null && !this.alphabet.hasOwnProperty(transitionCharRead)) {
                this.alphabet[transitionCharRead] = true;
            }

            if (transitionCharWrite !== null && !this.alphabet.hasOwnProperty(transitionCharWrite)) {
                this.alphabet[transitionCharWrite] = true;
            }
        }
        
        getEmptyTransitionCharacter(): string {
            return BLANK;
        }
    }
}