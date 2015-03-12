module jsflap.Machine {

    export class FAMachineState implements IMachineState {

        /**
         * The current input string of the machine
         */
        public input: string;

        /**
         * The current node the machine is at
         */
        public node: Node;

        /**
         * Create a new NFA Machine state
         * @param input
         * @param node
         */
        constructor(input: string, node: Node) {
            this.input = input;
            this.node = node;
        }

        /**
         * Determines if this state is final
         * @returns {boolean}
         */
        isFinal(): boolean {
            return this.input.length === 0 && this.node.final;
        }


        /**
         * Gets the next possible states
         * @returns {Array}
         */
        getNextStates(): FAMachineState[] {
            var edgeList = this.node.toEdges.items,
                nextStates = [];
            for (var edgeName in edgeList) {
                if(edgeList.hasOwnProperty(edgeName)) {
                    var edge = edgeList[edgeName];

                    // See if we can follow this edge
                    var transition = <Transition.CharacterTransition> edge.transition;
                    if(transition.canFollowOn(this.input)) {
                        var inputLength = transition.character.length === 1 && transition.character !== LAMBDA? 1: 0;
                        nextStates.push(new FAMachineState(this.input.substr(inputLength), edge.to));
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
            return '(' + this.input + ', ' + this.node.toString() + ')';
        }
    }
}