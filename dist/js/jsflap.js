/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jsflapBoard', function() {
            return {
                link: function (scope, elm, attrs) {
                    var graph = new jsflap.Graph.FAGraph(false);
                    var board = new jsflap.Board.Board(elm[0], graph);
                    window.graph = graph;
                }
            };
        })
        .directive('jsflapBoardOld', function($rootScope) {
            return {
                link: function(scope, elm, attrs) {

                    // For debugging
                    window.boardInstance = board;

                    var nodeCount = 0;

                    var initalStatePathO = 'M-10,10 L0,5 L-10,-10 Z';

                    var initalStatePath = [
                        { "x": -20,   "y": -20},  { "x": 0,  "y": 0},
                        { "x": -20,  "y": 20}, { "x": -20,   "y": -20}
                    ];
                    var svgContainer = d3.select(elm[0])
                        .on('mouseup', function() {
                            //svgContainer.on("mousemove", null);
                            var m = d3.event;
                            var posPoints = d3.mouse(this);
                            var posX = posPoints[0];
                            var posY = posPoints[1];
                            if(line) {
                                posX = +line.attr('x2');
                                posY = +line.attr('y2');
                            }
                            d3.event.preventDefault();
                            if(m.which > 1) {
                                return false;
                            } else {
                                var closetCircle = getNearestCircleBy(posX, posY, 29);
                                if(!closetCircle && !lineIsSnapping) {
                                    nodeCount++;
                                    svgContainer.append("circle")
                                        .attr("cx", posX)
                                        .attr("cy", posY)
                                        .attr("r", 20)
                                        .attr('fill', "LightGoldenrodYellow")
                                        .attr('stroke', "#333333")
                                        .attr('opacity', 0)
                                        .transition()
                                        .attr('opacity', 1);
                                    svgContainer.append("text")
                                        .text("q"+ (nodeCount - 1))
                                        .attr("x", posX - ((nodeCount <= 10)? 11: 15))
                                        .attr("y", posY + 5)
                                        .attr("font-family", "sans-serif")
                                        .attr("font-size", "18px")
                                        .attr("fill", "#333")
                                        .attr('opacity', 0)
                                        .transition()
                                        .attr('opacity', 1);

                                    if(nodeCount === 1) {
                                        var lineFunction = d3.svg.line()
                                            .x(function(d) { return d.x + posX - 20 })
                                            .y(function(d) { return d.y + posY})
                                            .interpolate("linear");
                                        svgContainer.append('path')
                                            .attr('d', lineFunction(initalStatePath))
                                            .attr("stroke", "#333")
                                            .attr("stroke-width", 1)
                                            .attr("fill", "none")
                                            .attr('opacity', 0)
                                            .transition()
                                            .attr('opacity', 1);
                                    }

                                    closetCircle = {
                                        cx: posX,
                                        cy: posY,
                                        r: 20
                                    };
                                }

                                if(line) {
                                    line.transition()
                                        .attr('stroke', "#333333")
                                        .attr('style', "marker-end:url(#markerArrow)");

                                    //if(!straightLineMode) {
                                        var point = getCircleIntersectionPoint(closetCircle, {
                                            x: +line.attr('x1'),
                                            y: +line.attr('y1')
                                        }, true);
                                        line.attr('x2', point.x)
                                            .attr('y2', point.y)
                                    //}
                                }
                            }

                            lineNearestCircle = null;
                            line = null;
                            lineIsSnapping = false;
                        })
                        .on("mousedown", mousedown)

                    function circleOverlapQ (c1, c2) {
                        var distance = Math.sqrt(
                            Math.pow(c2.cx - c1.cx, 2) +
                            Math.pow(c2.cy - c1.cy, 2)
                        );
                        if (distance < (c1.r + c2.r)) {
                            return distance;
                        } else {
                            return false;
                        }
                    }

                    function getNearestCircleBy(x, y, r) {
                        var c1 = {
                            cx: x,
                            cy: y,
                            r: r
                        };

                        var nearestCircle = null;
                        var nearestCircleDistance = 10000;
                        svgContainer.selectAll('circle').each(function() {
                            if(this.nodeName !== 'circle') {
                                return;
                            }
                            var c2 = {
                                cx: +this.getAttribute("cx"),
                                cy: +this.getAttribute("cy"),
                                r: +this.getAttribute("r")
                            };
                            var distance = circleOverlapQ(c1,c2);
                            if(!!distance && distance < nearestCircleDistance) {
                                nearestCircle = c2;
                                nearestCircleDistance = distance;
                            }

                        });

                        if(nearestCircle) {
                            nearestCircle.distance = nearestCircleDistance;
                            c1.r = 20;
                            nearestCircle.overlap = !!circleOverlapQ(c1, nearestCircle);
                        }
                        return nearestCircle;
                    }

                    function getCircleIntersectionPoint(nearestCircle, point) {
                        var dx = point.x - nearestCircle.cx;
                        var dy = point.y - nearestCircle.cy;
                        var theta = Math.atan(dy/dx);
                        var int_x = 0;
                        var int_y = 0;
                        if(dx >= 0) {
                            int_x = nearestCircle.cx + nearestCircle.r * Math.cos(theta);
                            int_y = nearestCircle.cy + nearestCircle.r * Math.sin(theta);
                        } else {
                            int_x = nearestCircle.cx - nearestCircle.r * Math.cos(theta);
                            int_y = nearestCircle.cy - nearestCircle.r * Math.sin(theta);
                        }

                        return {
                            x: int_x,
                            y: int_y
                        };
                    }

                    var line;
                    var lineIsSnapping = false;
                    var lineNearestCircle = null;
                    function mousedown() {
                        lineNearestCircle = null;
                        var lineStartPoint = d3.mouse(this);
                        var lineStartX = lineStartPoint[0],
                            lineStartY = lineStartPoint[1],
                            nearestCircle = getNearestCircleBy(lineStartX, lineStartY, 50);
                        if(nearestCircle) {
                            var nearPoint = getCircleIntersectionPoint(nearestCircle, {
                                x: lineStartX,
                                y: lineStartY
                            });
                            lineStartX = nearPoint.x;
                            lineStartY = nearPoint.y;
                            lineNearestCircle = nearestCircle;
                            line = svgContainer.append("line")
                                .attr("x1", lineStartX)
                                .attr("y1", lineStartY)
                                .attr("x2", lineStartX)
                                .attr("y2", lineStartY)
                                .attr('stroke', "#888");
                        }
                    }

                    svgContainer.on("mousemove", mousemove);

                    var straightLineMode = false;
                    document.body.addEventListener("keydown", function(event) {
                        if (line) {
                            if (event.which === 16 && !straightLineMode) {
                                straightLineMode = true;
                            }
                        }
                    });

                    document.body.addEventListener("keyup", function(event) {

                        if (event.which === 16) {
                            straightLineMode = false;
                        }
                    });

                    var lastDTheta = null;
                    function mousemove() {
                        if(line) {
                            var m = d3.mouse(this);
                            if(straightLineMode) {
                                var x1 = +line.attr('x1'),
                                    x2 = m[0],
                                    y1 = +line.attr('y1'),
                                    y2 = m[1],
                                    dx = x2 - x1,
                                    dy = y2 - y1,
                                    theta = Math.atan(dy/dx),
                                    dTheta = Math.round(theta / (Math.PI / 4)) * (Math.PI / 4),
                                    distance = Math.sqrt(
                                        Math.pow(y2 - y1, 2) +
                                        Math.pow(x2 - x1, 2)
                                    );

                                if(dx >= 0) {
                                    m[0] = x1 + distance * Math.cos(dTheta);
                                    m[1] = y1 + distance * Math.sin(dTheta);
                                } else {
                                    m[0] = x1 - distance * Math.cos(dTheta);
                                    m[1] = y1 - distance * Math.sin(dTheta);
                                }
                            }

                            if (lineNearestCircle && !lineIsSnapping) {

                                if(!straightLineMode || (straightLineMode && (lastDTheta === null || lastDTheta !== theta))) {
                                    var point = getCircleIntersectionPoint(lineNearestCircle, {
                                        x: m[0],
                                        y: m[1]
                                    });
                                    line.attr("x1", point.x)
                                        .attr("y1", point.y);
                                }
                            }

                            if(Math.abs(lineNearestCircle.cx - m[0]) > lineNearestCircle.r + 30 ||
                                Math.abs(lineNearestCircle.cy - m[1]) > lineNearestCircle.r + 30) {
                                var snapCircle = getNearestCircleBy(m[0], m[1], 29);
                                if(snapCircle) {
                                    if(!lineIsSnapping) {
                                        var point2 = getCircleIntersectionPoint(snapCircle, {
                                            x: point.x,
                                            y: point.y
                                        });
                                        line.attr("x2", point2.x)
                                            .attr("y2", point2.y);
                                        lineIsSnapping = true;
                                    }
                                } else {
                                    line.attr("x2", m[0])
                                        .attr("y2", m[1]);
                                    lineIsSnapping = false;
                                }
                            } else {
                                line.attr("x2", m[0])
                                    .attr("y2", m[1]);
                                lineIsSnapping = false;
                            }

                        }
                    }

                    elm[0].addEventListener("contextmenu", function(event) {
                        $rootScope.$broadcast('contextmenu', event);
                        event.preventDefault();
                    });
                }
            }
        })
        .directive('jsflapBoardContextMenu', function() {
            return {
                scope: {},
                restrict: 'A',
                template: '<ul id="contextMenu"  class="side-nav" ng-style="{top: posTop, left: posLeft}" ng-show="show">' +
                '<li><a href="#">Make Initial {{posTop}}</a></li>' +
                '<li><a href="#">Make Final</a></li>' +
                '</ul>',
                link: {
                    pre: function(scope) {
                        scope.show = false;
                        scope.posLeft = 0;
                        scope.posTop = 0;
                    },
                    post: function (scope, elm, attrs) {
                        scope.$on("contextmenu", function(event, DOMevent) {
                            scope.show = true;
                            scope.posLeft = DOMevent.x;
                            scope.posTop = DOMevent.y;
                        });
                    }
                }
            };
        })
        .controller('AppController', function($scope) {
            $scope.message = 'Welcome to jsflap!';
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
             */
            function Board(svg, graph) {
                this.svg = d3.select(svg);
                this.boardBase = this.svg.append("rect").attr("fill", "#FFFFFF").attr("width", svg.getBoundingClientRect().width).attr("height", svg.getBoundingClientRect().height);
                this.graph = graph;
                this.state = new _Board.BoardState();
                this.visualizations = new jsflap.Visualization.VisualizationCollection(this.svg);
                this.registerBindings();
            }
            /**
             * Registers event bindings
             */
            Board.prototype.registerBindings = function () {
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
                if (this.state.futureEdge) {
                    var nearestNode = this.visualizations.getNearestNode(this.state.futureEdge.end);
                    var endingNode;
                    if (nearestNode.node && nearestNode.distance < 40) {
                        endingNode = nearestNode.node;
                    }
                    else {
                        endingNode = this.addNode(this.state.futureEdge.end);
                    }
                    this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start);
                    this.addEdge(this.state.futureEdgeFrom, endingNode, this.state.futureEdge);
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
                var node = this.graph.addNode('q' + this.graph.getNodes().size), nodeV = new jsflap.Visualization.NodeVisualization(point.getMutablePoint(), node);
                return this.visualizations.addNode(nodeV);
            };
            /**
             * Adds an edge to the board given two nodes and a future edge
             * @param from
             * @param to
             * @param futureEdge
             */
            Board.prototype.addEdge = function (from, to, futureEdge) {
                var edge = this.graph.addEdge(from.model, to.model, jsflap.LAMBDA), edgeV = new jsflap.Visualization.EdgeVisualization(futureEdge.start, futureEdge.end, edge);
                futureEdge.remove();
                return this.visualizations.addEdge(edgeV);
            };
            /**
             * Mousedown event listener
             * @param event
             */
            Board.prototype.mousedown = function (event) {
                event.event.preventDefault();
                var nearestNode = this.visualizations.getNearestNode(event.point);
                if (nearestNode.node && nearestNode.distance < 70) {
                    this.state.futureEdgeFrom = nearestNode.node;
                }
                else {
                    this.addNode(event.point);
                }
            };
            /**
             * Mousemove event listener
             * @param event
             */
            Board.prototype.mousemove = function (event) {
                var point = event.point.getMutablePoint();
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
                    if (this.state.futureEdgeFrom.position.getDistanceTo(event.point) > 20) {
                        this.state.futureEdge = new jsflap.Visualization.FutureEdgeVisualization(event.point.getMutablePoint(), event.point.getMutablePoint());
                        this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                        this.state.futureEdge.addTo(this.svg);
                    }
                }
            };
            Board.prototype.keydown = function (event) {
                if (event.which === 16 && !this.state.futureEdgeSnapping) {
                    this.state.futureEdgeSnapping = true;
                }
            };
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
                this.point = new jsflap.Point.ImmutablePoint(rawPoint[0], rawPoint[1]);
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
                        if (this.initialNode) {
                            this.initialNode.initial = false;
                        }
                        this.initialNode = result;
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
         * The point class which is immutable
         */
        var ImmutablePoint = (function () {
            /**
             * Create a new immutable point
             * @param x
             * @param y
             */
            function ImmutablePoint(x, y) {
                this._x = x;
                this._y = y;
            }
            Object.defineProperty(ImmutablePoint.prototype, "x", {
                /**
                 * Gets the x dimension
                 * @returns {number}
                 */
                get: function () {
                    return this._x;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ImmutablePoint.prototype, "y", {
                /**
                 * Gets the y dimension
                 * @returns {number}
                 */
                get: function () {
                    return this._y;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.MutablePoint}
             */
            ImmutablePoint.prototype.getMutablePoint = function () {
                return new Point.MutablePoint(this._x, this._y);
            };
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.ImmutablePoint}
             */
            ImmutablePoint.prototype.getImmutablePoint = function () {
                return new Point.ImmutablePoint(this.x, this.y);
            };
            /**
             * Gets the distance between two points
             * @param point
             * @returns {number}
             */
            ImmutablePoint.prototype.getDistanceTo = function (point) {
                return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
            };
            return ImmutablePoint;
        })();
        Point.ImmutablePoint = ImmutablePoint;
    })(Point = jsflap.Point || (jsflap.Point = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Point;
    (function (Point) {
        /**
         * The point class
         */
        var MutablePoint = (function () {
            /**
             * Create a new mutable point
             * @param x
             * @param y
             */
            function MutablePoint(x, y) {
                this.x = x;
                this.y = y;
            }
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.MutablePoint}
             */
            MutablePoint.prototype.getMutablePoint = function () {
                return new Point.MutablePoint(this.x, this.y);
            };
            /**
             * Gets a mutable point from this immutable one
             * @returns {jsflap.Point.ImmutablePoint}
             */
            MutablePoint.prototype.getImmutablePoint = function () {
                return new Point.ImmutablePoint(this.x, this.y);
            };
            /**
             * Gets the distance between two points
             * @param point
             * @returns {number}
             */
            MutablePoint.prototype.getDistanceTo = function (point) {
                return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
            };
            return MutablePoint;
        })();
        Point.MutablePoint = MutablePoint;
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
             * @param model
             */
            function EdgeVisualization(start, end, model) {
                this.start = start;
                this.end = end;
                this.model = model;
            }
            Object.defineProperty(EdgeVisualization.prototype, "pathCoords", {
                get: function () {
                    var midpointX = (this.start.x + this.end.x) / 2, midpointY = (this.start.y + this.end.y) / 2;
                    return [
                        this.start,
                        new jsflap.Point.MutablePoint(midpointX, midpointY),
                        this.end
                    ];
                },
                enumerable: true,
                configurable: true
            });
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
                 * @returns {Point.MutablePoint}
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
             * @param position
             * @param model
             */
            function NodeVisualization(position, model) {
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
             * @returns {jsflap.Point.MutablePoint}
             */
            NodeVisualization.prototype.getAnchorPointFrom = function (point) {
                var posX = this.position.x, posY = this.position.y, r = this.radius, dx = point.x - posX, dy = point.y - posY, theta = Math.atan(dy / dx), trigSide = (dx >= 0) ? 1 : -1, anchorX = posX + trigSide * r * Math.cos(theta), anchorY = posY + trigSide * r * Math.sin(theta);
                return new jsflap.Point.MutablePoint(anchorX, anchorY);
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
            function VisualizationCollection(svg) {
                this.svg = svg;
                this.nodes = [];
                this.edges = [];
                this.update();
            }
            VisualizationCollection.prototype.update = function () {
                var circles = this.svg.selectAll("circle.node").data(this.nodes);
                circles.enter().append("circle").classed('node', true).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr('fill', "LightGoldenrodYellow").attr('stroke', "#333").attr("r", function (d) { return d.radius - 10; }).attr('opacity', 0).transition().ease("elastic").duration(300).attr("r", function (d) { return d.radius; }).attr('opacity', 1);
                circles.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                circles.exit().remove();
                var circleLabels = this.svg.selectAll("text").data(this.nodes);
                circleLabels.enter().append('text').text(function (d) { return d.model.label; }).attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; }).attr("font-family", "sans-serif").attr("font-size", "18px").attr("fill", "#333").attr('opacity', 0).transition().delay(100).duration(300).attr('opacity', 1);
                circleLabels.attr("x", function (d) { return d.position.x - ((d.model.label.length <= 2) ? 11 : 15); }).attr("y", function (d) { return d.position.y + 5; });
                circleLabels.exit().remove();
                var edgePaths = this.svg.selectAll("path.edge").data(this.edges);
                var edgePath = d3.svg.line().interpolate('cardinal').x(function (d) { return d.x; }).y(function (d) { return d.y; });
                edgePaths.enter().append('path').classed('edge', true).attr('d', function (d) { return edgePath(d.pathCoords); }).attr('stroke', '#333').attr('stroke-width', '1').attr('opacity', .8).transition().duration(300).attr('opacity', 1).attr('style', "marker-end:url(#markerArrow)");
                edgePaths.exit().remove();
                var edgeTransitions = d3.select(document.querySelector('section.board-container')).selectAll('input.transition').data(this.edges);
                edgeTransitions.enter().append('input').classed('transition', true).attr('type', 'text').attr('maxlength', '1').style({
                    top: function (d) { return d.pathCoords[1].y - 15 + 'px'; },
                    left: function (d) { return d.pathCoords[1].x - 30 + 'px'; }
                }).attr('value', function (d) { return d.model.transition.toString(); }).on('keypress', function (edge) {
                    var target = d3.event.target;
                    edge.model.transition.character = target.value;
                    if (d3.event.which === 13) {
                        target.blur();
                    }
                });
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
            return VisualizationCollection;
        })();
        Visualization.VisualizationCollection = VisualizationCollection;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));
