
module jsflap.Graph {

    export class FAGraph implements IGraph {
        
        public shortName = "FA";

        /**
         * If this finite automata is deterministic or not
         */
        public deterministic: boolean;

        /**
         * The list of nodes
         */
        public nodes: NodeList;

        /**
         * The list of all the edges in the graph
         */
        public edges: EdgeList;

        /**
         * The initial node of the graph
         */
        public initialNode: Node;

        /**
         * The list of final nodes
         */
        public finalNodes: NodeList;

        /**
         * The alphabet of all the transitions
         */
        public alphabet: Object;

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
                    this.setInitialNode(result);
                }

                if(result.final) {
                    this.finalNodes.add(result);
                }
            }

            return result;
        }

        /**
         * Removes a node from the graph
         * @param node
         * @returns {boolean}
         */
        removeNode(node: any): boolean {
            var foundNode = this.nodes.get(node);

            if(!foundNode) {
                return false;
            }

            if(foundNode === this.initialNode) {
                //this.setInitialNode(null);
                this.initialNode = null;
            }

            if(foundNode.final && this.finalNodes.has(foundNode)) {
                this.finalNodes.remove(foundNode);
            }

            if(foundNode) {
                this.nodes.remove(foundNode);
            }

            return true;
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
         * @param pending
         * @returns {jsflap.Edge|any}
         */
        addEdge(from: any, to?: any, transition?: any, pending?: boolean): jsflap.Edge {
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
                    transitionObj = this.createTransitionFromString(transition, !!pending);
                } else if(typeof transition === 'object') {
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

            this.updateAlphabetForEgde(edge);
            return this.edges.add(edge);
        }
        
        createTransitionFromString(str: string, pending: boolean): jsflap.Transition.ITransition {
             return new jsflap.Transition.CharacterTransition(str, pending);
        }

        /**
         * Updates the alphabet after any changes to the transitions
         */
        updateAlphabet() {

            // Clear the alphabet
            this.alphabet = {};

            // Update the alphabet
            this.edges.items.forEach((edge: Edge) => this.updateAlphabetForEgde(edge));
        }
        
        updateAlphabetForEgde(edge: Edge) {
            var transitionChar = edge.transition.toString();
            if(!this.alphabet.hasOwnProperty(transitionChar) && transitionChar !== LAMBDA && transitionChar !== BLANK) {
                this.alphabet[transitionChar] = true;
            }
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
         * Removes an edge from the graph
         * @param edge
         */
        removeEdge(edge: any): boolean {
            var foundEdge = this.edges.get(edge);
            if(!foundEdge) {
                return false;
            }
            foundEdge.removeNodes();
            return this.edges.remove(foundEdge);
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
         * Sets the node as initial and verifies that there is only ever one initial node
         * @param node
         * @returns {jsflap.Node}
         */
        setInitialNode(node: jsflap.Node): jsflap.Node {
            if (this.initialNode) {
                this.initialNode.initial = false;
            }
            if(node) {
                node.initial = true;
                this.initialNode = node;
            } else {
                this.initialNode = null;
            }
            return node;
        }

        /**
         * Marks a node as final in the graph
         * @param node
         * @returns {jsflap.Node|any}
         */
        markFinalNode(node: jsflap.Node): jsflap.Node {
            node.final = true;
            if(this.nodes.has(node) && !this.finalNodes.has(node)) {
                this.finalNodes.add(node);
            }
            return node;
        }

        /**
         * Unmarks a node as final from the graph
         * @param node
         * @returns {jsflap.Node}
         */
        unmarkFinalNode(node: jsflap.Node): jsflap.Node {
            node.final = false;
            if(this.nodes.has(node) && this.finalNodes.has(node)) {
                this.finalNodes.remove(node);
            }
            return node;
        }

        /**
         * Gets the list of final nodes
         * @returns {NodeList}
         */
        getFinalNodes(): NodeList {
            return this.finalNodes;
        }

        /**
         * Gets the alphabet
         * @returns {Object}
         */
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
            str += this.shortName;

            // Separator and start of definition
            str += ':(';

            // Alphabet
            this.updateAlphabet();
            str += '{';
            str += Object.keys(this.alphabet).join(', ');
            str += '}, ';

            // Nodes
            str += '{';
            str += this.nodes.items.map((node) => { return node.toString(); }).join(', ');
            str += '}, ';

            //Transitions
            str += '{';
            str += this.edges.items.map((edge) => { return edge.toString(); }).join(', ');
            str += '}, ';

            // Start symbol
            str += this.initialNode? this.initialNode.toString(): '';
            str += ', ';

            // Final Nodes
            str += '{';
            str += this.finalNodes.items.map((node) => { return node.toString(); }).join(', ');
            str += '}';

            // End definition
            str += ')';
            return str;
        }

        fromString(input: string): boolean {
            var configRegex = new RegExp("^([D,N])"+ this.shortName +":\\({(.*)}, {(.*)}, {(.*)}, (.*), {(.*)}\\)$");

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

        /**
         * Checks if the current graph is valid
         * @returns {boolean}
         */
        isValid(): boolean {
            var isValid = true;

            // It's not valid if there is either no start node or no end nodes
            if(!this.initialNode || this.getFinalNodes().size === 0) {
                isValid = false;
            }

            this.updateAlphabet();

            if(this.deterministic) {

                if(!isValid) {
                    return false;
                }

                // Loop through each node
                for (var nodeString in this.nodes.items) {
                    if(this.nodes.items.hasOwnProperty(nodeString)) {

                        var node: Node = this.nodes.items[nodeString];
                        var alphabet = angular.copy(this.alphabet);

                        // Loop through each of the node's outward edges
                        node.toEdges.items.forEach((edge) => {
                            var transitionChar = edge.transition.toString();

                            // There MUST be one transition for every node
                            if(transitionChar !== BLANK &&
                                transitionChar !== LAMBDA &&
                                alphabet.hasOwnProperty(transitionChar)) {
                                delete alphabet[transitionChar];
                            } else {
                                isValid = false;
                            }
                        });

                        if(!isValid) {
                            break;
                        }

                        if(Object.keys(alphabet).length > 0) {
                            isValid = false;
                            break;
                        }
                    }
                }
                return isValid;
            } else {
                return isValid;
            }
        }
        
        getEmptyTransitionCharacter(): string {
            return LAMBDA;
        }
    }
}