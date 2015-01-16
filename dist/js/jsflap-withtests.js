var jsflap;
(function (jsflap) {
    jsflap.LAMBDA = 'λ';
    jsflap.BLANK = '☐';
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Edge = (function () {
        /**
         * Creates a new directed edge with a transition
         * @param from
         * @param to
         * @param transition
         */
        function Edge(from, to, transition) {
            this.from = from;
            this.to = to;
            this.transition = transition;
            // Add this edge to the other nodes
            if (from) {
                from.addToEdge(this);
            }
            if (to) {
                to.addFromEdge(this);
            }
        }
        /**
         * Gets the configuration state as a string
         * @returns {string}
         */
        Edge.prototype.toString = function () {
            return '(' + this.from.toString() + ', ' + this.to.toString() + ', ' + this.transition.toString() + ')';
        };
        return Edge;
    })();
    jsflap.Edge = Edge;
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var EdgeList = (function () {
        /**
         * Create a new edge list
         * @param edges
         */
        function EdgeList(edges) {
            var _this = this;
            this.edges = [];
            this.edgeMap = {};
            if (edges) {
                edges.forEach(function (edge) {
                    _this.add(edge);
                });
            }
        }
        /**
         * Adds a new edge to the list
         * @param edge
         */
        EdgeList.prototype.add = function (edge) {
            if (!this.has(edge)) {
                this.edges.push(edge);
                this.edgeMap[edge.toString()] = edge;
                return edge;
            }
            else {
                return this.edgeMap[edge.toString()];
            }
        };
        /**
         * Checks if the edge list has a edge
         * @returns {boolean}
         * @param edge
         */
        EdgeList.prototype.has = function (edge) {
            if (typeof edge === 'string') {
                return this.edgeMap.hasOwnProperty(edge);
            }
            else if (edge instanceof jsflap.Edge) {
                return this.edgeMap.hasOwnProperty(edge.toString());
            }
            else {
                return false;
            }
        };
        /**
         * Gets an edge by a similar edge object
         * @param edge
         * @returns {*}
         */
        EdgeList.prototype.get = function (edge) {
            if (this.has(edge)) {
                if (typeof edge === 'string') {
                    return this.edgeMap[edge];
                }
                else if (edge instanceof jsflap.Edge) {
                    return this.edgeMap[edge.toString()];
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        Object.defineProperty(EdgeList.prototype, "size", {
            /**
             * Gets the number of edges
             * @returns {number}
             */
            get: function () {
                return this.edges.length;
            },
            enumerable: true,
            configurable: true
        });
        return EdgeList;
    })();
    jsflap.EdgeList = EdgeList;
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Node = (function () {
        /**
         * Creates a new node
         * @param label
         * @param options
         */
        function Node(label, options) {
            this.label = label;
            if (options) {
                this.initial = (options.initial) ? options.initial : false;
                this.final = (options.final) ? options.final : false;
                this.fromEdges = (options.fromEdges) ? options.fromEdges : new jsflap.EdgeList();
                this.toEdges = (options.toEdges) ? options.toEdges : new jsflap.EdgeList();
            }
            else {
                this.initial = false;
                this.final = false;
                this.fromEdges = new jsflap.EdgeList();
                this.toEdges = new jsflap.EdgeList();
            }
        }
        /**
         * Adds an edge to the from list
         * @param edge
         */
        Node.prototype.addFromEdge = function (edge) {
            if (edge.to.toString() === this.toString()) {
                return this.fromEdges.add(edge);
            }
            else {
                return null;
            }
        };
        /**
         * Adds an edge to the to list
         * @param edge
         */
        Node.prototype.addToEdge = function (edge) {
            if (edge.from.toString() === this.toString()) {
                return this.toEdges.add(edge);
            }
            else {
                return null;
            }
        };
        /**
         * Set the visualization
         * @param visualization
         */
        Node.prototype.setVisualization = function (visualization) {
            this.visualization = visualization;
        };
        /**
         * Gets the label of this current node
         * @returns {string}
         */
        Node.prototype.toString = function () {
            return this.label;
        };
        return Node;
    })();
    jsflap.Node = Node;
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var NodeList = (function () {
        /**
         * Create a new node list
         * @param nodes
         */
        function NodeList(nodes) {
            var _this = this;
            /**
             * The internal size
             * @type {number}
             * @private
             */
            this._size = 0;
            this.nodes = {};
            if (nodes) {
                nodes.forEach(function (node) {
                    _this.add(node);
                });
            }
        }
        Object.defineProperty(NodeList.prototype, "size", {
            /**
             * Gets the size of the list
             * @returns {number}
             */
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Adds a new node to the list
         * @param node
         */
        NodeList.prototype.add = function (node) {
            if (!this.has(node)) {
                this.nodes[node.toString()] = node;
                this._size++;
                return node;
            }
            else {
                return this.nodes[node.toString()];
            }
        };
        /**
         * Checks if the node exists already
         * @param node
         * @returns {boolean}
         */
        NodeList.prototype.has = function (node) {
            if (typeof node === 'string') {
                return this.nodes.hasOwnProperty(node);
            }
            else if (node instanceof jsflap.Node) {
                return this.nodes.hasOwnProperty(node.toString());
            }
            else {
                return false;
            }
        };
        /**
         * Gets an node by a similar node object
         * @param node
         * @returns {*}
         */
        NodeList.prototype.get = function (node) {
            if (this.has(node)) {
                if (typeof node === 'string') {
                    return this.nodes[node];
                }
                else if (node instanceof jsflap.Node) {
                    return this.nodes[node.toString()];
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        return NodeList;
    })();
    jsflap.NodeList = NodeList;
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (_Board) {
        var Board = (function () {
            /**
             * Represents both the visualization and the graph underneath
             * @param svg
             * @param graph
             * @param $rootScope The scope to broadcast events on
             */
            function Board(svg, graph, $rootScope) {
                this.svg = d3.select(svg);
                this.boardBase = this.svg.append("rect").attr("fill", "#FFFFFF").attr("width", svg.getBoundingClientRect().width).attr("height", svg.getBoundingClientRect().height);
                this.graph = graph;
                this.state = new _Board.BoardState();
                this.visualizations = new jsflap.Visualization.VisualizationCollection(this.svg, this.state);
                this.registerBindings($rootScope);
            }
            /**
             * Registers event bindings
             */
            Board.prototype.registerBindings = function ($rootScope) {
                var _this = this;
                this.svg.on('mouseup', function () {
                    _this.mouseup(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('mousedown', function () {
                    _this.mousedown(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('mousemove', function () {
                    _this.mousemove(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on("contextmenu", function () {
                    $rootScope.$broadcast('contextmenu', { options: _this.state.contextMenuOptions, event: d3.event });
                    _this.state.contextMenuOptions = null;
                    d3.event.preventDefault();
                });
                document.addEventListener('keydown', function (event) {
                    _this.keydown(event);
                });
                document.addEventListener('keyup', function (event) {
                    _this.keyup(event);
                });
            };
            /**
             * Mouseup event listener
             * @param event
             */
            Board.prototype.mouseup = function (event) {
                var _this = this;
                if (event.event.which > 1) {
                    return false;
                }
                if (this.state.futureEdge) {
                    var nearestNode = this.visualizations.getNearestNode(this.state.futureEdge.end);
                    var endingNode;
                    if (nearestNode.node && nearestNode.distance < 40) {
                        endingNode = nearestNode.node;
                    }
                    else {
                        endingNode = this.addNode(this.state.futureEdge.end);
                    }
                    this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;
                    var newEdge = this.addEdge(this.state.futureEdgeFrom, endingNode);
                    setTimeout(function () {
                        var elm = _this.svg.select('text.transition:last-child');
                        if (elm.length > 0) {
                            _this.visualizations.editTransition(newEdge, elm.node());
                        }
                    }, 10);
                    this.state.futureEdge.remove();
                    this.state.futureEdge = null;
                    this.state.futureEdgeFrom = null;
                }
                this.state.futureEdgeFrom = null;
            };
            /**
             * Adds a node to the board
             * @param point
             * @returns {jsflap.Visualization.NodeVisualization}
             */
            Board.prototype.addNode = function (point) {
                var node = this.graph.addNode('q' + this.graph.getNodes().size), nodeV = new jsflap.Visualization.NodeVisualization(node, point.getMPoint());
                return this.visualizations.addNode(nodeV);
            };
            /**
             * Adds an edge to the board given two nodes and a future edge
             * @param from
             * @param to
             * @param transition
             */
            Board.prototype.addEdge = function (from, to, transition) {
                var edge = this.graph.addEdge(from.model, to.model, transition || jsflap.LAMBDA), edgeV = new jsflap.Visualization.EdgeVisualization(edge, from, to);
                return this.visualizations.addEdge(edgeV);
            };
            /**
             * Mousedown event listener
             * @param event
             */
            Board.prototype.mousedown = function (event) {
                event.event.preventDefault();
                if (event.event.which > 1) {
                    return false;
                }
                var nearestNode = this.visualizations.getNearestNode(event.point);
                if (nearestNode.node && nearestNode.distance < 70) {
                    this.state.futureEdgeFrom = nearestNode.node;
                }
                else if (this.state.modifyEdgeTransition === null) {
                    // Only add a node if the user is not currently click out of editing a transition OR is near a node
                    this.addNode(event.point);
                }
                // If the user was focused on modifying an edge transition, blur it.
                if (this.state.modifyEdgeTransition !== null) {
                    this.state.modifyEdgeTransition.blur();
                }
            };
            /**
             * Mousemove event listener
             * @param event
             */
            Board.prototype.mousemove = function (event) {
                var point = event.point.getMPoint();
                if (event.event.which > 1) {
                    return false;
                }
                if (this.state.futureEdge !== null) {
                    if (this.state.shiftKeyPressed) {
                        var x1 = this.state.futureEdge.start.x, x2 = point.x, y1 = this.state.futureEdge.start.y, y2 = point.y, dx = x2 - x1, dy = y2 - y1, theta = Math.atan(dy / dx), dTheta = Math.round(theta / (Math.PI / 4)) * (Math.PI / 4), distance = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)), trigSide = dx >= 0 ? 1 : -1;
                        if (dx !== 0) {
                            point.x = x1 + trigSide * distance * Math.cos(dTheta);
                            point.y = y1 + trigSide * distance * Math.sin(dTheta);
                        }
                    }
                    var nearestNode = this.visualizations.getNearestNode(point);
                    if (nearestNode.node && nearestNode.distance < 40) {
                        this.state.futureEdge.end = nearestNode.node.getAnchorPointFrom(this.state.futureEdge.start);
                    }
                    else {
                        this.state.futureEdge.end = point;
                    }
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(this.state.futureEdge.end);
                }
                else if (this.state.futureEdgeFrom !== null) {
                    this.state.futureEdge = new jsflap.Visualization.FutureEdgeVisualization(event.point.getMPoint(), event.point.getMPoint());
                    this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                    this.state.futureEdge.addTo(this.svg);
                }
            };
            /**
             * The keydown event listener
             * @param event
             */
            Board.prototype.keydown = function (event) {
                if (event.which === 16 && !this.state.shiftKeyPressed) {
                    this.state.shiftKeyPressed = true;
                }
            };
            /**
             * The keyup event listener
             * @param event
             */
            Board.prototype.keyup = function (event) {
                if (event.which === 16 && this.state.shiftKeyPressed) {
                    this.state.shiftKeyPressed = false;
                }
            };
            return Board;
        })();
        _Board.Board = Board;
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        (function (BoardMode) {
            BoardMode[BoardMode["DRAW"] = 0] = "DRAW";
            BoardMode[BoardMode["MOVE"] = 1] = "MOVE";
            BoardMode[BoardMode["ERASE"] = 2] = "ERASE";
        })(Board.BoardMode || (Board.BoardMode = {}));
        var BoardMode = Board.BoardMode;
        var BoardState = (function () {
            function BoardState() {
                this.mode = 0 /* DRAW */;
                this.futureEdge = null;
                this.futureEdgeFrom = null;
                this.futureEdgeSnapping = false;
                this.modifyEdgeTransition = null;
                this.modifyEdgeControl = null;
                this.contextMenuOptions = null;
            }
            return BoardState;
        })();
        Board.BoardState = BoardState;
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var MouseEvent = (function () {
            /**
             * Creates a new MouseEvent in a given context
             * @param event
             * @param context
             */
            function MouseEvent(event, context) {
                this.event = event;
                var rawPoint = d3.mouse(context);
                this.point = new jsflap.Point.IMPoint(rawPoint[0], rawPoint[1]);
            }
            return MouseEvent;
        })();
        Board.MouseEvent = MouseEvent;
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Graph;
    (function (Graph) {
        var FAGraph = (function () {
            /**
             * Create a new graph
             * @param deterministic
             * @param nodes
             * @param edges
             */
            function FAGraph(deterministic, nodes, edges) {
                var _this = this;
                this.init(deterministic);
                if (nodes) {
                    nodes.forEach(function (node) {
                        _this.addNode(node);
                    });
                }
                if (edges) {
                    edges.forEach(function (edge) {
                        _this.addEdge(edge);
                    });
                }
            }
            /**
             * Initialize the graph
             * @param deterministic
             */
            FAGraph.prototype.init = function (deterministic) {
                this.deterministic = deterministic;
                this.initialNode = null;
                this.nodes = new jsflap.NodeList();
                this.finalNodes = new jsflap.NodeList();
                this.edges = new jsflap.EdgeList();
                this.alphabet = {};
            };
            /**
             * Gets the nodes from the graph
             * @returns {NodeList}
             */
            FAGraph.prototype.getNodes = function () {
                return this.nodes;
            };
            /**
             * Gets the edges from the graph
             * @returns {EdgeList}
             */
            FAGraph.prototype.getEdges = function () {
                return this.edges;
            };
            /**
             * Adds a node based on a label
             * @returns {jsflap.Node|any}
             * @param node
             * @param options
             */
            FAGraph.prototype.addNode = function (node, options) {
                var newNode;
                if (typeof node === 'string') {
                    newNode = new jsflap.Node(node, options);
                }
                else if (node instanceof jsflap.Node) {
                    newNode = node;
                }
                var result = this.nodes.add(newNode);
                // If unique node that is initial, make this one the new initial
                if (result === newNode) {
                    if (result.initial) {
                        this.setInitialNode(result);
                    }
                    if (result.final) {
                        this.finalNodes.add(result);
                    }
                }
                return result;
            };
            /**
             * Gets a node from the node list
             * @param node
             * @returns {any}
             */
            FAGraph.prototype.getNode = function (node) {
                return this.nodes.get(node);
            };
            /**
             * Determines if the graph has the node
             * @param node
             * @returns {any}
             */
            FAGraph.prototype.hasNode = function (node) {
                return this.nodes.has(node);
            };
            /**
             * Adds an edge to the graph
             * @param from
             * @param to
             * @param transition
             * @returns {jsflap.Edge|any}
             */
            FAGraph.prototype.addEdge = function (from, to, transition) {
                var edge;
                if (from && to && transition) {
                    // Determine if we need to make objects or not
                    var fromObj, toObj, transitionObj;
                    if (typeof from === 'string') {
                        fromObj = this.getNode(from);
                    }
                    else if (from instanceof jsflap.Node) {
                        fromObj = from;
                    }
                    if (typeof to === 'string') {
                        toObj = this.getNode(to);
                    }
                    else if (to instanceof jsflap.Node) {
                        toObj = to;
                    }
                    if (typeof transition === 'string') {
                        transitionObj = new jsflap.Transition.CharacterTransition(transition);
                    }
                    else if (transition instanceof jsflap.Transition.CharacterTransition) {
                        transitionObj = transition;
                    }
                    edge = new jsflap.Edge(fromObj, toObj, transitionObj);
                }
                else if (from instanceof jsflap.Edge) {
                    edge = from;
                }
                else {
                    throw new Error('Invalid Arguments for creating an edge');
                }
                if (!this.hasNode(edge.from) || !this.hasNode(edge.to)) {
                    throw new Error('Graph does not have all nodes in in the edge');
                }
                var transitionChar = edge.transition.toString();
                if (!this.alphabet.hasOwnProperty(transitionChar) && transitionChar !== jsflap.LAMBDA && transitionChar !== jsflap.BLANK) {
                    this.alphabet[transitionChar] = true;
                }
                return this.edges.add(edge);
            };
            /**
             * Gets an edge from the edge list
             * @param edge
             * @returns {any}
             */
            FAGraph.prototype.getEdge = function (edge) {
                return this.edges.get(edge);
            };
            /**
             * Determines if the graph has the edge or not
             * @param edge
             * @returns {boolean}
             */
            FAGraph.prototype.hasEdge = function (edge) {
                return this.edges.has(edge);
            };
            /**
             * Gets the initial node for the graph
             * @returns {Node}
             */
            FAGraph.prototype.getInitialNode = function () {
                return this.initialNode;
            };
            /**
             * Sets the node as initial and verifies that there is only ever one initial node
             * @param node
             * @returns {jsflap.Node}
             */
            FAGraph.prototype.setInitialNode = function (node) {
                node.initial = true;
                if (this.initialNode) {
                    this.initialNode.initial = false;
                }
                this.initialNode = node;
                return node;
            };
            /**
             * Gets the list of final nodes
             * @returns {NodeList}
             */
            FAGraph.prototype.getFinalNodes = function () {
                return this.finalNodes;
            };
            FAGraph.prototype.getAlphabet = function () {
                return this.alphabet;
            };
            /**
             * Generates a representation of this graph as a string
             * @returns {string}
             */
            FAGraph.prototype.toString = function () {
                var str = '';
                // Determinism prefix
                str += (this.deterministic) ? 'D' : 'N';
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
                str += this.edges.edges.map(function (edge) {
                    return edge.toString();
                }).join(', ');
                str += '}, ';
                // Start symbol
                str += this.initialNode ? this.initialNode.toString() : '';
                str += ', ';
                // Final Nodes
                str += '{';
                str += Object.keys(this.finalNodes.nodes).join(', ');
                str += '}';
                // End definition
                str += ')';
                return str;
            };
            FAGraph.prototype.fromString = function (input) {
                var _this = this;
                var configRegex = /^([D,N])FA:\({(.*)}, {(.*)}, {(.*)}, (.*), {(.*)}\)$/;
                // Check to see if valid config
                if (!configRegex.test(input)) {
                    return false;
                }
                var configParse = configRegex.exec(input), configResult = {
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
                    configResult.edges = configParse[4].split('), (').map(function (edge) {
                        return edge.split(', ');
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
                        configResult.alphabet.forEach(function (letter) {
                            _this.alphabet[letter] = true;
                        });
                    }
                    // Set up each node
                    if (configResult.nodes) {
                        configResult.nodes.forEach(function (node) {
                            if (node) {
                                _this.addNode(node, {
                                    initial: configResult.initialNode === node,
                                    final: configResult.finalNodes.indexOf(node) !== -1
                                });
                            }
                        });
                    }
                    // Setup each edge
                    if (configResult.edges) {
                        configResult.edges.forEach(function (edge) {
                            if (edge && edge.length === 3) {
                                _this.addEdge.apply(_this, edge);
                            }
                        });
                    }
                }
                catch (e) {
                    // If any error happened in parsing, forget about it.
                    return false;
                }
                // If we made it here it was all valid
                return true;
            };
            /**
             * Checks if the current graph is valid
             * @returns {boolean}
             */
            FAGraph.prototype.isValid = function () {
                var isValid = true;
                // It's not valid if there is either no start node or no end nodes
                if (!this.initialNode || this.getFinalNodes().size === 0) {
                    isValid = false;
                }
                if (this.deterministic) {
                    if (!isValid) {
                        return false;
                    }
                    for (var nodeString in this.nodes.nodes) {
                        if (this.nodes.nodes.hasOwnProperty(nodeString)) {
                            var node = this.nodes.nodes[nodeString];
                            var alphabet = angular.copy(this.alphabet);
                            // Loop through each of the node's outward edges
                            node.toEdges.edges.forEach(function (edge) {
                                var transitionChar = edge.transition.toString();
                                // There MUST be one transition for every node
                                if (transitionChar !== jsflap.BLANK && transitionChar !== jsflap.LAMBDA && alphabet.hasOwnProperty(transitionChar)) {
                                    delete alphabet[transitionChar];
                                }
                                else {
                                    isValid = false;
                                }
                            });
                            if (!isValid) {
                                break;
                            }
                            if (Object.keys(alphabet).length > 0) {
                                isValid = false;
                                break;
                            }
                        }
                    }
                    return isValid;
                }
                else {
                    return isValid;
                }
            };
            return FAGraph;
        })();
        Graph.FAGraph = FAGraph;
    })(Graph = jsflap.Graph || (jsflap.Graph = {}));
})(jsflap || (jsflap = {}));



var jsflap;
(function (jsflap) {
    var Machine;
    (function (Machine) {
        var FAMachine = (function () {
            /**
             * Creates a new machine based on a graph
             * @param graph
             */
            function FAMachine(graph) {
                this.setGraph(graph);
            }
            /**
             * Sets the graph for the machine
             * @param graph
             */
            FAMachine.prototype.setGraph = function (graph) {
                this.graph = graph;
            };
            /**
             * Runs a string on the machine to see if it passes or fails
             * @param input
             * @returns {boolean}
             * @param graph
             */
            FAMachine.prototype.run = function (input, graph) {
                if (graph) {
                    this.graph = graph;
                }
                if (!this.graph.isValid()) {
                    throw new Error('Invalid graph');
                }
                var initialNode = this.graph.getInitialNode(), initialState = new Machine.FAMachineState(input, initialNode);
                // Trivial case
                if (!initialNode) {
                    return false;
                }
                // Setup for backtracking
                this.visitedStates = {};
                this.visitedStates[initialState.toString()] = initialState;
                this.queue = [initialState];
                while (this.queue.length > 0) {
                    // Get the state off the front of the queue
                    this.currentState = this.queue.shift();
                    // Check if we are in a final state
                    if (this.currentState.isFinal()) {
                        return true;
                    }
                    // Get the next possible valid states based on the input
                    var nextStates = this.currentState.getNextStates();
                    for (var nextStateIndex = 0; nextStateIndex < nextStates.length; nextStateIndex++) {
                        var nextState = nextStates[nextStateIndex];
                        // Check if we have already visited this state before
                        if (!this.visitedStates.hasOwnProperty(nextState.toString())) {
                            // We haven't, add it to our visited state list and queue
                            this.visitedStates[nextState.toString()] = nextState;
                            this.queue.push(nextState);
                        }
                    }
                }
                // If we got here the states were all invalid
                return false;
            };
            return FAMachine;
        })();
        Machine.FAMachine = FAMachine;
    })(Machine = jsflap.Machine || (jsflap.Machine = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Machine;
    (function (Machine) {
        var FAMachineState = (function () {
            /**
             * Create a new NFA Machine state
             * @param input
             * @param node
             */
            function FAMachineState(input, node) {
                this.input = input;
                this.node = node;
            }
            /**
             * Determines if this state is final
             * @returns {boolean}
             */
            FAMachineState.prototype.isFinal = function () {
                return this.input.length === 0 && this.node.final;
            };
            /**
             * Gets the next possible states
             * @returns {Array}
             */
            FAMachineState.prototype.getNextStates = function () {
                var edgeList = this.node.toEdges.edges, nextStates = [];
                for (var edgeName in edgeList) {
                    if (edgeList.hasOwnProperty(edgeName)) {
                        var edge = edgeList[edgeName];
                        // See if we can follow this edge
                        var transition = edge.transition;
                        if (transition.canFollowOn(this.input)) {
                            var inputLength = transition.character.length === 1 && transition.character !== jsflap.LAMBDA ? 1 : 0;
                            nextStates.push(new FAMachineState(this.input.substr(inputLength), edge.to));
                        }
                    }
                }
                return nextStates;
            };
            /**
             * Returns a string representation of the state
             * @returns {string}
             */
            FAMachineState.prototype.toString = function () {
                return '(' + this.input + ', ' + this.node.toString() + ')';
            };
            return FAMachineState;
        })();
        Machine.FAMachineState = FAMachineState;
    })(Machine = jsflap.Machine || (jsflap.Machine = {}));
})(jsflap || (jsflap = {}));





var jsflap;
(function (jsflap) {
    var Point;
    (function (Point) {
        /**
         * The point class
         */
        var MPoint = (function () {
            /**
             * Create a new mutable point
             * @param x
             * @param y
             */
            function MPoint(x, y) {
                this.x = x;
                this.y = y;
            }
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.MPoint}
             */
            MPoint.prototype.getMPoint = function () {
                return new Point.MPoint(this.x, this.y);
            };
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.IMPoint}
             */
            MPoint.prototype.getIMPoint = function () {
                return new Point.IMPoint(this.x, this.y);
            };
            /**
             * Gets the distance between two points
             * @param other
             * @returns {number}
             */
            MPoint.prototype.getDistanceTo = function (other) {
                return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            };
            /**
             * Gets the angle between two points
             * @param other
             * @returns {number}
             */
            MPoint.prototype.getAngleTo = function (other) {
                return Math.atan((this.y - other.y) / (this.x - other.x));
            };
            MPoint.prototype.toString = function () {
                return this.x + ', ' + this.y;
            };
            return MPoint;
        })();
        Point.MPoint = MPoint;
    })(Point = jsflap.Point || (jsflap.Point = {}));
})(jsflap || (jsflap = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="MPoint.ts"/>
var jsflap;
(function (jsflap) {
    var Point;
    (function (Point) {
        /**
         * The point class
         */
        var IMPoint = (function (_super) {
            __extends(IMPoint, _super);
            /**
             * Create a new imutable point
             * @param x
             * @param y
             */
            function IMPoint(x, y) {
                _super.call(this, x, y);
            }
            Object.defineProperty(IMPoint, "x", {
                set: function (value) {
                    throw new Error("Can't change coordinates of an immutable point");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IMPoint, "y", {
                set: function (value) {
                    throw new Error("Can't change coordinates of an immutable point");
                },
                enumerable: true,
                configurable: true
            });
            return IMPoint;
        })(Point.MPoint);
        Point.IMPoint = IMPoint;
    })(Point = jsflap.Point || (jsflap.Point = {}));
})(jsflap || (jsflap = {}));



var jsflap;
(function (jsflap) {
    var Transition;
    (function (Transition) {
        /**
         * A Transition of a single character in an NFA
         */
        var CharacterTransition = (function () {
            /**
             * Creates a new single char transition
             * @param character
             */
            function CharacterTransition(character) {
                if (character.length > 1) {
                    throw new Error("Character Transition length must be less than or equal to 1");
                }
                else {
                    this.character = character;
                }
            }
            /**
             * Gets the string representation of the transition
             * @returns {string}
             */
            CharacterTransition.prototype.toString = function () {
                return this.character;
            };
            /**
             * Determines if the input matches this transition
             * @param input
             * @returns {boolean}
             */
            CharacterTransition.prototype.canFollowOn = function (input) {
                return this.character === jsflap.LAMBDA ? true : (input.charAt(0) === this.character);
            };
            return CharacterTransition;
        })();
        Transition.CharacterTransition = CharacterTransition;
    })(Transition = jsflap.Transition || (jsflap.Transition = {}));
})(jsflap || (jsflap = {}));



var jsflap;
(function (jsflap) {
    var Transition;
    (function (Transition) {
        /**
         * A Transition of a multi character in an DFA
         */
        var MultiCharacterTransition = (function () {
            /**
             * Creates a new multi char transition
             * @param characters
             */
            function MultiCharacterTransition(characters) {
                this.characters = characters;
            }
            /**
             * Gets the string representation of the transition
             * @returns {string}
             */
            MultiCharacterTransition.prototype.toString = function () {
                return this.characters;
            };
            return MultiCharacterTransition;
        })();
        Transition.MultiCharacterTransition = MultiCharacterTransition;
    })(Transition = jsflap.Transition || (jsflap.Transition = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Visualization;
    (function (Visualization) {
        var EdgeVisualization = (function () {
            /**
             * Creates the node
             * @param start
             * @param end
             * @param control
             * @param model
             */
            function EdgeVisualization(model, start, end, control) {
                this.model = model;
                if (start !== end) {
                    this.start = start.getAnchorPointFrom(end.position);
                    this.end = end.getAnchorPointFrom(start.position);
                    this.control = control ? control : new jsflap.Point.MPoint((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
                }
                else {
                    var anchorPoints = start.getSelfAnchorPoints();
                    this.start = anchorPoints[0];
                    this.end = anchorPoints[1];
                    this.control = control ? control : new jsflap.Point.MPoint((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2 - 80);
                }
            }
            /**
             * Gets the path string
             */
            EdgeVisualization.prototype.getPath = function () {
                return 'M' + this.start + ' Q' + this.control + ' ' + this.end;
            };
            /**
             * Gets the position of where the transition text should be
             * @returns {jsflap.Point.IMPoint}
             */
            EdgeVisualization.prototype.getTransitionPoint = function () {
                // Quadratic Bezier Curve formula evaluated halfway
                var t = 0.5, x = (1 - t) * (1 - t) * this.start.x + 2 * (1 - t) * t * this.control.x + t * t * this.end.x, y = (1 - t) * (1 - t) * this.start.y + 2 * (1 - t) * t * this.control.y + t * t * this.end.y;
                return new jsflap.Point.IMPoint(x, y);
            };
            return EdgeVisualization;
        })();
        Visualization.EdgeVisualization = EdgeVisualization;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Visualization;
    (function (Visualization) {
        var FutureEdgeVisualization = (function () {
            /**
             * Creates the node
             * @param start
             * @param end
             */
            function FutureEdgeVisualization(start, end) {
                this._start = start;
                this._end = end;
                this.elm = null;
            }
            /**
             * Adds the visualization to the svg
             * @param svg
             */
            FutureEdgeVisualization.prototype.addTo = function (svg) {
                this.elm = svg.append('line').attr('stroke', "#888");
                this.update();
            };
            /**
             * Removes the element from the svg
             */
            FutureEdgeVisualization.prototype.remove = function () {
                this.elm.remove();
                this.elm = null;
            };
            Object.defineProperty(FutureEdgeVisualization.prototype, "start", {
                /**
                 * Gets the starting point
                 * @returns {Point.IPoint}
                 */
                get: function () {
                    return this._start;
                },
                /**
                 * Sets the starting point and updates the element if it exists
                 * @param point
                 */
                set: function (point) {
                    this._start.x = point.x;
                    this._start.y = point.y;
                    if (this.elm && point) {
                        this.elm.attr('x1', point.x).attr('y1', point.y);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FutureEdgeVisualization.prototype, "end", {
                /**
                 * Gets the ending point
                 * @returns {Point.MPoint}
                 */
                get: function () {
                    return this._end;
                },
                /**
                 * Sets the ending point and updates the element if it exists
                 * @param point
                 */
                set: function (point) {
                    this._end.x = point.x;
                    this._end.y = point.y;
                    if (this.elm && point) {
                        this.elm.attr('x2', point.x).attr('y2', point.y);
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Refresh the start and end points
             */
            FutureEdgeVisualization.prototype.update = function () {
                // Updates the start/end points
                this.start = this._start;
                this.end = this._end;
            };
            return FutureEdgeVisualization;
        })();
        Visualization.FutureEdgeVisualization = FutureEdgeVisualization;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Visualization;
    (function (Visualization) {
        var NodeVisualization = (function () {
            /**
             * Creates the node
             * @param model
             * @param position
             */
            function NodeVisualization(model, position) {
                /**
                 * The radius of the circle
                 */
                this.radius = 20;
                this.position = position;
                this.model = model;
                model.setVisualization(this);
            }
            /**
             * Gets an anchor point on the edge of the circle from any other given point
             * @param point
             * @returns {jsflap.Point.MPoint}
             */
            NodeVisualization.prototype.getAnchorPointFrom = function (point) {
                var posX = this.position.x, posY = this.position.y, r = this.radius, dx = point.x - posX, dy = point.y - posY, theta = Math.atan(dy / dx), trigSide = (dx >= 0) ? 1 : -1, anchorX = posX + trigSide * r * Math.cos(theta), anchorY = posY + trigSide * r * Math.sin(theta);
                return new jsflap.Point.MPoint(anchorX, anchorY);
            };
            /**
             * Gets the self anchor points if an edge goes to the same node
             * @returns {any[]}
             */
            NodeVisualization.prototype.getSelfAnchorPoints = function () {
                var posX = this.position.x, posY = this.position.y, r = this.radius, theta1 = 2 * Math.PI / 6, trigSide1 = -1, theta2 = 4 * Math.PI / 6, trigSide2 = -1, anchorX1 = posX + trigSide1 * r * Math.cos(theta1), anchorY1 = posY + trigSide1 * r * Math.sin(theta1), anchorX2 = posX + trigSide2 * r * Math.cos(theta2), anchorY2 = posY + trigSide2 * r * Math.sin(theta2);
                return [
                    new jsflap.Point.MPoint(anchorX1, anchorY1),
                    new jsflap.Point.MPoint(anchorX2, anchorY2),
                ];
            };
            return NodeVisualization;
        })();
        Visualization.NodeVisualization = NodeVisualization;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Visualization;
    (function (Visualization) {
        var initialStatePath = [
            { "x": -20, "y": -20 },
            { "x": 0, "y": 0 },
            { "x": -20, "y": 20 },
            { "x": -20, "y": -20 }
        ];
        var VisualizationCollection = (function () {
            /**
             * Creates a new visualization collection
             * @param svg
             */
            function VisualizationCollection(svg, state) {
                this.svg = svg;
                this.state = state;
                this.nodes = [];
                this.edges = [];
                this.update();
            }
            /**
             * Updates the visualizations
             */
            VisualizationCollection.prototype.update = function () {
                var _this = this;
                var nodes = this.svg.selectAll("circle.node").data(this.nodes);
                var newNodes = nodes.enter().append("circle").classed('node', true).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr('fill', "#008cba").attr("r", function (d) { return d.radius - 10; }).attr('opacity', 0);
                var nodeContextMenu = function (node) {
                    var event = d3.event;
                    _this.state.contextMenuOptions = {};
                    if (node.model.initial) {
                        _this.state.contextMenuOptions['Remove Initial'] = function () {
                            node.model.initial = false;
                            _this.update();
                        };
                    }
                    else {
                        _this.state.contextMenuOptions['Make Initial'] = function () {
                            node.model.initial = true;
                            _this.update();
                        };
                    }
                    if (node.model.final) {
                        _this.state.contextMenuOptions['Remove Final'] = function () {
                            node.model.final = false;
                            _this.update();
                        };
                    }
                    else {
                        _this.state.contextMenuOptions['Make Final'] = function () {
                            node.model.final = true;
                            _this.update();
                        };
                    }
                };
                newNodes.on('contextmenu', nodeContextMenu);
                newNodes.transition().ease("elastic").duration(300).attr("r", function (d) { return d.radius; }).attr('opacity', 1);
                nodes.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                nodes.exit().remove();
                var nodeLabels = this.svg.selectAll("text.nodeLabel").data(this.nodes);
                var newNodeLables = nodeLabels.enter().append('text').classed('nodeLabel', true).text(function (d) { return d.model.label; }).attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; }).attr("font-family", "sans-serif").attr("font-size", "18px").attr("fill", "#FFF").attr('opacity', 0);
                newNodeLables.on('contextmenu', nodeContextMenu);
                newNodeLables.transition().delay(100).duration(300).attr('opacity', 1);
                nodeLabels.attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; });
                nodeLabels.exit().remove();
                //var initialNodes
                var edgePaths = this.svg.selectAll("path.edge").data(this.edges);
                edgePaths.enter().append('path').classed('edge', true).attr('d', function (d) { return d.getPath(); }).attr('stroke', '#333').attr('stroke-width', '1').attr('opacity', .8).transition().duration(300).attr('opacity', 1).attr('style', "marker-end:url(#markerArrow)");
                edgePaths.exit().remove();
                /*var edgeTransitions = d3.select(document.querySelector('section.board-container')).selectAll('input.transition')
                 .data(this.edges);
    
                 edgeTransitions
                 .enter()
                 .append('input')
                 .classed('transition', true)
                 .attr('type', 'text')
                 .attr('maxlength', '1')
                 .style({
                 top: (d: Visualization.EdgeVisualization) =>  d.pathCoords[1].y - 15 + 'px',
                 left: (d: Visualization.EdgeVisualization) =>  d.pathCoords[1].x - 30 + 'px'
                 })
                 .attr('value', (d: Visualization.EdgeVisualization) => d.model.transition.toString())
                 .on('keypress', (edge: Visualization.EdgeVisualization) => {
                 var target = (<HTMLInputElement> d3.event.target);
                 (<Transition.CharacterTransition> edge.model.transition).character = target.value;
    
                 if ((<KeyboardEvent> d3.event).which === 13) {
                 target.blur();
                 }
                 });*/
                var edgeTransitions = this.svg.selectAll('text.transition').data(this.edges);
                var newEdgeTransitions = edgeTransitions.enter().append('text').classed('transition', true).attr("font-family", "sans-serif").attr("font-size", "16px").attr("text-anchor", "middle").attr("fill", "#000").attr('x', function (d) { return d.getTransitionPoint().x; }).attr('y', function (d) { return d.getTransitionPoint().y; }).text(function (d) { return d.model.transition.toString(); });
                newEdgeTransitions.on('mousedown', function () {
                    var event = d3.event;
                    event.stopPropagation();
                    event.preventDefault();
                }).on("mouseup", function (d) {
                    _this.editTransition(d);
                });
                newEdgeTransitions.attr('opacity', 0).transition().duration(300).attr('opacity', 1);
            };
            /**
             * Adds a node to the visualization collection
             * @param node
             */
            VisualizationCollection.prototype.addNode = function (node) {
                this.nodes.push(node);
                this.update();
                return node;
            };
            /**
             * Adds an edge to the visualization collection
             * @param edge
             */
            VisualizationCollection.prototype.addEdge = function (edge) {
                this.edges.push(edge);
                this.update();
                return edge;
            };
            /**
             * Gets the nearest node from a point
             * @param point
             * @returns {NearestNode}
             */
            VisualizationCollection.prototype.getNearestNode = function (point) {
                var nearestNode = {
                    node: null,
                    distance: Infinity,
                    hover: false
                };
                this.nodes.forEach(function (node) {
                    var distance = point.getDistanceTo(node.position);
                    if (distance < nearestNode.distance) {
                        nearestNode.node = node;
                        nearestNode.distance = distance;
                        nearestNode.hover = nearestNode.distance <= node.radius;
                    }
                });
                return nearestNode;
            };
            VisualizationCollection.prototype.editTransition = function (d, node) {
                // Adapted from http://bl.ocks.org/GerHobbelt/2653660
                var _this = this;
                // TODO: Generalize this transition editing
                var target = node || d3.event.target;
                // Need to figure out positions better
                var position = target.getBoundingClientRect();
                var bbox = target.getBBox();
                var el = d3.select(target);
                var frm = this.svg.append("foreignObject");
                el.node();
                function updateTransition() {
                    d.model.transition.character = inp.node().value || jsflap.LAMBDA;
                    el.text(function (d) {
                        return d.model.transition.toString();
                    });
                    _this.svg.select("foreignObject").remove();
                    _this.state.modifyEdgeTransition = null;
                }
                var inp = frm.attr("x", position.left - 3).attr("y", bbox.y - 3).attr("width", 30).attr("height", 25).append("xhtml:form").append("input").attr("value", function () {
                    this.focus();
                    _this.state.modifyEdgeTransition = this;
                    var value = d.model.transition.toString();
                    return value !== jsflap.LAMBDA ? value : '';
                }).attr("style", "width: 20px; border: none; padding: 3px; outline: none; background-color: #fff; border-radius: 3px").attr("maxlength", "1");
                inp.transition().style('background-color', '#eee');
                inp.on("blur", function () {
                    updateTransition();
                    frm.remove();
                }).on("keypress", function () {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        updateTransition();
                        this.remove();
                    }
                });
            };
            return VisualizationCollection;
        })();
        Visualization.VisualizationCollection = VisualizationCollection;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));

describe("Board", function () {
    var board, svgElm, graph;
    beforeEach(function () {
        svgElm = document.createElement('svg');
        graph = new jsflap.Graph.FAGraph(false);
        board = new jsflap.Board.Board(svgElm, graph, jasmine.createSpyObj('rootScope', ['$broadcast']));
    });
    it("should exist", function () {
        expect(board).not.toBe(null);
        expect(typeof board !== 'undefined').toBe(true);
    });
});

describe("Character Transition", function () {
    it("should exist", function () {
        var transition = new jsflap.Transition.CharacterTransition('a');
        expect(typeof transition !== 'undefined').toBe(true);
    });
    it("should allow an empty string", function () {
        expect(function () {
            new jsflap.Transition.CharacterTransition('');
        }).not.toThrowError();
    });
    it("should not allow a string greater than 1", function () {
        expect(function () {
            new jsflap.Transition.CharacterTransition('ab');
        }).toThrowError();
    });
});

describe("Edge", function () {
    var NodeA, NodeB, NodeC, Transition1;
    beforeEach(function () {
        NodeA = new jsflap.Node('A');
        NodeB = new jsflap.Node('B');
        NodeC = new jsflap.Node('C');
        Transition1 = new jsflap.Transition.CharacterTransition('a');
    });
    it("should exist", function () {
        var edge = new jsflap.Edge(NodeA, NodeB, Transition1);
        expect(typeof edge !== 'undefined').toBe(true);
    });
    it("should add the edge to the nodes", function () {
        var edge = new jsflap.Edge(NodeA, NodeB, Transition1);
        expect(NodeA.toEdges.has(edge)).toBe(true);
        expect(NodeB.fromEdges.has(edge)).toBe(true);
    });
});

describe("EdgeList", function () {
    var N1, N2, N3, T1, T2, E1, E1copy, E2;
    beforeEach(function () {
        N1 = new jsflap.Node('N1');
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3');
        T1 = new jsflap.Transition.CharacterTransition('a');
        T2 = new jsflap.Transition.CharacterTransition('b');
        E1 = new jsflap.Edge(N1, N2, T1);
        E1copy = new jsflap.Edge(N1, N2, T1);
        E2 = new jsflap.Edge(N2, N3, T2);
    });
    it("should exist", function () {
        var edgeList = new jsflap.EdgeList();
        expect(typeof edgeList !== 'undefined').toBe(true);
    });
    it("should be able to add edges", function () {
        var edgeList = new jsflap.EdgeList([E1, E2]);
        expect(edgeList.has(E1)).toBe(true);
        expect(edgeList.has(E2)).toBe(true);
        expect(edgeList.size).toBe(2);
    });
    it("should be able to get an edge by reference", function () {
        var edgeList = new jsflap.EdgeList();
        edgeList.add(E1);
        var E1get = edgeList.get(E1);
        expect(E1).toBe(E1get);
    });
    it("should be able to get an edge by string", function () {
        var edgeList = new jsflap.EdgeList();
        edgeList.add(E1);
        var E1get = edgeList.get(E1.toString());
        expect(E1).toBe(E1get);
    });
    it('should not add duplicate edges', function () {
        var edgeList = new jsflap.EdgeList([E1, E2]);
        expect(edgeList.has(E1)).toBe(true);
        expect(edgeList.has(E1copy)).toBe(true);
        // Try adding a copy edge
        var beforeSize = edgeList.size;
        expect(beforeSize).toBe(2);
        var edgeAdded = edgeList.add(E1copy);
        // Check to make sure it wasn't added and that the original copy is returned
        expect(edgeList.size).toBe(2);
        expect(edgeAdded).toBe(E1);
    });
});

describe('FAGraph', function () {
    var N1, N2, N3, T1, T2, E1, E1copy, E2, graphString = 'NFA:({a, b}, {N1, N2}, {(N1, N1, a), (N1, N2, b)}, N1, {N2})';
    beforeEach(function () {
        N1 = new jsflap.Node('N1', { initial: true });
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3', { final: true });
        T1 = new jsflap.Transition.CharacterTransition('a');
        T2 = new jsflap.Transition.CharacterTransition('b');
        E1 = new jsflap.Edge(N1, N2, T1);
        E1copy = new jsflap.Edge(N1, N2, T1);
        E2 = new jsflap.Edge(N2, N3, T2);
    });
    it("should exist", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph).not.toBe(null);
        expect(typeof graph !== 'undefined').toBe(true);
    });
    it("should be able to add edges and nodes at creation", function () {
        var graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3], [E1, E2]);
        expect(graph.getNodes().size).toBe(3);
        expect(graph.getEdges().size).toBe(2);
    });
    it("should be able to add nodes after creation", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode(N1);
        expect(graph.getNode('N1')).toBe(N1);
    });
    it("should be able to add edges after creation", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode(N1);
        graph.addNode(N2);
        graph.addEdge(E1);
        expect(graph.hasEdge(E1)).toBe(true);
    });
    it("should be able to add edges after creation with string transitions", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode('N1');
        graph.addNode('N2');
        graph.addEdge('N1', 'N2', 'a');
        expect(graph.hasEdge(E1)).toBe(true);
    });
    it("should not be able to add edges with nodes that are not already in the graph", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(function () {
            graph.addEdge(E1);
        }).toThrowError();
    });
    it("should be able to get the initial node", function () {
        var graph = new jsflap.Graph.FAGraph(false, [N2, N1]);
        expect(graph.getInitialNode()).toBe(N1);
    });
    it("should overwrite the initial node if a new one is added", function () {
        var graph = new jsflap.Graph.FAGraph(false, [N1]);
        expect(graph.getInitialNode()).toBe(N1);
        var N4 = new jsflap.Node('N4', { initial: true });
        graph.addNode(N4);
        expect(graph.getInitialNode()).toBe(N4);
        expect(N1.initial).toBe(false);
    });
    it("should be able to get the final nodes", function () {
        var N4 = new jsflap.Node('N4', { final: true }), graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3, N4]), finalNodes = graph.getFinalNodes();
        expect(finalNodes.has(N3)).toBe(true);
        expect(finalNodes.has(N4)).toBe(true);
    });
    it("should update the alphabet accordingly", function () {
        var graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3]), alphabet = graph.getAlphabet();
        graph.addEdge(E1); // Transition on a
        expect(alphabet.hasOwnProperty('a')).toBe(true);
        graph.addEdge(E2); // Transition on b
        expect(alphabet.hasOwnProperty('b')).toBe(true);
    });
    it("should be able to output a configuration file", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode('N1', { initial: true });
        graph.addNode('N2', { final: true });
        graph.addEdge('N1', 'N1', 'a');
        graph.addEdge('N1', 'N2', 'b');
        expect(graph.toString()).toBe(graphString);
    });
    it("should be able to load from configuration file", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph.fromString(graphString)).toBe(true);
        expect(graph.toString()).toBe(graphString);
        var graphString2 = 'NFA:({}, {}, {}, , {})';
        expect(graph.fromString(graphString2)).toBe(true);
        expect(graph.toString()).toBe(graphString2);
        var graphString3 = 'DFA:({a}, {q0}, {(q0, q0, a)}, q0, {q0})';
        expect(graph.fromString(graphString3)).toBe(true);
        expect(graph.toString()).toBe(graphString3);
    });
    it("should fail on an invalid configuration string", function () {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph.fromString(graphString + 'a')).toBe(false);
        var graphString2 = 'DPDA:({}, {}, {}, , {})';
        expect(graph.fromString(graphString2)).toBe(false);
        var graphString3 = 'DFA:({a} {q0}, {(q0, q0, a)}, q0, {q0})';
        expect(graph.fromString(graphString3)).toBe(false);
        var graphString4 = 'NFA:({a}, {q0}, {(q0, q1, a}, q0, {q0})';
        expect(graph.fromString(graphString4)).toBe(false);
    });
});

describe("FA Machine", function () {
    var graph, machine, machineTests;
    beforeEach(function () {
        machineTests = loadConfigurations('FAMachine');
        jasmine.addMatchers({
            toAcceptString: function (util, customEqualityTesters) {
                return {
                    compare: function (machine, input) {
                        var result = {
                            pass: false,
                            message: ''
                        };
                        result.pass = machine.run(input);
                        if (result.pass) {
                            result.message = "Expected machine \"" + machine.graph.toString() + "\" to reject the string \"" + input + "\"";
                        }
                        else {
                            result.message = "Expected machine \"" + machine.graph.toString() + "\" to accept the string \"" + input + "\"";
                        }
                        return result;
                    }
                };
            }
        });
    });
    it("should exist", function () {
        graph = new jsflap.Graph.FAGraph(false);
        machine = new jsflap.Machine.FAMachine(graph);
        expect(typeof machine !== 'undefined').toBe(true);
    });
    it('should match all configurations', function () {
        graph = new jsflap.Graph.FAGraph(false);
        machine = new jsflap.Machine.FAMachine();
        machineTests.forEach(function (configuration, index) {
            // Try to load the configuration, then set the it as the machine's graph
            expect(graph.fromString(configuration.config)).toBe(true);
            machine.setGraph(graph);
            // Try each string that the machine should accept
            configuration.accept.forEach(function (input) {
                expect(machine).toAcceptString(input);
            });
            // Try each string that the machine should reject
            configuration.reject.forEach(function (input) {
                expect(machine).not.toAcceptString(input);
            });
        });
    });
});

describe("MultiCharacter Transition", function () {
    it("should exist", function () {
        var transition = new jsflap.Transition.MultiCharacterTransition('a');
        expect(typeof transition !== 'undefined').toBe(true);
    });
    it("should allow an empty string", function () {
        expect(function () {
            new jsflap.Transition.MultiCharacterTransition('');
        }).not.toThrowError();
    });
    it("should not allow strings greater than 1", function () {
        expect(function () {
            new jsflap.Transition.MultiCharacterTransition('ab');
        }).not.toThrowError();
    });
});

describe("Node", function () {
    it("should exist", function () {
        var node = new jsflap.Node('N1');
        expect(typeof node !== 'undefined').toBe(true);
    });
    it("should be able to add edges", function () {
        var N1 = new jsflap.Node('N1'), N2 = new jsflap.Node('N2'), T1 = new jsflap.Transition.CharacterTransition('a'), E1 = new jsflap.Edge(N1, N2, T1);
        expect(N1.toEdges.has(E1)).toBe(true);
        expect(N2.fromEdges.has(E1)).toBe(true);
    });
    it("should be able to have options", function () {
        var N1 = new jsflap.Node('N1', {
            initial: true,
            final: true
        });
        expect(N1.initial).toBe(true);
        expect(N1.final).toBe(true);
    });
});

describe("NodeList", function () {
    var N1, N1copy, N2, N3;
    beforeEach(function () {
        N1 = new jsflap.Node('N1');
        N1copy = new jsflap.Node('N1');
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3');
    });
    it("should exist", function () {
        var nodeList = new jsflap.NodeList();
        expect(typeof nodeList !== 'undefined').toBe(true);
    });
    it("should be able to add nodes", function () {
        var nodeList = new jsflap.NodeList([N1, N2]);
        expect(nodeList.has(N1)).toBe(true);
        expect(nodeList.has(N2)).toBe(true);
        expect(nodeList.size).toBe(2);
    });
    it("should be able to get an node by reference", function () {
        var nodeList = new jsflap.NodeList();
        nodeList.add(N1);
        var N1get = nodeList.get(N1);
        expect(N1).toBe(N1get);
    });
    it("should be able to get an node by string", function () {
        var nodeList = new jsflap.NodeList();
        nodeList.add(N1);
        var N1get = nodeList.get(N1.toString());
        expect(N1).toBe(N1get);
    });
    it("should not be able to add duplicate nodes", function () {
        var nodeList = new jsflap.NodeList([N1]);
        expect(nodeList.has(N1)).toBe(true);
        expect(nodeList.has(N1copy)).toBe(true);
        // Try adding a copy node
        var beforeSize = nodeList.size;
        expect(beforeSize).toBe(1);
        var nodeAdded = nodeList.add(N1copy);
        // Check to make sure it wasn't added and that the original copy is returned
        expect(nodeList.size).toBe(1);
        expect(nodeAdded).toBe(N1);
    });
});

/**
 * Loads all configurations
 * @param name
 * @returns {any}
 */
function loadConfigurations(name) {
    return JSON.parse(__html__['test/configurations/' + name + '.json']);
}
