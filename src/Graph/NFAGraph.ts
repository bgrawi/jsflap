
module jsflap.Graph {

    export class NFAGraph implements IGraph<Transition.CharacterTransition> {

        /**
         * The list of nodes
         */
        private nodes: NodeList;

        /**
         * THe list of all the edges in the graph
         */
        private edges: EdgeList;

        /**
         * Create a new graph
         * @param nodes
         * @param edges
         */
        constructor(nodes?: Array<Node>, edges?: Array<Edge>) {
            this.nodes = new NodeList(nodes);
            this.edges = new EdgeList(edges);
        }

        /**
         * Gets the nodes from the graph
         * @returns {NodeList}
         */
        getNodes(): jsflap.NodeList {
            return this.nodes;
        }

        /**
         * Gets the edges from the graph
         * @returns {EdgeList}
         */
        getEdges(): jsflap.EdgeList {
            return this.edges;
        }

        /**
         * Adds a node based on a label
         * @returns {jsflap.Node|any}
         * @param node
         * @param options
         */
        addNode(node: any, options?: NodeOptions): jsflap.Node {
            if(typeof node === 'string') {
                return this.nodes.add(new Node(node, options));
            } else if(node instanceof Node) {
                return this.nodes.add(node);
            }
        }

        /**
         * Adds an edge to the graph
         * @param from
         * @param to
         * @param transition
         * @returns {jsflap.Edge|any}
         */
        addEdge(from: any, to?: jsflap.Node, transition?: Transition.CharacterTransition): jsflap.Edge {
            if(from instanceof Edge && to instanceof Edge && transition) {
                return this.edges.add(new Edge(from, to, transition));
            } else if(from instanceof Edge) {
                return this.edges.add(from);
            }
        }
    }
}