module jsflap.Graph {
    export class TMGraph extends FAGraph {
        public shortName = "TM";
        
        createTransitionFromString(transition: string): jsflap.Transition.ITransition {
            var read = transition[0];
            var write = transition[2];
            var directionStr = transition[5];
            var direction = (directionStr === "L"? jsflap.Transition.TuringTransitionDirection.LEFT:(directionStr === "R"? jsflap.Transition.TuringTransitionDirection.RIGHT: null));
            return new jsflap.Transition.TuringTransition(read, write, direction);
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
    }
}