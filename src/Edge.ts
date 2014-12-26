module jsflap {
    export class Edge {

        /**
         * The node that the transition originates from
         */
        public from: Node;

        /**
         * The node that the transition goes to
         */
        public to: Node;

        /**
         * The actual transition data
         */
        public transition: Transition.ITransition;

        public visualization: Visualization.EdgeVisualization;

        /**
         * Creates a new directed edge with a transition
         * @param from
         * @param to
         * @param transition
         */
        constructor(from: Node, to:  Node, transition: Transition.ITransition) {
            this.from = from;
            this.to = to;
            this.transition = transition;

            // Add this edge to the other nodes
            if(from) {
                from.addToEdge(this);
            }
            if(to) {
                to.addFromEdge(this);
            }
        }

        /**
         * Set the visualization
         * @param visualization
         */
        setVisualization(visualization: Visualization.EdgeVisualization) {
            this.visualization = visualization;
        }

        /**
         * Gets the configuration state as a string
         * @returns {string}
         */
        toString() {
            return '(' + this.from.toString() + ', ' + this.to.toString() + ', ' + this.transition.toString() + ')';
        }
    }
}