module jsflap {

    interface IEdgeList {
        has(edge: Edge): boolean;
        has(edge: string): boolean;
        getEdge(edge: Edge): Edge;
        getEdge(edge: string): Edge;
    }

    export class EdgeList implements IEdgeList {

        /**
         * The actual array of edges
         */
        public edges: Array<Edge>;

        /**
         * The transition map
         */
        public edgeMap: Object;

        /**
         * Create a new edge list
         * @param edges
         */
        constructor(edges?: Array<Edge>) {
            this.edges = [];
            this.edgeMap = {};
            if(edges) {
                edges.forEach((edge) => {
                    this.add(edge)
                });
            }
        }

        /**
         * Adds a new edge to the list
         * @param edge
         */
        public add(edge: Edge) {
            if(!this.has(edge)) {
                this.edges.push(edge);
                this.edgeMap[edge.toString()] = edge;
                return edge;
            } else {
                return this.edgeMap[edge.toString()];
            }
        }

        /**
         * Checks if the edge list has a edge
         * @returns {boolean}
         * @param edge
         */
        public has(edge: any) {
            if(typeof edge === 'string') {
                return this.edgeMap.hasOwnProperty(edge);
            } else if(edge instanceof Edge) {
                return this.edgeMap.hasOwnProperty(edge.toString())
            }
        }

        /**
         * Gets an edge by a similar edge object
         * @param edge
         * @returns {*}
         */
        public getEdge(edge: any) {
            if(this.has(edge)) {
                if(typeof edge === 'string') {
                    return this.edgeMap[edge];
                } else if(edge instanceof Edge) {
                    return this.edgeMap[edge.toString()];
                }
            } else {
                return null;
            }
        }

        /**
         * Gets the number of edges
         * @returns {number}
         */
        get size() {
            return this.edges.length;
        }
    }
}