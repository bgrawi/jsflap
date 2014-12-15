
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
         * The alphabet of all the transitions
         */
        private alphabet: Object;

        /**
         * Create a new graph
         * @param deterministic
         * @param nodes
         * @param edges
         */
        constructor(deterministic: boolean, nodes?: Array<Node>, edges?: Array<Edge>) {
            this.init(deterministic);

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
         * Initialize the graph
         * @param deterministic
         */
        init(deterministic: boolean) {
            this.deterministic = deterministic;
            this.initialNode = null;
            this.nodes = new NodeList();
            this.finalNodes = new NodeList();
            this.edges = new EdgeList();
            this.alphabet = {};
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

            if(!this.alphabet.hasOwnProperty(edge.transition.toString())) {
                this.alphabet[edge.transition.toString()] = true;
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

        getAlphabet(): Object {
            return this.alphabet;
        }

        /**
         * Generates a representation of this graph as a string
         * @returns {string}
         */
        toString(): string {
            var str = '';

            // Determinism prefix
            str += (this.deterministic)? 'D': 'N';

            // Type of graph
            str += 'FA';

            // Separator and start of definition
            str += ':(';

            // Alphabet
            str += '{';
            str += Object.keys(this.alphabet).join(', ');
            str += '}, ';

            // Nodes
            str += '{';
            str += Object.keys(this.nodes.nodes).join(', ');
            str += '}, ';

            //Transitions
            str += '{';
            str += this.edges.edges.map((edge) => { return edge.toString(); }).join(', ');
            str += '}, ';

            // Start symbol
            str += this.initialNode? this.initialNode: '';
            str += ', ';

            // Final Nodes
            str += '{';
            str += Object.keys(this.finalNodes.nodes).join(', ');
            str += '}';

            // End definition
            str += ')';
            return str;
        }

        fromString(input: string): boolean {
            var configRegex = /^([D,N])FA:\({(.*)}, {(.*)}, {(.*)}, (.*), {(.*)}\)$/;

            // Check to see if valid config
            if(!configRegex.test(input)) {
                return false;
            }
            var configParse = configRegex.exec(input),
                configResult = {
                    deterministic: null,
                    alphabet: null,
                    nodes: null,
                    edges: null,
                    initialNode: null,
                    finalNodes: null
                };

            try {
                // Determinism:
                configResult.deterministic = configParse[1] === 'D';

                // Alphabet:
                configResult.alphabet = configParse[2].split(', ');

                // Nodes:
                configResult.nodes = configParse[3].split(', ');

                // Edges
                // Get rid of leading/trailing parenthesis if not null
                if (configParse[4].length > 0) {
                    configParse[4] = configParse[4].substr(1, configParse[4].length - 2);
                }
                configResult.edges = configParse[4].split('), (').map((edge) => {
                    return edge.split(', ')
                });

                // Initial Nodes:
                configResult.initialNode = configParse[5];

                // Final Nodes
                configResult.finalNodes = configParse[6].split(', ');


                // Now actually modify the graph

                // Initialize the graph to the set deterministic
                this.init(configResult.deterministic);

                // Setup the alphabet in case it is an invalid DFA
                if (configResult.alphabet) {
                    configResult.alphabet.forEach((letter) => {
                        this.alphabet[letter] = true;
                    });
                }

                // Set up each node
                if (configResult.nodes) {
                    configResult.nodes.forEach((node) => {
                        if (node) {
                            this.addNode(node, {
                                initial: configResult.initialNode === node,
                                final: configResult.finalNodes.indexOf(node) !== -1
                            });
                        }
                    });
                }

                // Setup each edge
                if (configResult.edges) {
                    configResult.edges.forEach((edge) => {
                        if (edge && edge.length === 3) {
                            this.addEdge.apply(this, edge);
                        }
                    });
                }
            } catch(e) {
                // If any error happened in parsing, forget about it.
                return false;
            }

            // If we made it here it was all valid
            return true;
        }

    }
}