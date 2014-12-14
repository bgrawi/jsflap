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
            from.addToEdge(this);
            to.addFromEdge(this);
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