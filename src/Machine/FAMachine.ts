module jsflap.Machine {

    export class FAMachine implements IMachine<Graph.FAGraph> {

        /**
         * The actual underlying graph
         */
        private graph: Graph.FAGraph;

        /**
         * The current state that the machine is in
         */
        private currentState: FAMachineState;

        /**
         * A set of the visited nodes for this state
         */
        private visitedStates: Object;

        /**
         * A list of states to consider visiting
         */
        private queue: Array;

        constructor(graph: Graph.FAGraph) {
            this.graph = graph;
            this.currentState = null;
            this.visitedStates = null;
            this.queue = null;
        }

        /**
         * Runs a string on the machine to see if it passes or fails
         * @param input
         * @returns {boolean}
         */
        run(input: string) {

            var initialNode = this.graph.getInitialNode(),
                initialState =  new FAMachineState(input, initialNode);

            // Trivial case #1
            if(!initialNode) {
                return false;
            }

            // Setup for backtracking
            this.visitedStates = {};
            this.visitedStates[initialState.toString()] = initialState;
            this.queue = [initialState];

            // Start Backtracking
            while(this.queue.length > 0) {
                this.currentState = this.queue.shift();
                if(this.currentState.isFinal()) {
                    return true;
                }
                var nextStates = this.currentState.getNextStates();
                for (var nextStateIndex = 0; nextStateIndex < nextStates.length; nextStateIndex++) {
                    var nextState = nextStates[nextStateIndex];
                    if(!this.visitedStates.hasOwnProperty(nextState.toString())) {
                        this.visitedStates[nextState.toString()] = nextState;
                        this.queue.push(nextState);
                    }
                }
            }

            return false;
        }

    }
}