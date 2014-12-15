module jsflap.Machine {

    export class FAMachine implements IMachine {

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
        private queue: FAMachineState[];

        /**
         * The graph that the machine is using
         */
        public graph: Graph.IGraph;

        /**
         * Creates a new machine based on a graph
         * @param graph
         */
        constructor(graph?: Graph.FAGraph) {
            this.setGraph(graph);
        }

        /**
         * Sets the graph for the machine
         * @param graph
         */
        setGraph(graph: Graph.FAGraph) {
            this.graph = graph;
        }

        /**
         * Runs a string on the machine to see if it passes or fails
         * @param input
         * @returns {boolean}
         * @param graph
         */
        run(input: string, graph?: Graph.FAGraph) {
            if(graph) {
                this.graph = graph;
            }
            if(!this.graph.isValid()) {
                throw new Error('Invalid graph');
            }
            var initialNode = this.graph.getInitialNode(),
                initialState =  new FAMachineState(input, initialNode);

            // Trivial case
            if(!initialNode) {
                return false;
            }

            // Setup for backtracking
            this.visitedStates = {};
            this.visitedStates[initialState.toString()] = initialState;
            this.queue = [initialState];

            // Start Backtracking
            while(this.queue.length > 0) {

                // Get the state off the front of the queue
                this.currentState = this.queue.shift();

                // Check if we are in a final state
                if(this.currentState.isFinal()) {
                    return true;
                }

                // Get the next possible valid states based on the input
                var nextStates = this.currentState.getNextStates();
                for (var nextStateIndex = 0; nextStateIndex < nextStates.length; nextStateIndex++) {
                    var nextState = nextStates[nextStateIndex];

                    // Check if we have already visited this state before
                    if(!this.visitedStates.hasOwnProperty(nextState.toString())) {

                        // We haven't, add it to our visited state list and queue
                        this.visitedStates[nextState.toString()] = nextState;
                        this.queue.push(nextState);
                    }
                }
            }

            // If we got here the states were all invalid
            return false;
        }

    }
}