/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jsflapBoard', function($rootScope) {
            return {
                require:'^jsflapApp',
                link: function (scope, elm, attrs, jsflapApp) {
                    jsflapApp.board = new jsflap.Board.Board(elm[0], jsflapApp.graph, $rootScope);
                    jsflapApp.board.onBoardUpdateFn = jsflapApp.onBoardUpdate;
                }
            };
        })
        .directive('jsflapBoardContextMenu', function() {
            return {
                scope: {},
                restrict: 'A',
                template: '<ul id="contextMenu"  class="side-nav" ng-style="{top: posTop + \'px\', left: posLeft + \'px\'}" ng-show="show">' +
                '<li ng-repeat="option in options"><a href="#" ng-bind="option.display" ng-click="option.callback()"></a></li>' +
                '</ul>',
                link: {
                    pre: function(scope) {
                        scope.show = false;
                        scope.posLeft = 0;
                        scope.posTop = 0;
                    },
                    post: function (scope, elm, attrs) {
                        scope.$on("contextmenu", function(event, vars) {
                            scope.posLeft = vars.event.x;
                            scope.posTop = vars.event.y;
                            scope.options = vars.options || [];
                            scope.show = scope.options.length !== 0;
                            scope.$digest();
                        });

                        document.addEventListener('click', function() {
                            if(scope.show) {
                                scope.show = false;
                                scope.$digest();
                            }
                        });

                    }
                }
            };
        })
        .directive('jsflapTestInputs', function() {
            var inputTemplate = {
                inputString: '',
                result: null
            };
            return {
                restrict: 'A',
                link: {
                    pre: function(scope, elm, attrs) {
                        var machine = new jsflap.Machine.FAMachine(window.graph);
                        scope.resultTotals = [
                            0,
                            0,
                            0
                        ];

                        function updateTests() {
                            console.log('STARTING TESTS');
                            scope.resultTotals[0] = 0;
                            scope.resultTotals[1] = 0;
                            scope.resultTotals[2] = 0;
                            var t0 = performance.now();
                            scope.testInputs.forEach(function(testInput) {
                                try {
                                    testInput.result = machine.run(testInput.inputString);
                                    scope.resultTotals[+(testInput.result)] += 1;
                                } catch(e) {
                                    // Invalid Graph
                                    scope.resultTotals[2] += 1;
                                    testInput.result = null;
                                }
                            });
                            var t1 = performance.now();

                            console.log("ENDED IN " + Math.round((t1 - t0) * 1000) / 1000 + " ms");
                        }

                        scope.testInputs = [
                            angular.copy(inputTemplate)
                        ];

                        scope.addTestInput = function() {
                            scope.testInputs.push(angular.copy(inputTemplate));
                            setTimeout(function() {
                                var inputs = elm.find('input');
                                inputs[inputs.length - 1].focus();
                            }, 10);
                            scope.$digest();
                        };
                        scope.$watch('testInputs', updateTests, true);
                        scope.$on('boardUpdate', updateTests);
                    },
                    post: function(scope, elm, attrs) {
                        scope.$on('createTestInput', function() {
                            scope.testInputs.push(angular.copy(inputTemplate));
                            setTimeout(function() {
                                var inputs = elm.find('input');
                                inputs[inputs.length - 1].focus();
                            }, 10);
                            scope.$digest();
                        });
                        scope.$on('removeTestInput', function(event, index) {
                            console.log('Here2');
                            scope.testInputs.splice(index, 1);
                            setTimeout(function() {
                                var inputs = elm.find('input');
                                inputs[index - 1].focus();
                            }, 10);
                            scope.$digest();
                        });
                    }
                }
            }
        })
        .directive('jsflapTestInput', function() {
            return {
                restrict: 'A',
                link: function(scope, elm, attrs) {

                    elm.on('keydown', function(event) {
                        switch(event.which) {
                            case 13:
                                scope.$emit('createTestInput');
                                break;
                            case 27:
                                (scope.testInputs.length > 1 && scope.$index == 0 )? scope.$emit('removeTestInput', scope.$index): void(0);
                                break;
                        }
                    });
                    elm.on('click', function() {
                        if(scope.$index === scope.testInputs.length - 1 && scope.testInput.inputString.length === 0) {
                            //scope.$emit('createTestInput', scope.$index, false);
                        }
                    });
                }
            }
        })
        .directive('jsflapApp', function() {
            return {
                controller: 'AppController',
                link: {
                    pre: function(scope) {
                    },
                    post: function() {

                    }
                }
            }
        })
        .controller('AppController', function($scope, $timeout) {
            this.graph = new jsflap.Graph.FAGraph(false);
            this.board = null;

            this.onBoardUpdate = function() {
                $timeout(function() {
                    $scope.$broadcast('boardUpdate');
                }, 1);
            };

            // For easy debugging
            window.graph = this.graph;
        })
        .controller('ContextController', function($scope) {
            $scope.message2 = 'the context';
        });
}(window, window.angular));
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
        /**
         * Removes a node from the list
         * @param node
         */
        NodeList.prototype.remove = function (node) {
            if (this.has(node)) {
                if (typeof node === 'string') {
                    delete this.nodes[node];
                    return true;
                }
                else if (node instanceof jsflap.Node) {
                    delete this.nodes[node.toString()];
                    return true;
                }
            }
            return false;
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
                /**
                 * The function to call after the board has been updated
                 */
                this.onBoardUpdateFn = null;
                this.svg = d3.select(svg);
                this.boardBase = this.svg.append("rect").attr("fill", "#FFFFFF").attr("width", svg.getBoundingClientRect().width).attr("height", svg.getBoundingClientRect().height);
                this.graph = graph;
                this.state = new _Board.BoardState();
                this.visualizations = new jsflap.Visualization.VisualizationCollection(this.svg, this);
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
                var nodeCount = this.graph.getNodes().size;
                var node = this.graph.addNode('q' + nodeCount), nodeV = new jsflap.Visualization.NodeVisualization(node, point.getMPoint());
                if (nodeCount === 0) {
                    this.setInitialNode(nodeV);
                }
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
             * Sets the initial node for the graph
             * @param node
             */
            Board.prototype.setInitialNode = function (node) {
                if (node) {
                    this.graph.setInitialNode(node.model);
                }
                else {
                    this.graph.setInitialNode(null);
                }
            };
            /**
             * Marks the final node for the graph
             * @param node
             */
            Board.prototype.markFinalNode = function (node) {
                this.graph.markFinalNode(node.model);
            };
            /**
             * Unmarks the final node for the graph
             * @param node
             */
            Board.prototype.unmarkFinalNode = function (node) {
                this.graph.unmarkFinalNode(node.model);
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
                    this.state.futureEdgeFrom = this.addNode(event.point);
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
                    if (this.state.futureEdgeSnapping) {
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
                if (event.which === 16 && !this.state.futureEdgeSnapping) {
                    this.state.futureEdgeSnapping = true;
                }
            };
            /**
             * The keyup event listener
             * @param event
             */
            Board.prototype.keyup = function (event) {
                if (event.which === 16 && this.state.futureEdgeSnapping) {
                    this.state.futureEdgeSnapping = false;
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
             * Updates the alphabet after any changes to the transitions
             */
            FAGraph.prototype.updateAlphabet = function () {
                var _this = this;
                // Update the alphabet
                this.edges.edges.forEach(function (edge) {
                    var transitionChar = edge.transition.toString();
                    if (!_this.alphabet.hasOwnProperty(transitionChar) && transitionChar !== jsflap.LAMBDA && transitionChar !== jsflap.BLANK) {
                        _this.alphabet[transitionChar] = true;
                    }
                });
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
                if (this.initialNode) {
                    this.initialNode.initial = false;
                }
                if (node) {
                    node.initial = true;
                    this.initialNode = node;
                }
                return node;
            };
            /**
             * Marks a node as final in the graph
             * @param node
             * @returns {jsflap.Node|any}
             */
            FAGraph.prototype.markFinalNode = function (node) {
                node.final = true;
                if (this.nodes.has(node) && !this.finalNodes.has(node)) {
                    this.finalNodes.add(node);
                }
                return node;
            };
            /**
             * Unmarks a node as final from the graph
             * @param node
             * @returns {jsflap.Node}
             */
            FAGraph.prototype.unmarkFinalNode = function (node) {
                node.final = false;
                if (this.nodes.has(node) && this.finalNodes.has(node)) {
                    this.finalNodes.remove(node);
                }
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
                this.updateAlphabet();
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
             * @param board
             */
            function VisualizationCollection(svg, board) {
                this.svg = svg;
                this.state = board.state;
                this.board = board;
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
                    var initialOption, finalOption;
                    if (node.model.initial) {
                        initialOption = {
                            display: 'Remove Initial',
                            callback: function () {
                                _this.board.setInitialNode(null);
                                _this.update();
                            }
                        };
                    }
                    else {
                        initialOption = {
                            display: 'Make Initial',
                            callback: function () {
                                _this.board.setInitialNode(node);
                                _this.update();
                            }
                        };
                    }
                    if (node.model.final) {
                        finalOption = {
                            display: 'Remove Final',
                            callback: function () {
                                _this.board.unmarkFinalNode(node);
                                _this.update();
                            }
                        };
                    }
                    else {
                        finalOption = {
                            display: 'Make Final',
                            callback: function () {
                                _this.board.markFinalNode(node);
                                _this.update();
                            }
                        };
                    }
                    _this.state.contextMenuOptions = [finalOption, initialOption];
                };
                newNodes.on('contextmenu', nodeContextMenu);
                newNodes.transition().ease("elastic").duration(300).attr("r", function (d) { return d.radius; }).attr('opacity', 1);
                nodes.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                nodes.exit().remove();
                var nodeLabels = this.svg.selectAll("text.nodeLabel").data(this.nodes);
                var newNodeLabels = nodeLabels.enter().append('text').classed('nodeLabel', true).text(function (d) { return d.model.label; }).attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; }).attr("font-family", "sans-serif").attr("font-size", "18px").attr("fill", "#FFF").attr('opacity', 0);
                newNodeLabels.on('contextmenu', nodeContextMenu);
                newNodeLabels.transition().delay(100).duration(300).attr('opacity', 1);
                nodeLabels.attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; });
                nodeLabels.exit().remove();
                var initialNodes = this.svg.selectAll("path.initialPath").data(this.nodes.filter(function (node) { return node.model.initial; }));
                initialNodes.transition().attr('d', function (d) { return 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z'; });
                var newInitialNodes = initialNodes.enter().append('path').classed('initialPath', true).attr('d', function (d) { return 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z'; }).attr('fill', "#333");
                newInitialNodes.attr('opacity', 0).transition().delay(100).duration(300).attr('opacity', 1);
                initialNodes.exit().attr('opacity', 1).transition().attr('opacity', 0).remove();
                var finalNodes = this.svg.selectAll("circle.finalCircle").data(this.nodes.filter(function (node) { return node.model.final; }));
                finalNodes.attr("r", function (d) { return d.radius - 3; }).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                var newFinalNodes = finalNodes.enter().append('circle').classed('finalCircle', true).attr("r", function (d) { return d.radius - 3; }).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr('stroke', "#FFF").attr('stroke-width', "1").attr('fill', "none");
                newFinalNodes.on('contextmenu', nodeContextMenu);
                newFinalNodes.attr('opacity', 0).transition().attr('opacity', 1);
                finalNodes.exit().attr('opacity', 1).transition().attr('opacity', 0).remove();
                var edgePaths = this.svg.selectAll("path.edge").data(this.edges);
                edgePaths.enter().append('path').classed('edge', true).attr('d', function (d) { return d.getPath(); }).attr('stroke', '#333').attr('stroke-width', '1').attr('opacity', .8).transition().duration(300).attr('opacity', 1).attr('style', "marker-end:url(#markerArrow)");
                edgePaths.exit().remove();
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
                if (typeof this.board.onBoardUpdateFn === 'function') {
                    this.board.onBoardUpdateFn();
                }
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
                    if (typeof _this.board.onBoardUpdateFn === 'function') {
                        _this.board.onBoardUpdateFn();
                    }
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
