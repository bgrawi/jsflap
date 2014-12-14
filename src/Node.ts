module jsflap {
    export class Node {

        /**
         * The edges that this node comes from
         */
        public fromEdges: Array<Edge>;

        public toEdges: Array<Edge>;

        constructor() {
            this.fromEdges = [];
            this.toEdges = [];
        }

        addFromEdge(edge: Edge) {
            this.fromEdges.push(edge);
        }

        addToEdge(edge: Edge) {
            this.toEdges.push(edge);
        }
    }
}