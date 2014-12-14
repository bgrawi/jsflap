module jsflap {
    export class Edge {

        public from: Node;
        public to: Node;

        public transition: Transition.ITransition;


        constructor(from: Node, to:  Node, transition: Transition.ITransition) {
            this.from = from;
            this.to = to;
            this.transition = transition;

            from.addToEdge(this);
            to.addFromEdge(this);
        }
    }
}