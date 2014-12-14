module jsflap {
    export class Node {

        /**
         * The edges that this node comes from
         */
        public fromEdges: EdgeList;

        public toEdges: EdgeList;

        /**
         * Creates a new node
         * @param label
         * @param fromEdges
         * @param toEdges
         */
        constructor(label: string, fromEdges?: EdgeList, toEdges?: EdgeList) {
            this.fromEdges = new EdgeList();
            this.toEdges = new EdgeList();
        }

        /**
         * Adds an edge to the from list
         * @param edge
         */
        addFromEdge(edge: Edge) {
            this.fromEdges.push(edge);
        }

        /**
         * Adds an edge to the to list
         * @param edge
         */
        addToEdge(edge: Edge) {
            this.toEdges.push(edge);
        }
    }
}