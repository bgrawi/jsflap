/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', ['mm.foundation']);
    angular.module('jsflap')
        .directive('jsflapBoard', function($rootScope) {
            return {
                require:'^jsflapApp',
                link: function (scope, elm, attrs, jsflapApp) {
                    jsflapApp.setBoard(new jsflap.Board.Board(elm[0], jsflapApp.graph, $rootScope));
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
                require: '^jsflapApp',
                link: {
                    pre: function(scope, elm, attrs, jsflapApp) {
                        var machine = new jsflap.Machine.FAMachine();
                        scope.resultTotals = [
                            0,
                            0,
                            0
                        ];

                        function updateTests() {
                            //console.log('STARTING TESTS');
                            scope.resultTotals[0] = 0;
                            scope.resultTotals[1] = 0;
                            scope.resultTotals[2] = 0;
                            //var t0 = performance.now();
                            scope.testInputs.forEach(function(testInput) {
                                try {
                                    testInput.result = machine.run(testInput.inputString, jsflapApp.graph);
                                    scope.resultTotals[+(testInput.result)] += 1;
                                } catch(e) {
                                    // Invalid Graph
                                    scope.resultTotals[2] += 1;
                                    testInput.result = null;
                                }
                            });
                            //var t1 = performance.now();

                            //console.log("ENDED IN " + Math.round((t1 - t0) * 1000) / 1000 + " ms");
                        }

                        scope.testInputs = [];

                        scope.addTestInput = function() {
                            scope.testInputs.push(angular.copy(inputTemplate));
                            setTimeout(function() {
                                var inputs = elm.find('input');
                                inputs[inputs.length - 1].focus();
                            }, 10);
                        };
                        scope.$watch('testInputs', updateTests, true);
                        scope.$on('boardUpdate', updateTests);
                    },
                    post: function(scope, elm, attrs) {
                        scope.$on('createTestInput', function(event, index) {
                            scope.testInputs.splice(index + 1, 0, angular.copy(inputTemplate));
                            setTimeout(function() {
                                var inputs = elm.find('input');
                                inputs[index + 1].focus();
                            }, 10);
                            scope.$digest();
                        });
                        scope.$on('removeTestInput', function(event, index) {
                            scope.testInputs.splice(index, 1);
                            if(index > 0) {
                                setTimeout(function () {
                                    var inputs = elm.find('input');
                                    inputs[index - 1].focus();
                                }, 10);
                            }
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
                                scope.$emit('createTestInput', scope.$index);
                                break;
                            case 27:
                                scope.$emit('removeTestInput', scope.$index);
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
        .controller('AppController', function($scope, $timeout, $modal) {
            this.graph = new jsflap.Graph.FAGraph(false);
            this.board = null;

            $scope.graphString = '';
            this.onBoardUpdate = function() {
                $timeout(function() {
                    $scope.$broadcast('boardUpdate');
                    $scope.graphString = $scope.graph.toString();
                }, 1);
            };

            var self = this;
            this.setBoard = function(board) {
                self.board = board;
                $scope.board = self.board;
                window.board = self.board;
            };

            $scope.availableThemes = {
                'modern': 'Modern Theme',
                'classic': 'Classic Theme'
            };

            $scope.availableTypes = {
                'FA': 'Finite Automation',
                'PDA': 'Push-down Automation',
                'TM': 'Turning Machine'
            };

            $scope.graphMeta = {
                title: '',
                type: 'FA'
            };

            $scope.settings = {
                theme: 'modern'
            };

            $scope.openHelpModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/HelpModal.html',
                    controller: 'HelpModalController'
                });
            };

            // For easy debugging
            window.graph = this.graph;
            $scope.graph = this.graph;
        })
        .controller('ContextController', function($scope) {
            $scope.message2 = 'the context';
        })
        .controller('HelpModalController', function($scope, $modalInstance) {
            $scope.ok = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
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
            this.addNodes();
        }
        /**
         * Set the visualization
         * @param visualization
         * @param num
         */
        Edge.prototype.setVisualization = function (visualization, num) {
            this.visualization = visualization;
            this.visualizationNumber = num ? num : 0;
        };
        /**
         * Removes this edge from the nodes
         */
        Edge.prototype.removeNodes = function () {
            if (this.from) {
                this.from.removeToEdge(this);
            }
            if (this.to) {
                this.to.removeFromEdge(this);
            }
        };
        /**
         * Adds the edge to the nodes
         */
        Edge.prototype.addNodes = function () {
            // Add this edge to the other nodes
            if (this.from) {
                this.from.addToEdge(this);
            }
            if (this.to) {
                this.to.addFromEdge(this);
            }
        };
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
        /**
         * Removes a edge from the list
         * @param edge
         */
        EdgeList.prototype.remove = function (edge) {
            if (this.has(edge)) {
                if (typeof edge === 'string') {
                    var edgeObject = this.edgeMap[edge];
                    this.edges.splice(this.edges.indexOf(edgeObject), 1);
                    delete this.edgeMap[edge];
                    return true;
                }
                else if (edge instanceof jsflap.Edge) {
                    var edgeObject = this.edgeMap[edge.toString()];
                    this.edges.splice(this.edges.indexOf(edgeObject), 1);
                    delete this.edgeMap[edge.toString()];
                    return true;
                }
            }
            return false;
        };
        /**
         * Updates an edge's hash if it has changed
         * @param oldHash
         * @returns {*}
         */
        EdgeList.prototype.updateEdgeHash = function (oldHash) {
            var edgeObj = this.get(oldHash);
            if (edgeObj) {
                delete this.edgeMap[oldHash];
                this.edgeMap[edgeObj.toString()] = edgeObj;
                return edgeObj;
            }
            return null;
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
         * Removes a from edge from this node
         * @param edge
         * @returns {boolean}
         */
        Node.prototype.removeFromEdge = function (edge) {
            if (edge.to.toString() === this.toString()) {
                return this.fromEdges.remove(edge);
            }
            else {
                return false;
            }
        };
        /**
         * Removes a to edge to this node
         * @param edge
         * @returns {boolean}
         */
        Node.prototype.removeToEdge = function (edge) {
            if (edge.from.toString() === this.toString()) {
                return this.toEdges.remove(edge);
            }
            else {
                return false;
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
                    this._size--;
                    return true;
                }
                else if (node instanceof jsflap.Node) {
                    delete this.nodes[node.toString()];
                    this._size--;
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
    /**
     * Gets a new undo manager
     * @returns {{add: (function(any): (any|any)), setCallback: (function(any): undefined), undo: (function(): (any|any)), redo: (function(): (any|any)), clear: (function(): undefined), hasUndo: (function(): boolean), hasRedo: (function(): boolean), getCommands: (function(): Array)}}
     */
    function getUndoManager() {
        /*
         ADAPTED FROM:
         Simple Javascript undo and redo.
         https://github.com/ArthurClemens/Javascript-Undo-Manager
         LICENCE: MIT
         */
        var commands = [], index = -1, isExecuting = false, callback, 
        // functions
        execute;
        execute = function (command, action) {
            if (!command || typeof command[action] !== "function") {
                return this;
            }
            isExecuting = true;
            command[action]();
            isExecuting = false;
            return this;
        };
        return {
            /*
             Add a command to the queue.
             */
            add: function (command) {
                if (isExecuting) {
                    return this;
                }
                // if we are here after having called undo,
                // invalidate items higher on the stack
                commands.splice(index + 1, commands.length - index);
                commands.push(command);
                // set the current index to the end
                index = commands.length - 1;
                if (callback) {
                    callback();
                }
                return this;
            },
            /*
             Pass a function to be called on undo and redo actions.
             */
            setCallback: function (callbackFunc) {
                callback = callbackFunc;
            },
            /*
             Perform undo: call the undo function at the current index and decrease the index by 1.
             */
            undo: function () {
                var command = commands[index];
                if (!command) {
                    return this;
                }
                execute(command, "undo");
                index -= 1;
                if (callback) {
                    callback();
                }
                return this;
            },
            /*
             Perform redo: call the redo function at the next index and increase the index by 1.
             */
            redo: function () {
                var command = commands[index + 1];
                if (!command) {
                    return this;
                }
                execute(command, "redo");
                index += 1;
                if (callback) {
                    callback();
                }
                return this;
            },
            /*
             Clears the memory, losing all stored states. Reset the index.
             */
            clear: function () {
                var prev_size = commands.length;
                commands = [];
                index = -1;
                if (callback && (prev_size > 0)) {
                    callback();
                }
            },
            hasUndo: function () {
                return index !== -1;
            },
            hasRedo: function () {
                return index < (commands.length - 1);
            },
            getCommands: function () {
                return commands;
            }
        };
    }
    jsflap.getUndoManager = getUndoManager;
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
                /**
                 * To keep track of the number of nodes
                 * @type {number}
                 */
                this.nodeCount = 0;
                /**
                 * The undo manager
                 * @type {{add: (function(any): (any|any)), setCallback: (function(any): undefined), undo: (function(): (any|any)), redo: (function(): (any|any)), clear: (function(): undefined), hasUndo: (function(): boolean), hasRedo: (function(): boolean), getCommands: (function(): Array)}}
                 */
                this.undoManager = jsflap.getUndoManager();
                this.svg = d3.select(svg);
                this.boardBase = this.svg.select('g.background').append("rect").attr("fill", "#FFFFFF").attr("width", svg.getBoundingClientRect().width).attr("height", svg.getBoundingClientRect().height);
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
                // Mouse events
                this.svg.on('mouseup', function () {
                    _this.mouseup(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('mousedown', function () {
                    _this.mousedown(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('mousemove', function () {
                    _this.mousemove(new _Board.MouseEvent(d3.event, this));
                });
                // Touch events
                this.svg.on('touchstart', function () {
                    _this.mousedown(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('touchmove', function () {
                    _this.mousemove(new _Board.MouseEvent(d3.event, this));
                });
                this.svg.on('touchend', function () {
                    _this.mouseup(new _Board.MouseEvent(d3.event, this));
                });
                // Context menu events
                this.svg.on("contextmenu", function () {
                    $rootScope.$broadcast('contextmenu', { options: _this.state.contextMenuOptions, event: d3.event });
                    _this.state.contextMenuOptions = null;
                    d3.event.preventDefault();
                });
                document.addEventListener('keydown', function (event) {
                    if (!(event.target instanceof HTMLInputElement)) {
                        _this.keydown(event);
                        $rootScope.$digest();
                    }
                });
                document.addEventListener('keyup', function (event) {
                    if (!(event.target instanceof HTMLInputElement)) {
                        _this.keyup(event);
                        $rootScope.$digest();
                    }
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
                if (this.state.mode === 0 /* DRAW */) {
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
                        var newEdge = this.addEdge(this.state.futureEdgeFrom, endingNode), newEdgeModel = newEdge.models.edges[newEdge.models.edges.length - 1];
                        setTimeout(function () {
                            var elm = _this.svg.selectAll('g.edgeTransitions text.transition').filter(function (possibleEdge) { return possibleEdge === newEdgeModel; });
                            //console.log(elm);
                            if (elm.length > 0) {
                                _this.visualizations.editTransition(newEdgeModel, elm.node());
                            }
                        }, 10);
                        // Manage undoing and redoing of this action
                        var startingNodeV = this.state.futureEdgeFrom, endingNodeV = endingNode, edgeV = newEdge, endingNodePoint = event.point.getMPoint();
                        this.undoManager.add({
                            undo: function () {
                                _this.removeNodeAndSaveSettings(endingNodeV);
                                _this.nodeCount--;
                                _this.removeEdge(edgeV);
                            },
                            redo: function () {
                                var findStartingNode = _this.visualizations.nodes.filter(function (nodeV) {
                                    return nodeV.model.label === startingNodeV.model.label;
                                });
                                if (findStartingNode.length > 0) {
                                    if (findStartingNode[0] !== startingNodeV) {
                                        startingNodeV = findStartingNode[0];
                                    }
                                    endingNodeV = _this.restoreNode(endingNodeV);
                                    edgeV = _this.addEdge(startingNodeV, endingNodeV, newEdgeModel.transition);
                                    newEdgeModel = edgeV.models.edges[edgeV.models.edges.length - 1];
                                }
                            }
                        });
                        // Remove the future edge
                        this.state.futureEdge.remove();
                        this.state.futureEdge = null;
                        this.state.futureEdgeFrom = null;
                    }
                    this.state.futureEdgeFrom = null;
                }
                else if (this.state.mode === 1 /* MOVE */) {
                    this.state.draggingNode = null;
                    this.state.modifyEdgeControl = null;
                    this.state.isDraggingBoard = false;
                }
                else if (this.state.mode === 2 /* ERASE */) {
                    this.state.isErasing = false;
                }
            };
            /**
             * Adds a node to the board
             * @param point
             * @returns {jsflap.Visualization.NodeVisualization}
             */
            Board.prototype.addNode = function (point) {
                var node = this.graph.addNode('q' + this.nodeCount++), nodeV = new jsflap.Visualization.NodeVisualization(node, point.getMPoint());
                if (this.visualizations.nodes.length === 0) {
                    this.setInitialNode(nodeV);
                }
                return this.visualizations.addNode(nodeV);
            };
            /**
             * Restores a node visualization to the board
             * @param nodeV
             * @returns {Visualization.NodeVisualization}
             */
            Board.prototype.restoreNode = function (nodeV) {
                var node = this.graph.addNode(nodeV.model.label), newNodeV = new jsflap.Visualization.NodeVisualization(node, nodeV.position);
                if (nodeV.model.final) {
                    this.markFinalNode(newNodeV);
                }
                if (nodeV.model.initial) {
                    this.setInitialNode(newNodeV);
                }
                return this.visualizations.addNode(newNodeV);
            };
            /**
             * Adds an edge to the board given two nodes and a future edge
             * @param from
             * @param to
             * @param transition
             */
            Board.prototype.addEdge = function (from, to, transition) {
                var edge = this.graph.addEdge(from.model, to.model, transition || jsflap.LAMBDA), foundEdgeV = this.visualizations.getEdgeVisualizationByNodes(from.model, to.model);
                // If there already is a visualization between these two edges, add the edge to that model
                if (foundEdgeV) {
                    foundEdgeV.addEdgeModel(edge);
                    // Visualizations don't auto-update here, so we need to force call it
                    this.visualizations.update();
                    return foundEdgeV;
                }
                else {
                    var foundOppositeEdgeV = this.visualizations.getEdgeVisualizationByNodes(to.model, from.model);
                    var edgeV = new jsflap.Visualization.EdgeVisualization(edge);
                    if (foundOppositeEdgeV) {
                        // If there is an opposing edge already and its control point is unmoved, move it to separate the edges
                        if (foundOppositeEdgeV.getDirection() === 1) {
                            foundOppositeEdgeV.pathMode = 2 /* OPPOSING_A */;
                            edgeV.pathMode = 3 /* OPPOSING_B */;
                        }
                        else {
                            foundOppositeEdgeV.pathMode = 3 /* OPPOSING_B */;
                            edgeV.pathMode = 2 /* OPPOSING_A */;
                        }
                        foundOppositeEdgeV.recalculatePath(foundOppositeEdgeV.hasMovedControlPoint() ? foundOppositeEdgeV.control : null);
                        edgeV.recalculatePath(foundOppositeEdgeV.hasMovedControlPoint() ? edgeV.control : null);
                    }
                    return this.visualizations.addEdge(edgeV);
                }
            };
            /**
             * Updates a edge's transition by also updating all known hashes as well
             * @param edge
             * @param transition
             */
            Board.prototype.updateEdgeTransition = function (edge, transition) {
                var oldHash = edge.toString();
                edge.transition = transition;
                this.graph.getEdges().updateEdgeHash(oldHash);
                edge.visualization.models.updateEdgeHash(oldHash);
                edge.from.toEdges.updateEdgeHash(oldHash);
                edge.to.fromEdges.updateEdgeHash(oldHash);
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
                var _this = this;
                event.event.preventDefault();
                if (event.event.which > 1) {
                    return false;
                }
                var nearestNode = this.visualizations.getNearestNode(event.point);
                if (this.state.mode === 0 /* DRAW */) {
                    if (nearestNode.node && nearestNode.distance < 70) {
                        this.state.futureEdgeFrom = nearestNode.node;
                    }
                    else if (this.state.modifyEdgeTransition === null) {
                        // Only add a node if the user is not currently click out of editing a transition OR is near a node
                        var nodeV;
                        this.undoManager.add({
                            undo: function () {
                                _this.removeNodeAndSaveSettings(nodeV);
                            },
                            redo: function () {
                                nodeV = _this.restoreNode(nodeV);
                            }
                        });
                        this.state.futureEdgeFrom = this.addNode(event.point);
                        nodeV = this.state.futureEdgeFrom;
                    }
                }
                else if (this.state.mode === 1 /* MOVE */ && !this.state.modifyEdgeControl) {
                    if (nearestNode.node && nearestNode.hover) {
                        this.state.draggingNode = nearestNode.node;
                    }
                    else {
                        this.state.isDraggingBoard = true;
                    }
                }
                else if (this.state.mode === 2 /* ERASE */) {
                    this.state.isErasing = true;
                    this.handleErasing(event.point);
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
                var _this = this;
                var point = event.point.getMPoint();
                if (event.event.which > 1) {
                    return false;
                }
                if (this.state.mode === 0 /* DRAW */) {
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
                }
                else if (this.state.mode === 1 /* MOVE */ && (this.state.draggingNode || this.state.modifyEdgeControl || this.state.isDraggingBoard)) {
                    var snappedPoint = point.getMPoint();
                    if (this.state.futureEdgeSnapping) {
                        snappedPoint.x = (Math.round(snappedPoint.x / 20) * 20);
                        snappedPoint.y = (Math.round(snappedPoint.y / 20) * 20);
                    }
                    if (this.state.draggingNode) {
                        var oldDraggingNodePoint = this.state.draggingNode.position.getMPoint();
                        this.state.draggingNode.position = snappedPoint;
                        var newDraggingNodePoint = this.state.draggingNode.position;
                        var updateFn = null;
                        /// Allow toggling off control point re-drawing. CTRL Key is not the best key but will do for now
                        if (!this.state.ctrlKeyPressed) {
                            var adjustedEdges = {};
                            updateFn = function (edgeModel) {
                                var edgeV = edgeModel.visualization, edgeVHash = edgeV.fromModel.toString() + ', ' + edgeV.toModel.toString();
                                // Only do this function ONCE per edge visualization
                                if (!adjustedEdges.hasOwnProperty(edgeVHash)) {
                                    adjustedEdges[edgeVHash] = true;
                                }
                                else {
                                    return;
                                }
                                var controlPoint;
                                if (edgeV.hasMovedControlPoint() && edgeV.pathMode !== 1 /* SELF */) {
                                    var otherNode = edgeModel.from === _this.state.draggingNode.model ? edgeModel.to.visualization : edgeModel.from.visualization;
                                    // Complicated algorithm to determine new control point location:
                                    // Setup common points
                                    var oldControlPoint = edgeV.control.getMPoint(), axisNodePosition = otherNode.position, 
                                    // Calculate the initial and final midpoints
                                    oldMidpoint = jsflap.Point.MPoint.getMidpoint(oldDraggingNodePoint, axisNodePosition), newMidpoint = jsflap.Point.MPoint.getMidpoint(newDraggingNodePoint, axisNodePosition), 
                                    // Calculate the angles between the old midpoint and the old control point
                                    theta1 = oldMidpoint.getAngleTo(oldControlPoint), 
                                    // With respect to closest x-axis, calculate the angle of the slope of the line
                                    theta2 = Math.PI - oldMidpoint.getAngleTo(axisNodePosition), 
                                    // Get the total angle between the x-axis and the point that is off the old midpoint
                                    theta3 = (theta1 + theta2), 
                                    // Find the original offset distance from the old midpoint
                                    oldDistance = oldMidpoint.getDistanceTo(oldControlPoint), oldLength = oldMidpoint.getDistanceTo(axisNodePosition), newLength = newMidpoint.getDistanceTo(axisNodePosition), 
                                    // Calculate the change in length to get a new distance from the control point
                                    lengthRatio = newLength / oldLength, newDistance = lengthRatio * oldDistance, 
                                    // Now, from the new dragging point and the new midpoint, calculate the new midpoint offset
                                    offset = jsflap.Point.MPoint.getNormalOffset(newDraggingNodePoint, newMidpoint, newDistance, theta3);
                                    // We now know we need to adjust our new midpoint by the offset to get our point!
                                    controlPoint = newMidpoint.add(offset);
                                }
                                else if (edgeV.hasMovedControlPoint() && edgeV.pathMode === 1 /* SELF */) {
                                    controlPoint = edgeV.control.getMPoint().add(newDraggingNodePoint.getMPoint().subtract(oldDraggingNodePoint));
                                }
                                edgeV.recalculatePath(controlPoint ? controlPoint : null);
                            };
                        }
                        this.state.draggingNode.updateEdgeVisualizationPaths(updateFn);
                    }
                    else if (this.state.modifyEdgeControl) {
                        // Update the control point
                        this.state.modifyEdgeControl.control = snappedPoint;
                        this.state.modifyEdgeControl.recalculatePath(this.state.modifyEdgeControl.control);
                    }
                    else if (this.state.isDraggingBoard) {
                        // Move all the elements of the board
                        // Gets the delta between the points
                        point.subtract(this.state.lastMousePoint);
                        // Keep track of control points so that they are only added once
                        var controlPoints = {};
                        // Custom update function to ensure control points are moved correctly
                        var updateFn = function (edgeModel) {
                            var controlPoint = null;
                            // Only bother keeping the relative location of the control point if it has been moved
                            if (edgeModel.visualization.hasMovedControlPoint()) {
                                var edgeHash = edgeModel.toString();
                                // Only do the addition once per edge
                                if (!controlPoints.hasOwnProperty(edgeHash)) {
                                    controlPoints[edgeHash] = edgeModel.visualization.control.add(point);
                                    controlPoint = controlPoints[edgeHash];
                                }
                                else {
                                    controlPoint = controlPoints[edgeHash];
                                }
                            }
                            edgeModel.visualization.recalculatePath(controlPoint ? controlPoint : null);
                        };
                        this.visualizations.nodes.forEach(function (node) {
                            node.position.add(point);
                            node.updateEdgeVisualizationPaths(updateFn);
                        });
                    }
                    this.visualizations.update();
                }
                else if (this.state.mode === 2 /* ERASE */ && this.state.isErasing) {
                    this.handleErasing(point);
                }
                this.state.lastMousePoint = event.point.getMPoint();
            };
            /**
             * Handles erasing at a point
             * @param point
             */
            Board.prototype.handleErasing = function (point) {
                // If we are hovering over an edge and we have not yet erased at least the first edge model from it yet
                if (this.state.hoveringEdge && this.graph.hasEdge(this.state.hoveringEdge.models.edges[0])) {
                    this.removeEdge(this.state.hoveringEdge);
                }
                else if (this.state.hoveringTransition && this.graph.hasEdge(this.state.hoveringTransition)) {
                    var edgeV = this.state.hoveringTransition.visualization;
                    // Delete this edge from the visualization
                    edgeV.models.remove(this.state.hoveringTransition);
                    this.graph.removeEdge(this.state.hoveringTransition);
                    // If we have removed the last edge, remove the entire visualization
                    if (edgeV.models.size === 0) {
                        this._handleOpposingEdgeCollapsing(edgeV);
                        this.visualizations.removeEdge(edgeV);
                    }
                    else {
                        // Now we need to re-index the visualizations
                        edgeV.models.edges.forEach(function (edge, index) {
                            edge.visualizationNumber = index;
                        });
                        // And force a update
                        this.visualizations.update();
                    }
                }
                else {
                    var nearestNode = this.visualizations.getNearestNode(point);
                    if (nearestNode.node && nearestNode.hover) {
                        this.removeNode(nearestNode.node);
                    }
                }
            };
            /**
             * Handles collapsing other edges when removing their opposing edge
             * @param edgeV
             * @private
             */
            Board.prototype._handleOpposingEdgeCollapsing = function (edgeV) {
                if (edgeV.pathMode === 2 /* OPPOSING_A */ || edgeV.pathMode === 3 /* OPPOSING_B */) {
                    var otherEdgeV = this.visualizations.getEdgeVisualizationByNodes(edgeV.toModel, edgeV.fromModel);
                    if (otherEdgeV) {
                        otherEdgeV.pathMode = 0 /* DEFAULT */;
                        otherEdgeV.recalculatePath(otherEdgeV.hasMovedControlPoint() ? otherEdgeV.control : null);
                    }
                }
            };
            /**
             * Removes an edge from the graph
             * @param edgeV
             */
            Board.prototype.removeEdge = function (edgeV) {
                var _this = this;
                // Delete each edge from this visualization
                if (edgeV.models.size > 0) {
                    edgeV.models.edges.forEach(function (edge) { return _this.graph.removeEdge(edge); });
                }
                this._handleOpposingEdgeCollapsing(edgeV);
                this.visualizations.removeEdge(edgeV);
            };
            /**
             * Removes a node from the graph
             * @param nodeV
             */
            Board.prototype.removeNode = function (nodeV) {
                // Need to copy the edges because when the edges are deleted, the indexing gets messed up
                var _this = this;
                var toEdges = nodeV.model.toEdges.edges.slice(0), fromEdges = nodeV.model.fromEdges.edges.slice(0), deleteFn = function (edgeModel) {
                    _this.graph.removeEdge(edgeModel);
                    _this.visualizations.removeEdge(edgeModel.visualization);
                };
                toEdges.forEach(deleteFn);
                fromEdges.forEach(deleteFn);
                this.graph.removeNode(nodeV.model);
                this.visualizations.removeNode(nodeV);
            };
            /**
             * Removes a node, but saves the node's settings before it is removed
             * @param nodeV
             */
            Board.prototype.removeNodeAndSaveSettings = function (nodeV) {
                var saveInitial = nodeV.model.initial, saveFinal = nodeV.model.final;
                this.removeNode(nodeV);
                nodeV.model.initial = saveInitial;
                nodeV.model.final = saveFinal;
            };
            /**
             * The keydown event listener
             * @param event
             */
            Board.prototype.keydown = function (event) {
                // if not editing a textbox
                if (this.state.modifyEdgeTransition === null) {
                    switch (event.which) {
                        case 16:
                            this.state.futureEdgeSnapping = true;
                            break;
                        case 17:
                            this.state.ctrlKeyPressed = true;
                            break;
                        case 32:
                            if (this.state.mode !== 1 /* MOVE */) {
                                this.state.quickMoveFrom = this.state.mode;
                                this.state.mode = 1 /* MOVE */;
                                this.visualizations.update();
                            }
                            break;
                        case 68:
                            this.setMode(0 /* DRAW */);
                            break;
                        case 69:
                            this.setMode(2 /* ERASE */);
                            break;
                        case 77:
                            this.setMode(1 /* MOVE */);
                            break;
                        case 70:
                            var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                            if (nearestNode.node && nearestNode.hover) {
                                nearestNode.node.model.final ? this.unmarkFinalNode(nearestNode.node) : this.markFinalNode(nearestNode.node);
                                this.visualizations.update();
                            }
                            break;
                        case 73:
                            var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                            if (nearestNode.node && nearestNode.hover) {
                                if (!nearestNode.node.model.initial) {
                                    this.setInitialNode(nearestNode.node);
                                }
                                else {
                                    this.setInitialNode(null);
                                }
                                this.visualizations.update();
                            }
                            break;
                    }
                }
            };
            /**
             * Sets the board mode and updates accordingly
             * @param mode
             */
            Board.prototype.setMode = function (mode) {
                mode = +mode;
                if (mode !== this.state.mode) {
                    this.state.mode = mode;
                    this.visualizations.update();
                    return true;
                }
                else {
                    return false;
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
                if (event.which === 17 && this.state.ctrlKeyPressed) {
                    this.state.ctrlKeyPressed = false;
                }
                if (event.which === 32 && this.state.mode === 1 /* MOVE */ && this.state.quickMoveFrom !== null) {
                    this.state.draggingNode = null;
                    this.state.modifyEdgeControl = null;
                    this.state.isDraggingBoard = false;
                    this.state.mode = this.state.quickMoveFrom;
                    this.state.quickMoveFrom = null;
                    if (this.state.modifyEdgeControl) {
                        this.state.modifyEdgeControl = null;
                    }
                    this.visualizations.update();
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
                this.ctrlKeyPressed = false;
                this.draggingNode = null;
                this.isErasing = false;
                this.hoveringEdge = null;
                this.hoveringTransition = null;
                this.isDraggingBoard = false;
                this.quickMoveFrom = null;
                this.modifyEdgeTransition = null;
                this.modifyEdgeControl = null;
                this.contextMenuOptions = null;
                this.lastMousePoint = null;
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
             * Removes a node from the graph
             * @param node
             * @returns {boolean}
             */
            FAGraph.prototype.removeNode = function (node) {
                var foundNode = this.nodes.get(node);
                if (!foundNode) {
                    return false;
                }
                if (foundNode === this.initialNode) {
                    this.setInitialNode(null);
                }
                if (foundNode.final && this.finalNodes.has(foundNode)) {
                    this.finalNodes.remove(foundNode);
                }
                if (foundNode) {
                    this.nodes.remove(foundNode);
                }
                return true;
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
                // Clear the alphabet
                this.alphabet = {};
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
             * Removes an edge from the graph
             * @param edge
             */
            FAGraph.prototype.removeEdge = function (edge) {
                var foundEdge = this.edges.get(edge);
                if (!foundEdge) {
                    return false;
                }
                foundEdge.removeNodes();
                return this.edges.remove(foundEdge);
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
                else {
                    this.initialNode = null;
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
            /**
             * Gets the alphabet
             * @returns {Object}
             */
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
                this.updateAlphabet();
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
                return Math.atan2((this.y - other.y), (this.x - other.x));
            };
            /**
             * Adds a point
             * @param other
             */
            MPoint.prototype.add = function (other) {
                this.x += other.x;
                this.y += other.y;
                return this;
            };
            /**
             * Subtracts a point
             * @param other
             */
            MPoint.prototype.subtract = function (other) {
                this.x -= other.x;
                this.y -= other.y;
                return this;
            };
            /**
             * Helper function to generate a new point that is the midpoint between two other points
             * @param point1
             * @param point2
             * @returns {jsflap.Point.MPoint}
             */
            MPoint.getMidpoint = function (point1, point2) {
                return new Point.MPoint(((point1.x + point2.x) / 2), ((point1.y + point2.y) / 2));
            };
            /**
             * Gets the normal offset point based on two points, an offset, and an option initial theta
             * @param point1
             * @param point2
             * @param distance
             * @param theta0
             * @returns {jsflap.Point.MPoint}
             */
            MPoint.getNormalOffset = function (point1, point2, distance, theta0) {
                if (theta0 === void 0) { theta0 = Math.PI / 2; }
                var theta1 = point1.getAngleTo(point2) + theta0;
                return new Point.MPoint(distance * Math.cos(theta1), distance * Math.sin(theta1));
            };
            /**
             * Gets the coordinates as a string separated by a comma and a space: "x, y"
             * @returns {string}
             */
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
        (function (EdgeVisualizationPathMode) {
            EdgeVisualizationPathMode[EdgeVisualizationPathMode["DEFAULT"] = 0] = "DEFAULT";
            EdgeVisualizationPathMode[EdgeVisualizationPathMode["SELF"] = 1] = "SELF";
            EdgeVisualizationPathMode[EdgeVisualizationPathMode["OPPOSING_A"] = 2] = "OPPOSING_A";
            EdgeVisualizationPathMode[EdgeVisualizationPathMode["OPPOSING_B"] = 3] = "OPPOSING_B";
        })(Visualization.EdgeVisualizationPathMode || (Visualization.EdgeVisualizationPathMode = {}));
        var EdgeVisualizationPathMode = Visualization.EdgeVisualizationPathMode;
        ;
        var EdgeVisualization = (function () {
            /**
             * Creates the node
             * @param control
             * @param models
             */
            function EdgeVisualization(models, control) {
                var _this = this;
                /**
                 * If the user has moved the control point yet
                 * @type {boolean}
                 */
                this._hasMovedControlPoint = false;
                /**
                 * The type of path this edge visualization is representing
                 */
                this.pathMode = null;
                var edgeListModels;
                if (typeof models === 'array') {
                    edgeListModels = models;
                }
                else if (models instanceof jsflap.Edge) {
                    edgeListModels = [models];
                }
                this.models = new jsflap.EdgeList();
                edgeListModels.forEach(function (edge) { return _this.addEdgeModel(edge); });
                this.pathMode = (this.fromModel !== this.toModel) ? 0 /* DEFAULT */ : 1 /* SELF */;
                this.recalculatePath(control);
            }
            /**
             * Adds an edge model to this visualization
             * @param edge
             */
            EdgeVisualization.prototype.addEdgeModel = function (edge) {
                if (!this.fromModel || !this.toModel) {
                    this.fromModel = edge.from;
                    this.toModel = edge.to;
                    edge.setVisualization(this, this.models.edges.length);
                    return this.models.add(edge);
                }
                else if (edge.from === this.fromModel && edge.to === this.toModel) {
                    edge.setVisualization(this, this.models.edges.length);
                    return this.models.add(edge);
                }
                else {
                    return null;
                }
            };
            /**
             * Recalculates the path between nodes and a possibly already given control point
             * @param control
             */
            EdgeVisualization.prototype.recalculatePath = function (control) {
                if (this.pathMode !== 1 /* SELF */) {
                    var tempControlPoint = this.getInitialControlPoint(this.fromModel.visualization.position, this.toModel.visualization.position);
                    this.start = this.fromModel.visualization.getAnchorPointFrom(control ? control : tempControlPoint);
                    this.end = this.toModel.visualization.getAnchorPointFrom(control ? control : tempControlPoint);
                    this._control = control ? control : this.getInitialControlPoint();
                }
                else {
                    var anchorPoints = this.fromModel.visualization.getSelfAnchorPoints(control);
                    this.start = anchorPoints[0];
                    this.end = anchorPoints[1];
                    this._control = control ? control : this.getInitialControlPoint();
                }
            };
            /**
             * Gets the initial control point with a given offset
             * @returns {jsflap.Point.MPoint}
             */
            EdgeVisualization.prototype.getInitialControlPoint = function (startPoint, endPoint) {
                startPoint = startPoint ? startPoint : this.start;
                endPoint = endPoint ? endPoint : this.end;
                var controlPoint = jsflap.Point.MPoint.getMidpoint(startPoint, endPoint);
                switch (this.pathMode) {
                    case 1 /* SELF */:
                        controlPoint.y -= 80;
                        break;
                    case 2 /* OPPOSING_A */:
                    case 3 /* OPPOSING_B */:
                        controlPoint.add(jsflap.Point.MPoint.getNormalOffset(startPoint, endPoint, Math.max(startPoint.getDistanceTo(endPoint) / 15, 20)));
                        break;
                }
                return controlPoint;
            };
            /**
             * Determines if the control point has been moved from the start
             * @returns {boolean}
             */
            EdgeVisualization.prototype.hasMovedControlPoint = function () {
                return this._hasMovedControlPoint;
            };
            /**
             * Resets the control points position
             */
            EdgeVisualization.prototype.resetControlPoint = function () {
                this._hasMovedControlPoint = false;
                this._control = this.getInitialControlPoint();
            };
            Object.defineProperty(EdgeVisualization.prototype, "control", {
                /**
                 * Gets the control point
                 * @returns {Point.MPoint}
                 */
                get: function () {
                    return this._control;
                },
                /**
                 * Sets the control point
                 * @param point
                 */
                set: function (point) {
                    this._hasMovedControlPoint = true;
                    this._control = point;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets the path string
             */
            EdgeVisualization.prototype.getPath = function () {
                return 'M' + this.start + ' Q' + this.control + ' ' + this.end;
            };
            /**
             * Gets the position of where the transition text should be
             */
            EdgeVisualization.prototype.getTransitionPoint = function (modelNumber) {
                // Quadratic Bezier Curve formula evaluated halfway
                var t = 0.5, x = (1 - t) * (1 - t) * this.start.x + 2 * (1 - t) * t * this.control.x + t * t * this.end.x, y = (1 - t) * (1 - t) * this.start.y + 2 * (1 - t) * t * this.control.y + t * t * this.end.y;
                return new jsflap.Point.MPoint(x, y).add(jsflap.Point.MPoint.getNormalOffset(this.start, this.end, (this.pathMode !== 1 /* SELF */ ? 1 : -1) * ((modelNumber ? modelNumber : 0) * 20)));
            };
            /**
             * Gets the direction of the edge
             * @returns {number} 1: right, -1: left
             */
            EdgeVisualization.prototype.getDirection = function () {
                return this.start.x < this.end.x ? 1 : -1;
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
             * Updates the edges that this node is connected to, useful for when this node's position changes
             */
            NodeVisualization.prototype.updateEdgeVisualizationPaths = function (updateFn) {
                if (!updateFn) {
                    updateFn = function (edgeModel) {
                        edgeModel.visualization.recalculatePath(edgeModel.visualization.hasMovedControlPoint() ? edgeModel.visualization.control : null);
                    };
                }
                this.forEachEdge(updateFn);
            };
            /**
             * Calls the forEach method on both model.toEdges and model.fromEdges
             * @param callBackFn
             */
            NodeVisualization.prototype.forEachEdge = function (callBackFn) {
                this.model.toEdges.edges.forEach(callBackFn);
                this.model.fromEdges.edges.forEach(callBackFn);
            };
            /**
             * Gets an anchor point on the edge of the circle from any other given point
             * @param point
             * @returns {jsflap.Point.MPoint}
             */
            NodeVisualization.prototype.getAnchorPointFrom = function (point) {
                var posX = this.position.x, posY = this.position.y, r = this.radius, dx = point.x - posX, dy = point.y - posY, theta = Math.atan2(dy, dx), anchorX = posX + r * Math.cos(theta), anchorY = posY + r * Math.sin(theta);
                return new jsflap.Point.MPoint(anchorX, anchorY);
            };
            /**
             * Gets the self anchor points if an edge goes to the same node
             * @returns {any[]}
             */
            NodeVisualization.prototype.getSelfAnchorPoints = function (from) {
                var posX = this.position.x, posY = this.position.y, r = this.radius, theta0 = from ? this.position.getAngleTo(from) : Math.PI / 2, theta1 = theta0 + Math.PI / 6, theta2 = theta0 - Math.PI / 6, anchorX1 = posX + -r * Math.cos(theta1), anchorY1 = posY + -r * Math.sin(theta1), anchorX2 = posX + -r * Math.cos(theta2), anchorY2 = posY + -r * Math.sin(theta2);
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
            VisualizationCollection.prototype.nodeContextMenu = function (node) {
                var _this = this;
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
                this.state.contextMenuOptions = [finalOption, initialOption];
            };
            /**
             * Updates the visualizations
             */
            VisualizationCollection.prototype.update = function () {
                var _this = this;
                var shouldAnimateMovement = this.state.futureEdgeSnapping && this.state.mode === 1 /* MOVE */;
                var nodesGroup = this.svg.select('g.nodes'), edgesGroup = this.svg.select('g.edges'), transitionsGroup = this.svg.select('g.transitions'), controlPointsGroup = this.svg.select('g.control-points');
                var nodes = nodesGroup.selectAll("circle.node").data(this.nodes, function (node) { return node.model.toString(); });
                nodes.attr("r", function (d) { return d.radius; });
                var newNodes = nodes.enter().append("circle").classed('node', true).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr("r", function (d) { return d.radius - 10; }).attr('opacity', 0);
                newNodes.on('contextmenu', this.nodeContextMenu.bind(this));
                newNodes.transition().ease("elastic").duration(300).attr("r", function (d) { return d.radius; }).attr('opacity', 1);
                var nodesMovement = shouldAnimateMovement ? nodes.transition().ease('cubic-out').duration(50) : nodes;
                nodesMovement.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                nodes.exit().transition().attr('opacity', 0).attr("r", function (d) { return d.radius - 10; }).remove();
                var nodeLabels = nodesGroup.selectAll("text.nodeLabel").data(this.nodes, function (node) { return node.model; });
                var newNodeLabels = nodeLabels.enter().append('text').classed('nodeLabel', true).text(function (d) { return d.model.label; }).attr('opacity', 0);
                newNodeLabels.on('contextmenu', this.nodeContextMenu.bind(this));
                newNodeLabels.transition().delay(100).duration(300).attr('opacity', 1);
                nodeLabels.text(function (d) { return d.model.label; });
                var nodeLabelsMovement = shouldAnimateMovement ? nodeLabels.transition().ease('cubic-out').duration(50) : nodeLabels;
                nodeLabelsMovement.attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; });
                nodeLabels.exit().transition().attr('opacity', 0).remove();
                var initialNodes = nodesGroup.selectAll("path.initialPath").data(this.nodes.filter(function (node) { return node.model.initial; }));
                var newInitialNodes = initialNodes.enter().append('path').classed('initialPath', true);
                newInitialNodes.attr('opacity', 0).transition().delay(100).duration(300).attr('opacity', 1);
                // Only animate the transition if we are not dragging the nodes
                var initialNodesMovement;
                if (this.board.state.mode === 0 /* DRAW */) {
                    initialNodesMovement = initialNodes.transition().attr('opacity', 1);
                }
                else if (shouldAnimateMovement) {
                    initialNodesMovement = initialNodes.transition().ease('cubic-out').duration(50).attr('opacity', 1);
                }
                else {
                    initialNodesMovement = initialNodes;
                }
                initialNodesMovement.attr('d', function (d) { return 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z'; });
                initialNodes.exit().attr('opacity', 1).transition().attr('opacity', 0).remove();
                var finalNodes = nodesGroup.selectAll("circle.finalCircle").data(this.nodes.filter(function (node) { return node.model.final; }), function (node) { return node.model; });
                finalNodes.attr('opacity', 1).classed('finalCircle', true).attr("r", function (d) { return d.radius - 3; });
                var finalNodesMovement = shouldAnimateMovement ? finalNodes.transition().ease('cubic-out').duration(50) : finalNodes;
                finalNodesMovement.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                var newFinalNodes = finalNodes.enter().append('circle').classed('finalCircle', true).attr("r", function (d) { return d.radius - 10; }).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr('opacity', 0);
                newFinalNodes.on('contextmenu', this.nodeContextMenu.bind(this));
                newFinalNodes.transition().attr('opacity', 1).attr("r", function (d) { return d.radius - 3; });
                finalNodes.exit().attr('opacity', 1).transition().attr('opacity', 0).attr("r", function (d) { return d.radius + 10; }).remove();
                var edgeKeyFn = function (edge) { return edge.models.edges.map(function (edge) { return edge.toString(); }).join(','); };
                var edgePaths = edgesGroup.selectAll("path.edge").data(this.edges, edgeKeyFn);
                if (shouldAnimateMovement) {
                    edgePaths.transition().ease('cubic-out').duration(50).attr('d', function (d) { return d.getPath(); });
                }
                else if (this.state.draggingNode === null && this.state.isDraggingBoard === false) {
                    edgePaths.transition().duration(500).ease('elastic').attr('d', function (d) { return d.getPath(); });
                }
                else {
                    edgePaths.attr('d', function (edge) { return edge.getPath(); });
                }
                var newEdgePaths = edgePaths.enter().append('path').classed('edge', true);
                newEdgePaths.filter(function (edge) { return edge.pathMode !== 0 /* DEFAULT */; }).attr('d', function (edge) { return 'M' + edge.start + ' L' + edge.end; }).attr('opacity', .8).transition().attr('opacity', .8).duration(500).ease('elastic').attr('d', function (d) { return d.getPath(); });
                newEdgePaths.filter(function (edge) { return edge.pathMode === 0 /* DEFAULT */; }).attr('opacity', .8).transition().duration(300).attr('opacity', .8).attr('d', function (d) { return d.getPath(); });
                newEdgePaths.on('mouseover', function (edge) {
                    _this.state.hoveringEdge = edge;
                }).on('mouseout', function (edge) {
                    _this.state.hoveringEdge = null;
                });
                newEdgePaths.attr('style', "marker-end:url(#markerArrow)");
                edgePaths.classed('rightAngle', function (edge) { return ((Math.abs(edge.start.x - edge.end.x) < .1) && (Math.abs(edge.start.x - edge.control.x) < .1)) || (Math.abs(edge.start.y - edge.end.y) < .1) && (Math.abs(edge.start.y - edge.control.y) < 1); });
                edgePaths.exit().transition().attr("opacity", 0).remove();
                controlPointsGroup.style('display', this.state.mode === 1 /* MOVE */ ? 'block' : '').transition().duration(200).attr("opacity", this.state.mode === 1 /* MOVE */ ? 1 : 0).each('end', function () {
                    controlPointsGroup.style('display', _this.state.mode !== 1 /* MOVE */ ? 'none' : '');
                });
                var edgePathControlPoints = controlPointsGroup.selectAll("circle.control").data(this.edges);
                edgePathControlPoints.enter().append('circle').classed('control', true).attr('r', 10).on('mousedown', function (edge) {
                    if (_this.state.mode === 1 /* MOVE */) {
                        _this.state.modifyEdgeControl = edge;
                    }
                }).on('dblclick', function (edge) {
                    if (_this.state.mode === 1 /* MOVE */) {
                        edge.resetControlPoint();
                        edge.recalculatePath();
                        edgePaths.transition().duration(500).ease('elastic').attr('d', function (d) { return d.getPath(); });
                        edgeTransitions.transition().duration(500).ease('elastic').attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                        edgePathControlPoints.transition().ease('elastic').duration(500).attr('cx', function (d) { return d.control.x; }).attr('cy', function (d) { return d.control.y; }).each('end', function () {
                            _this.update();
                        });
                    }
                }).on('mouseover', function (edge) {
                    _this.state.hoveringEdge = edge;
                }).on('mouseout', function (edge) {
                    _this.state.hoveringEdge = null;
                });
                var edgePathControlPointsMovement;
                if (shouldAnimateMovement) {
                    edgePathControlPointsMovement = edgePathControlPoints.transition().ease('cubic-out').duration(50);
                }
                else {
                    edgePathControlPointsMovement = edgePathControlPoints;
                }
                edgePathControlPointsMovement.attr('cx', function (d) { return d.control.x; }).attr('cy', function (d) { return d.control.y; });
                edgePathControlPoints.exit().remove();
                var edgeTransitionGroup = transitionsGroup.selectAll('g.edgeTransitions').data(this.edges, edgeKeyFn);
                edgeTransitionGroup.enter().append('g').classed('edgeTransitions', true);
                edgeTransitionGroup.exit().transition().attr('opacity', 0).remove();
                var edgeTransitions = edgeTransitionGroup.selectAll('text.transition').data(function (edge) { return edge.models.edges; }, function (edge) { return edge.toString(); });
                var newEdgeTransitions = edgeTransitions.enter().append('text').classed('transition', true).attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                edgeTransitions.text(function (d) { return d.transition.toString(); });
                var edgeTransitionsMovement;
                if (shouldAnimateMovement) {
                    edgeTransitionsMovement = edgeTransitions.transition().ease('cubic-out').duration(50);
                }
                else if (this.state.draggingNode === null && this.state.isDraggingBoard === false) {
                    edgeTransitionsMovement = edgeTransitions.transition().ease('elastic').duration(500);
                }
                else {
                    edgeTransitionsMovement = edgeTransitions;
                }
                edgeTransitionsMovement.attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                edgeTransitions.exit().transition().attr('opacity', 0).remove();
                newEdgeTransitions.on('mousedown', function (edge) {
                    var event = d3.event;
                    if (_this.state.mode === 0 /* DRAW */) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    else if (_this.state.mode === 2 /* ERASE */) {
                        _this.state.hoveringTransition = edge;
                    }
                    else {
                        _this.state.modifyEdgeControl = edge.visualization;
                    }
                }).on("mouseup", function (d) {
                    if (_this.state.modifyEdgeControl) {
                        _this.state.modifyEdgeControl = null;
                    }
                    else if (_this.state.mode === 0 /* DRAW */) {
                        _this.editTransition(d);
                    }
                }).on('mouseover', function (edge) {
                    _this.state.hoveringTransition = edge;
                }).on('mouseout', function (edge) {
                    _this.state.hoveringTransition = null;
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
            /**
             * Removes an node from the collection
             * @param node
             * @returns {boolean}
             */
            VisualizationCollection.prototype.removeNode = function (node) {
                var nodeIndex = this.nodes.indexOf(node);
                if (nodeIndex === -1) {
                    return false;
                }
                this.nodes.splice(nodeIndex, 1);
                this.update();
                return true;
            };
            /**
             * Removes an edge from the collection
             * @param edge
             * @returns {boolean}
             */
            VisualizationCollection.prototype.removeEdge = function (edge) {
                var edgeIndex = this.edges.indexOf(edge);
                if (edgeIndex === -1) {
                    return false;
                }
                this.edges.splice(edgeIndex, 1);
                this.update();
                return true;
            };
            /**
             * Gets an edge by its fromModel and toModel
             * @param from
             * @param to
             * @returns {*}
             */
            VisualizationCollection.prototype.getEdgeVisualizationByNodes = function (from, to) {
                var query = this.edges.filter(function (edge) { return edge.fromModel === from && edge.toModel === to; });
                if (query.length > 0) {
                    return query[0];
                }
                else {
                    return null;
                }
            };
            /**
             * Opens a new text field for editing a transition
             * @param edge
             * @param node
             */
            VisualizationCollection.prototype.editTransition = function (edge, node) {
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
                    if (_this.state.modifyEdgeTransition !== inp.node()) {
                        // The user was no longer editing the transition, don't do anything
                        return;
                    }
                    var transition = new jsflap.Transition.CharacterTransition(inp.node().value || jsflap.LAMBDA);
                    var similarTransitions = edge.visualization.models.edges.length > 1 ? edge.visualization.models.edges.filter(function (otherEdge) { return otherEdge.transition.toString() === transition.toString(); }) : [];
                    if (similarTransitions.length == 0) {
                        _this.board.updateEdgeTransition(edge, transition);
                        el.text(function (d) {
                            return d.transition.toString();
                        });
                        _this.svg.select("foreignObject").remove();
                        _this.state.modifyEdgeTransition = null;
                        if (typeof _this.board.onBoardUpdateFn === 'function') {
                            _this.board.onBoardUpdateFn();
                        }
                    }
                    else {
                        _this.editTransition(edge, target);
                    }
                }
                var inp = frm.attr("x", position.left - 3).attr("y", bbox.y - 3).attr("width", 30).attr("height", 25).append("xhtml:form").append("input").attr("value", function () {
                    var inputField = this;
                    setTimeout(function () {
                        inputField.focus();
                        inputField.select();
                    }, 5);
                    _this.state.modifyEdgeTransition = this;
                    var value = edge.transition.toString();
                    return value !== jsflap.LAMBDA ? value : '';
                }).attr("style", "width: 20px; border: none; padding: 3px; outline: none; background-color: #fff; border-radius: 3px").attr("maxlength", "1");
                inp.transition().style('background-color', '#eee');
                inp.on("blur", function () {
                    updateTransition();
                    frm.remove();
                }).on("keyup", function () {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length > 0) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        updateTransition();
                        //inp.on('blur', null);
                        this.remove();
                    }
                });
            };
            return VisualizationCollection;
        })();
        Visualization.VisualizationCollection = VisualizationCollection;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));
