var jsflap;
(function (jsflap) {
    var Board = (function () {
        function Board(svg) {
            this.svg = svg;
            this.nodes = [];
            this.edges = new jsflap.EdgeList();
        }
        return Board;
    })();
    jsflap.Board = Board;
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Edge = (function () {
        function Edge(from, to, transition) {
            this.from = from;
            this.to = to;
            this.transition = transition;
            from.addToEdge(this);
            to.addFromEdge(this);
        }
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
            if (edges) {
                this.edges = edges;
            }
            else {
                this.edges = [];
            }
        }
        /**
         * Adds a new edge to the list
         * @param edge
         */
        EdgeList.prototype.push = function (edge) {
            this.edges.push(edge);
        };
        /**
         * Checks if the edge exists already
         * @param edge
         * @returns {boolean}
         */
        EdgeList.prototype.has = function (edge) {
            return this.edges.indexOf(edge) !== -1;
        };
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
         * @param fromEdges
         * @param toEdges
         */
        function Node(label, fromEdges, toEdges) {
            this.fromEdges = new jsflap.EdgeList();
            this.toEdges = new jsflap.EdgeList();
        }
        /**
         * Adds an edge to the from list
         * @param edge
         */
        Node.prototype.addFromEdge = function (edge) {
            this.fromEdges.push(edge);
        };
        /**
         * Adds an edge to the to list
         * @param edge
         */
        Node.prototype.addToEdge = function (edge) {
            this.toEdges.push(edge);
        };
        return Node;
    })();
    jsflap.Node = Node;
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
        var NFATransition = (function () {
            function NFATransition(character) {
                this.character = character;
            }
            return NFATransition;
        })();
        Transition.NFATransition = NFATransition;
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

describe("Base Structure", function () {
    var board, svgElm;
    beforeEach(function () {
        svgElm = document.createElement('svg');
        board = new jsflap.Board(svgElm);
    });
    it("should exist", function () {
        expect(board).not.toBe(null);
        expect(typeof board !== 'undefined').toBe(true);
    });
});

describe("Edge", function () {
    var NodeA, NodeB, NodeC, Transition1;
    beforeEach(function () {
        NodeA = new jsflap.Node('A');
        NodeB = new jsflap.Node('B');
        NodeC = new jsflap.Node('C');
        Transition1 = new jsflap.Transition.NFATransition('a');
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

describe("Node", function () {
    it("should exist", function () {
        var node = new jsflap.Node('N1');
        expect(typeof node !== 'undefined').toBe(true);
    });
});
