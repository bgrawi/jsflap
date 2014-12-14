
module jsflap {

    export class Board {

        /**
         * The actual svg element being used
         */
        private svg: Element;

        /**
         * The graph containing the edges and nodes
         */
        private graph: Graph.IGraph;

        constructor(svg: Element, graph: Graph.IGraph) {
            this.svg = svg;
            this.graph = graph;
        }
    }
}