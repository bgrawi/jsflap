module jsflap.Machine {

    export class FAMachine implements IMachine<Graph.FAGraph> {

        /**
         * The actual underlying graph
         */
        private graph: Graph.FAGraph;

        /**
         * The current state that the machine is in
         */
        public currentState: FAMachineState;

        constructor(graph: Graph.FAGraph) {
            this.graph = graph;
        }

        run(input: string) {

            return true;
        }

    }
}