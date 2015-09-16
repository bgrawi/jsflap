module jsflap.Machine {

    export class TMachineState implements IMachineState {

        /**
         * The current input string of the machine
         */
        public input: string[];
        
        /**
         * The current input position in the input string
         */
        public inputPosition: number;

        /**
         * The current node the machine is at
         */
        public node: Node;

        /**
         * Create a new NFA Machine state
         * @param input
         * @param node
         */
        constructor(input: string[], inputPosition: number, node: Node) {
            this.input = input;
            this.inputPosition = inputPosition;
            this.node = node;
        }

        /**
         * Determines if this state is final
         * @returns {boolean}
         */
        isFinal(): boolean {
            return this.getNextStates().length === 0 && this.node.final;
        }


        /**
         * Gets the next possible states
         * @returns {Array}
         */
        getNextStates(): TMachineState[] {
            var edgeList = this.node.toEdges.items,
                nextStates = [];
            for (var edgeName in edgeList) {
                if(edgeList.hasOwnProperty(edgeName)) {
                    var edge = edgeList[edgeName];

                    // See if we can follow this edge
                    var transition = <Transition.TuringTransition> edge.transition;
                    if(transition.canFollowOn(this.input[this.inputPosition])) {
                        var newInputPosition = this.inputPosition + transition.direction;
                        var newInput = this.input.slice();
                        
                        
                        if(typeof(transition.direction) !== 'undefined') {
                            // Create space for the new character
                            newInput[this.inputPosition] = transition.write;
                            if(newInputPosition < 0) {
                                newInputPosition = 0;
                                newInput.unshift(null);
                            } else if(newInputPosition >= newInput.length) {
                                newInput.push(null);
                            }
                            nextStates.push(new TMachineState(newInput, newInputPosition, edge.to));
                        }
                    }
                }
            }
            return nextStates;
        }

        /**
         * Returns a string representation of the state
         * @returns {string}
         */
        toString(): string {
            return '(' + this.input + ', ' + this.inputPosition + ', ' + this.node.toString() + ')';
        }
    }
}