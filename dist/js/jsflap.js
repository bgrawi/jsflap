/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jsflapBoard', function($rootScope) {
            return {
                link: function(scope, elm, attrs) {
                    var board = new jsflap.Board(elm[0]);

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
    var Board = (function () {
        function Board(svg, graph) {
            this.svg = svg;
            this.graph = graph;
        }
        return Board;
    })();
    jsflap.Board = Board;
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
            from.addToEdge(this);
            to.addFromEdge(this);
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
        };
        /**
         * Gets an edge by a similar edge object
         * @param edge
         * @returns {*}
         */
        EdgeList.prototype.getEdge = function (edge) {
            if (this.has(edge)) {
                if (typeof edge === 'string') {
                    return this.edgeMap[edge];
                }
                else if (edge instanceof jsflap.Edge) {
                    return this.edgeMap[edge.toString()];
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
        };
        /**
         * Gets an node by a similar node object
         * @param node
         * @returns {*}
         */
        NodeList.prototype.getNode = function (node) {
            if (this.has(node)) {
                if (typeof node === 'string') {
                    return this.nodes[node];
                }
                else if (node instanceof jsflap.Node) {
                    return this.nodes[node.toString()];
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
    var Graph;
    (function (Graph) {
        var NFAGraph = (function () {
            /**
             * Create a new graph
             * @param nodes
             * @param edges
             */
            function NFAGraph(nodes, edges) {
                this.nodes = new jsflap.NodeList(nodes);
                this.edges = new jsflap.EdgeList(edges);
            }
            /**
             * Gets the nodes from the graph
             * @returns {NodeList}
             */
            NFAGraph.prototype.getNodes = function () {
                return this.nodes;
            };
            /**
             * Gets the edges from the graph
             * @returns {EdgeList}
             */
            NFAGraph.prototype.getEdges = function () {
                return this.edges;
            };
            /**
             * Adds a node based on a label
             * @returns {jsflap.Node|any}
             * @param node
             * @param options
             */
            NFAGraph.prototype.addNode = function (node, options) {
                if (typeof node === 'string') {
                    return this.nodes.add(new jsflap.Node(node, options));
                }
                else if (node instanceof jsflap.Node) {
                    return this.nodes.add(node);
                }
            };
            /**
             * Adds an edge to the graph
             * @param from
             * @param to
             * @param transition
             * @returns {jsflap.Edge|any}
             */
            NFAGraph.prototype.addEdge = function (from, to, transition) {
                if (from instanceof jsflap.Edge && to instanceof jsflap.Edge && transition) {
                    return this.edges.add(new jsflap.Edge(from, to, transition));
                }
                else if (from instanceof jsflap.Edge) {
                    return this.edges.add(from);
                }
            };
            return NFAGraph;
        })();
        Graph.NFAGraph = NFAGraph;
    })(Graph = jsflap.Graph || (jsflap.Graph = {}));
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
                this.character = character;
            }
            /**
             * Gets the string representation of the transition
             * @returns {string}
             */
            CharacterTransition.prototype.toString = function () {
                return this.character;
            };
            return CharacterTransition;
        })();
        Transition.CharacterTransition = CharacterTransition;
    })(Transition = jsflap.Transition || (jsflap.Transition = {}));
})(jsflap || (jsflap = {}));



var jsflap;
(function (jsflap) {
    var Visualization;
    (function (Visualization) {
        var NodeVisualization = (function () {
            /**
             * Creates the node
             * @param location
             * @param label
             */
            function NodeVisualization(location, label) {
                /**
                 * The label for the node
                 */
                this.label = 'NL';
                /**
                 * The radius of the circle
                 */
                this.radius = 20;
                this.location = location;
                this.label = label;
            }
            return NodeVisualization;
        })();
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));