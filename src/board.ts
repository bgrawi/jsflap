
module jsflap {

    export class Board {

        /**
         * The actual svg element being used
         */
        private svg: Element;

        private nodes: Array<Node>;
        private edges: EdgeList;

        constructor(svg: Element) {
            this.svg = svg;

            this.nodes = [];
            this.edges = new EdgeList();
        }
    }
}