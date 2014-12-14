module jsflap {
    export class EdgeList {

        /**
         * The actual array of edges
         */
        public edges: Array<Edge>;

        /**
         * Create a new edge list
         * @param edges
         */
        constructor(edges?: Array<Edge>) {
            if(edges) {
                this.edges = edges;
            } else {
                this.edges = [];
            }
        }

        /**
         * Adds a new edge to the list
         * @param edge
         */
        public push(edge: Edge) {
            this.edges.push(edge);
        }
    }
}