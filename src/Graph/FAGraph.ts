
module jsflap.Graph {

    export class FAGraph implements IGraph {

        /**
         * If this finite automata is deterministic or not
         */
        private deterministic: boolean;

        /**
         * The list of nodes
         */
        private nodes: NodeList;

        /**
         * The list of all the edges in the graph
         */
        private edges: EdgeList;

        /**
         * The initial node of the graph
         */
        private initialNode: Node;

        /**
         * The list of final nodes
         */
        private finalNodes: NodeList;

        /**
         * Create a new graph
         * @param deterministic
         * @param nodes
         * @param edges
         */
        constructor(deterministic: boolean, nodes?: Array<Node>, edges?: Array<Edge>) {
            this.deterministic = deterministic;
            this.initialNode = null;
            this.nodes = new NodeList();
            this.finalNodes = new NodeList();
            this.edges = new EdgeList();

            if(nodes) {
                nodes.forEach((node) => {
                    this.addNode(node);
                });
            }

            if(edges) {
                edges.forEach((edge) => {
                    this.addEdge(edge);
                });
            }
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
            var newNode;
            if(typeof node === 'string') {
                newNode = new Node(node, options);
            } else if(node instanceof Node) {
                newNode = node;
            }
            var result = this.nodes.add(newNode);

            // If unique node that is initial, make this one the new initial
            if(result === newNode) {
                if(result.initial) {
                    if (this.initialNode) {
                        this.initialNode.initial = false;
                    }
                    this.initialNode = result;
                }

                if(result.final) {
                    this.finalNodes.add(result);
                }
            }

            return result;
        }

        /**
         * Gets a node from the node list
         * @param node
         * @returns {any}
         */
        getNode(node: any): jsflap.Node {
            return this.nodes.get(node);
        }

        /**
         * Determines if the graph has the node
         * @param node
         * @returns {any}
         */
        hasNode(node: any): boolean {
            return this.nodes.has(node);
        }

        /**
         * Adds an edge to the graph
         * @param from
         * @param to
         * @param transition
         * @returns {jsflap.Edge|any}
         */
        addEdge(from: any, to?: any, transition?: any): jsflap.Edge {
            var edge: Edge;
            if(from && to && transition) {

                // Determine if we need to make objects or not
                var fromObj, toObj, transitionObj;

                if(typeof from === 'string') {
                    fromObj = this.getNode(from);
                } else if(from instanceof jsflap.Node) {
                    fromObj = from;
                }

                if(typeof to === 'string') {
                    toObj = this.getNode(to);
                } else if(to instanceof jsflap.Node) {
                    toObj = to;
                }

                if(typeof transition === 'string') {
                    transitionObj = new jsflap.Transition.CharacterTransition(transition);
                } else if(transition instanceof jsflap.Transition.CharacterTransition) {
                    transitionObj = transition;
                }

                edge = new Edge(fromObj, toObj, transitionObj);
            } else if(from instanceof Edge) {
                edge =  from;
            } else {
                throw new Error('Invalid Arguments for creating an edge');
            }

            if(!this.hasNode(edge.from) || !this.hasNode(edge.to)) {
                throw new Error('Graph does not have all nodes in in the edge');
            }
            return this.edges.add(edge);
        }

        /**
         * Gets an edge from the edge list
         * @param edge
         * @returns {any}
         */
        getEdge(edge: any): jsflap.Edge {
            return this.edges.get(edge);
        }

        /**
         * Determines if the graph has the edge or not
         * @param edge
         * @returns {boolean}
         */
        hasEdge(edge: any): boolean {
            return this.edges.has(edge);
        }

        /**
         * Gets the initial node for the graph
         * @returns {Node}
         */
        getInitialNode(): jsflap.Node {
            return this.initialNode;
        }

        /**
         * Gets the list of final nodes
         * @returns {NodeList}
         */
        getFinalNodes(): NodeList {
            return this.finalNodes;
        }

    }
}