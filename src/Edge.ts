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
            this.addNodes();
        }

        /**
         * Set the visualization
         * @param visualization
         */
        setVisualization(visualization: Visualization.EdgeVisualization) {
            this.visualization = visualization;
        }

        /**
         * Removes this edge from the nodes
         */
        removeNodes() {
            if(this.from) {
                this.from.removeToEdge(this);
            }
            if(this.to) {
                this.to.removeFromEdge(this);
            }
        }

        /**
         * Adds the edge to the nodes
         */
        addNodes() {
            // Add this edge to the other nodes
            if(this.from) {
                this.from.addToEdge(this);
            }
            if(this.to) {
                this.to.addFromEdge(this);
            }
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