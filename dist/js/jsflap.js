/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', ['mm.foundation']);
    angular.module('jsflap')
        .directive('jsflapBoardContainer', function($rootScope) {
            return {
                controller: function($element) {
                    this.element = $element[0];
                }
            };
        })
        .directive('jsflapBoard', function($rootScope) {
            return {
                require:['^jsflapApp','^jsflapBoardContainer'],
                link: function (scope, elm, attrs, requires) {
                    var jsflapApp = requires[0],
                        jsflapBoardContainer = requires[1];
                    jsflapApp.setBoard(new jsflap.Board.Board(elm[0], jsflapBoardContainer.element, jsflapApp.graph, $rootScope));
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
                result: null,
                outputString: '',
                error: ''
            };
            return {
                restrict: 'A',
                require: '^jsflapApp',
                link: {
                    pre: function(scope, elm, attrs, jsflapApp) {
                        scope.resultTotals = [
                            0,
                            0,
                            0
                        ];
                        
                        scope.hasOutputString = false;

                        function updateTests() {
                            if(jsflapApp.machine instanceof jsflap.Machine.TMachine) {
                                scope.hasOutputString = true;
                            } else {
                                scope.hasOutputString = false;
                            }
                            //console.log('STARTING TESTS');
                            scope.resultTotals[0] = 0;
                            scope.resultTotals[1] = 0;
                            scope.resultTotals[2] = 0;
                            //var t0 = performance.now();
                            scope.testInputs.forEach(function(testInput) {
                                testInput.error = '';
                                try {
                                    testInput.result = jsflapApp.machine.run(testInput.inputString, jsflapApp.graph);
                                    scope.resultTotals[+(testInput.result)] += 1;
                                } catch(e) {
                                    // Invalid Graph
                                    scope.resultTotals[2] += 1;
                                    testInput.result = null;
                                    
                                    if(e instanceof jsflap.Machine.MachineError) {
                                        testInput.error = e.toString();
                                    }
                                }
                                
                                if(scope.hasOutputString) {
                                    testInput.outputString = jsflapApp.machine.getCurrentTapeString();
                                } else {
                                    testInput.outputString = '';
                                }
                            });
                            //var t1 = performance.now();

                            //console.log("ENDED IN " + Math.round((t1 - t0) * 1000) / 1000 + " ms");
                        }
                        scope.uploadGraph = function(nodeL, edgeL) {
                            alert('yo')
                        }

                        scope.testInputs = [];

                        scope.loadNewGraph = function() {
                            console.log("new:")
                            newNodeL = []
                            testNodeL = ["q0", "q1", "q2"]
                            testNodeL.forEach( function (node) {
                                newNodeL.push(new jsflap.Node(node))
                            });
                            alert(self.board)
                            setGraph(new jsflap.Graph.FAGraph(false))
                        }
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
                    
                    var shiftKeyDown = false;

                    elm.on('keydown', function(event) {
                        switch(event.which) {
                            case 13:
                                scope.$emit('createTestInput', scope.$index);
                                break;
                            case 16:
                                shiftKeyDown = true;
                                break;
                            case 27:
                                scope.$emit('removeTestInput', scope.$index);
                                break;
                            case 32:
                                if(shiftKeyDown) {
                                    event.preventDefault(); 
                                    scope.$apply(function() {
                                        scope.testInput.inputString += jsflap.BLANK;
                                    });
                                }
                                break;
                        }
                    });
                    elm.on('keyup', function(event) {
                        switch(event.which) {
                            case 16:
                                shiftKeyDown = false;
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
            this.machine = new jsflap.Machine.FAMachine();

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
            
            this.setGraph = function(graph) {
                self.graph = graph;
                $scope.graph = self.graph;
                window.graph = self.graph;
               $scope.board.setNewGraph(graph);
            };

            $scope.availableThemes = {
                'modern': 'Modern Theme',
                'classic': 'Classic Theme'
            };
            
            $scope.availableTransitionStyles = ["Upright", "Perpendicular"];

            $scope.availableTypes = {
                'FA': 'Finite Automation',  
                'TM': 'Turning Machine'
            };

            $scope.graphMeta = {
                title: 'Untitled Graph 1',
                type: 'FA'
            };
            
            $scope.$watch('graphMeta.type', function (newType, oldType) {
                if(newType === oldType) {
                    return;
                }
                
                switch(newType) {
                    case "FA":
                        self.setGraph(new jsflap.Graph.FAGraph(false));
                        self.machine = new jsflap.Machine.FAMachine();
                        break;
                    case "TM":
                        self.setGraph(new jsflap.Graph.TMGraph(false));
                        self.machine = new jsflap.Machine.TMachine();
                        break;
                }
            });

            $scope.openHelpModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/HelpModal.html',
                    controller: 'HelpModalController'
                });
            };

            function computedToInline(element, recursive) {
                if (!element) {
                    throw new Error("No element specified.");
                }

                if (!(element instanceof Element)) {
                    throw new Error("Specified element is not an instance of Element.");
                }

                if (recursive) {
                    Array.prototype.forEach.call(element.children, function(child) {
                        computedToInline(child, recursive);
                    });
                }

                var computedStyle = getComputedStyle(element, null);
                for (var i = 0; i < computedStyle.length; i++) {
                    var property = computedStyle.item(i);
                    var value = computedStyle.getPropertyValue(property);
                    element.style[property] = value;
                }
            }
            
            /**
             * Writes an image into a canvas taking into
             * account the backing store pixel ratio and
             * the device pixel ratio.
             *
             * @author Paul Lewis
             * @param {Object} opts The params for drawing an image to the canvas
             */
            function drawImage(opts) {
            
                if(!opts.canvas) {
                    throw("A canvas is required");
                }
                if(!opts.image) {
                    throw("Image is required");
                }
            
                // get the canvas and context
                var canvas = opts.canvas,
                    context = canvas.getContext('2d'),
                    image = opts.image,
            
                // now default all the dimension info
                    srcx = opts.srcx || 0,
                    srcy = opts.srcy || 0,
                    srcw = opts.srcw || image.naturalWidth,
                    srch = opts.srch || image.naturalHeight,
                    desx = opts.desx || srcx,
                    desy = opts.desy || srcy,
                    desw = opts.desw || srcw,
                    desh = opts.desh || srch,
                    auto = opts.auto,
            
                // finally query the various pixel ratios
                    devicePixelRatio = window.devicePixelRatio || 1,
                    backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                        context.mozBackingStorePixelRatio ||
                                        context.msBackingStorePixelRatio ||
                                        context.oBackingStorePixelRatio ||
                                        context.backingStorePixelRatio || 1,
            
                    ratio = devicePixelRatio / backingStoreRatio;
            
                // ensure we have a value set for auto.
                // If auto is set to false then we
                // will simply not upscale the canvas
                // and the default behaviour will be maintained
                if (typeof auto === 'undefined') {
                    auto = true;
                }
            
                // upscale the canvas if the two ratios don't match
                if (auto && devicePixelRatio !== backingStoreRatio) {
            
                    var oldWidth = canvas.width;
                    var oldHeight = canvas.height;
            
                    canvas.width = oldWidth * ratio;
                    canvas.height = oldHeight * ratio;
            
                    canvas.style.width = oldWidth + 'px';
                    canvas.style.height = oldHeight + 'px';
            
                    // now scale the context to counter
                    // the fact that we've manually scaled
                    // our canvas element
                    context.scale(ratio, ratio);
            
                }
                
                // Fill a white BG to fix transparency
                context.fillStyle = "#FFFFFF";
                context.fillRect(desx, desy, desw, desh);
            
                context.drawImage(image, srcx, srcy, srcw, srch, desx, desy, desw, desh);
            }

            var svgClone;

            $scope.saveToImage = function () {

                var bounds = self.board.getBounds();

                var width = bounds.maxX + 50 - bounds.minX,
                    height = bounds.maxY + 50 - bounds.minY;

                svgClone = self.board.svg[0][0].cloneNode(true);

                // Avoid id collisions when adding the svg back to the body  
                svgClone.innerHTML = svgClone.innerHTML.replace(/markerArrow/g, "markerArrow_save").replace(/grid/g, "grid_save")
                
                // Remove the control points if the board was in move state
                svgClone.querySelector("g.control-points").remove();

                svgClone.style.width = width;
                svgClone.style.height = height;
                svgClone.setAttribute("viewBox", [bounds.minX - 25, bounds.minY - 25, bounds.maxX + 25, bounds.maxY + 25].join(" "));

                document.querySelector("body").appendChild(svgClone);
                computedToInline(svgClone, true);
                svgClone.style.display = "none";
                var svg_xml = (new XMLSerializer()).serializeToString(svgClone);
                var imgsrc = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg_xml)));
                document.querySelector("body").removeChild(svgClone);
                var canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                var context = canvas.getContext("2d");

                var image = new Image(width, height);
                image.src = imgsrc;

                image.onload = function() {

                    drawImage({image: image, canvas: canvas});

                    var canvasdata = canvas.toDataURL("image/png");

                    var a = document.createElement("a");
                    a.download = ($scope.graphMeta.title? $scope.graphMeta.title: "graph") + ".png";
                    a.href = canvasdata;
                    a.click();
                };

            };

            $scope.saveToLaTeX = function() {
                var src = "data:text/plain;base64," + btoa(unescape(encodeURIComponent(self.board.toLaTeX())));

                var a = document.createElement("a");
                a.download = ($scope.graphMeta.title? $scope.graphMeta.title: "graph") + ".tex";
                a.href = src;
                a.click();
            };

            $scope.saveToAutomatonDefinition = function() {
                var src = "data:text/plain;base64," + btoa(unescape(encodeURIComponent(self.graph.toString())));

                var a = document.createElement("a");
                a.download = ($scope.graphMeta.title? $scope.graphMeta.title: "graph") + ".txt";
                a.href = src;
                a.click();
            };

            $scope.saveToJSON = function() {
                var src = "data:text/plain;base64," + btoa(unescape(encodeURIComponent(self.board.toJSON())));

                var a = document.createElement("a");
                a.download = ($scope.graphMeta.title? $scope.graphMeta.title: "graph") + ".json";
                a.href = src;
                a.click();
            };

            $scope.saveToJFLAP = function() {
                var src = "data:text/plain;base64," + btoa(unescape(encodeURIComponent(self.board.toJFLAP())));

                var a = document.createElement("a");
                a.download = ($scope.graphMeta.title? $scope.graphMeta.title: "graph") + ".jff";
                a.href = src;
                a.click(); 
            }

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
    jsflap.UNKNOWN = String.fromCharCode(0xFFFD);
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
            this._hashCode = jsflap.Utils.getUUID();
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
        Edge.prototype.hashCode = function () {
            return this._hashCode;
        };
        return Edge;
    })();
    jsflap.Edge = Edge;
})(jsflap || (jsflap = {}));



///<reference path='IHashable.ts' />
var jsflap;
(function (jsflap) {
    var OrderedHashmap = (function () {
        /**
         * Create a new OrderedHashmap
         * @param items
         */
        function OrderedHashmap(items) {
            var _this = this;
            this.items = [];
            this.itemMap = {};
            if (items) {
                items.forEach(function (item) {
                    _this.add(item);
                });
            }
        }
        /**
         * Adds a new item to the list
         * @param item
         * @param index
         */
        OrderedHashmap.prototype.add = function (item, index) {
            if (!this.has(item)) {
                if (typeof index !== 'number') {
                    this.items.push(item);
                }
                else {
                    this.items.splice(index, 0, item);
                }
                this.itemMap[item.hashCode()] = item;
                return item;
            }
            else {
                return this.get(item);
            }
        };
        /**
         * Checks if the item list has a item
         * @returns {boolean}
         * @param item
         */
        OrderedHashmap.prototype.has = function (item) {
            if (typeof item === 'string') {
                return this.hasByHash(item) || this.hasByString(item);
            }
            else if (typeof item === 'object') {
                return this.hasByHash(item.hashCode()) || this.hasByString(item.toString());
            }
            else {
                return false;
            }
        };
        /**
         * Gets an item by a similar item object
         * @param item
         * @returns {*}
         */
        OrderedHashmap.prototype.get = function (item) {
            if (typeof item === 'string') {
                return this.getByHash(item) || this.getByString(item);
            }
            else if (typeof item === 'object') {
                return this.getByHash(item.hashCode()) || this.getByString(item.toString());
            }
            else {
                return null;
            }
        };
        /**
         * Removes a item from the list
         * @param item
         */
        OrderedHashmap.prototype.remove = function (item) {
            var itemObject = this.get(item);
            if (!itemObject) {
                return false;
            }
            var itemHash = itemObject.hashCode();
            this.items.splice(this.items.indexOf(itemObject), 1);
            delete this.itemMap[itemHash];
            return true;
        };
        /**
         * Gets an item by hash code
         * @param hashCode
         * @returns {any}
         */
        OrderedHashmap.prototype.getByHash = function (hashCode) {
            if (this.hasByHash(hashCode)) {
                return this.itemMap[hashCode];
            }
            else {
                return null;
            }
        };
        /**
         * Determines if the collection has by the hash code
         * @param hashCode
         * @returns {boolean}
         */
        OrderedHashmap.prototype.hasByHash = function (hashCode) {
            return this.itemMap.hasOwnProperty(hashCode);
        };
        /**
         * Gets an item by name
         * @param str
         * @returns {any}
         */
        OrderedHashmap.prototype.getByString = function (str) {
            for (var hashCode in this.itemMap) {
                if (this.itemMap.hasOwnProperty(hashCode) && this.itemMap[hashCode].toString() === str) {
                    return this.itemMap[hashCode];
                }
            }
            return null;
        };
        /**
         * Determines if the collection has by the name
         * @param str
         * @returns {boolean}
         */
        OrderedHashmap.prototype.hasByString = function (str) {
            return this.getByString(str) !== null;
        };
        Object.defineProperty(OrderedHashmap.prototype, "size", {
            /**
             * Gets the number of items
             * @returns {number}
             */
            get: function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        return OrderedHashmap;
    })();
    jsflap.OrderedHashmap = OrderedHashmap;
})(jsflap || (jsflap = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='OrderedHashmap.ts' />
var jsflap;
(function (jsflap) {
    var EdgeList = (function (_super) {
        __extends(EdgeList, _super);
        function EdgeList() {
            _super.apply(this, arguments);
        }
        return EdgeList;
    })(jsflap.OrderedHashmap);
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
            this._hashCode = jsflap.Utils.getUUID();
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
        Node.prototype.hashCode = function () {
            return this._hashCode;
        };
        return Node;
    })();
    jsflap.Node = Node;
})(jsflap || (jsflap = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='OrderedHashmap.ts' />
var jsflap;
(function (jsflap) {
    var NodeList = (function (_super) {
        __extends(NodeList, _super);
        function NodeList() {
            _super.apply(this, arguments);
        }
        return NodeList;
    })(jsflap.OrderedHashmap);
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
            function Board(svg, container, graph, $rootScope) {
                this.settings = {
                    theme: "modern",
                    transitionStyle: 1 /* PERPENDICULAR */
                };
                console.log(graph)
                console.log($rootScope)
                /**
                 * The function to call after the board has been updated
                 */
                this.onBoardUpdateFn = null;
                /**
                 * Quick test to determine if the platform is Apple-based for modifier keys
                 */
                this.platformIsApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                this.svg = d3.select(svg);
                this.container = container;
                this.boardBase = this.svg.select('g.background').append("rect").attr("fill", "url(#grid)").attr("opacity", 1).attr("width", "100%").attr("height", "100%");
                this.setNewGraph(graph);
                this.registerBindings($rootScope);
            }
            /**
             * Sets the board's new graph, resets all states
             */
            Board.prototype.setNewGraph = function (graph) {
                this.graph = graph;
                this.state = new _Board.BoardState();
                this.visualizations = new jsflap.Visualization.VisualizationCollection(this.svg, this);
                this.visualizations.update();
                this.invocationStack = new _Board.BoardInvocationStack();
            };
            Board.prototype.getSvg = function () {
                return this.svg;
            };
            Board.prototype.getContainer = function () {
                return this.container;
            };
            Board.prototype.reindexNodeNames = function () {
                var cmd = new _Board.Command.ReindexNodeLabelsCommand(this);
                this.invocationStack.trackExecution(cmd);
            };
            /**
             * Get the next valid node label
             */
            Board.prototype.getNextNodeLabel = function () {
                // A sparse array for checking the next lowest value
                var nodeIndexArray = [];
                this.visualizations.nodes.forEach(function (node) {
                    var curLabel = node.model.label;
                    // Loop through each node and see if its label starts with a q
                    if (curLabel.charAt(0) === "q") {
                        var value = parseInt(curLabel.substr(1));
                        if (!isNaN(value)) {
                            // If it does and its a valid nuber
                            nodeIndexArray[value] = true;
                        }
                    }
                });
                var maxLength = nodeIndexArray.length;
                if (maxLength == 0) {
                    return "q0";
                }
                for (var index = 0; index < maxLength; index++) {
                    if (!nodeIndexArray[index]) {
                        return "q" + index;
                    }
                }
                return "q" + maxLength;
            };
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
                    // Do not track modifier keys if the event was in an input field
                    // TODO: Better input field detection (e.g. textarea/select lists w/o multiple compares)
                    if (event.target.tagName.toLowerCase() === 'input') {
                        return;
                    }
                    switch (event.which) {
                        case 16:
                            _this.state.shiftKeyPressed = true;
                            _this.boardBase.transition().duration(250).attr("opacity", 0);
                            break;
                        case 17:
                            _this.state.ctrlKeyPressed = true;
                            break;
                        case 91:
                        case 93:
                        case 224:
                            _this.state.metaKeyPressed = true;
                            break;
                    }
                    if (!(event.target instanceof HTMLInputElement)) {
                        var result = _this.keydown(event);
                        $rootScope.$digest();
                    }
                    return result;
                });
                document.addEventListener('keyup', function (event) {
                    switch (event.which) {
                        case 16:
                            _this.state.shiftKeyPressed = false;
                            _this.boardBase.transition().duration(250).attr("opacity", 1);
                            break;
                        case 17:
                            _this.state.ctrlKeyPressed = false;
                            break;
                        case 91:
                        case 93:
                        case 224:
                            _this.state.metaKeyPressed = false;
                            break;
                    }
                    if (!(event.target instanceof HTMLInputElement)) {
                        var result = _this.keyup(event);
                        $rootScope.$digest();
                    }
                    return result;
                });
            };
            /**
             * Mouseup event listener
             * @param event
             */
            Board.prototype.mouseup = function (event) {
                if (event.event.which > 1) {
                    return false;
                }
                if (this.state.mode === 0 /* DRAW */) {
                    if (this.state.futureEdge) {
                        var cmd = new _Board.Command.AddEdgeFromNodeCommand(this, this.state.futureEdgeFrom, this.state.futureEdge.end);
                        var endingNode = cmd.getEndNodeV();
                        this.state.futureEdge.end = endingNode.getAnchorPointFrom(this.state.futureEdge.start) || this.state.futureEdge.start;
                        this.invocationStack.trackExecution(cmd);
                        this.editEdgeTransition(cmd.getEdge());
                        // Remove the future edge
                        this.state.futureEdge.remove();
                    }
                    this.state.futureEdge = null;
                    this.state.futureEdgeFrom = null;
                    this.state.futureEdgeFromValid = false;
                    this.state.futureEdgeFromCreated = false;
                }
                else if (this.state.mode === 1 /* MOVE */) {
                    if (this.state.draggingCommand !== null) {
                        this.invocationStack.trackExecution(this.state.draggingCommand);
                        this.state.draggingCommand = null;
                    }
                    this.state.draggingNode = null;
                    this.state.modifyEdgeControl = null;
                    this.state.isDraggingBoard = false;
                }
                else if (this.state.mode === 2 /* ERASE */) {
                    this.state.isErasing = false;
                }
            };
            /**
             * Adds an edge to the board given two nodes and a future edge
             * @param existingEdgeV
             * @param from
             * @param to
             * @param transition
             * @param index
             */
            Board.prototype.addEdge = function (existingEdgeV, from, to, transition, index, pending) {
                var edge = this.graph.addEdge(from.model, to.model, transition || jsflap.LAMBDA, pending), foundEdgeV;
                foundEdgeV = this.visualizations.getEdgeVisualizationByNodes(from.model, to.model);
                // If there already is a visualization between these two edges, add the edge to that model
                if (foundEdgeV) {
                    foundEdgeV.addEdgeModel(edge, typeof index === 'number' ? index : null);
                    if (typeof index === 'number') {
                        foundEdgeV.reindexEdgeModels();
                    }
                    // Visualizations don't auto-update here, so we need to force call it
                    if (this.visualizations.shouldAutoUpdateOnModify) {
                        this.visualizations.update();
                    }
                    return foundEdgeV;
                }
                else {
                    if (existingEdgeV) {
                        var edgeV = existingEdgeV;
                        edgeV.addEdgeModel(edge);
                    }
                    else {
                        var edgeV = new jsflap.Visualization.EdgeVisualization(edge);
                    }
                    this.handleOppositeEdgeExpanding(edgeV);
                    return this.visualizations.addEdge(edgeV);
                }
            };
            Board.prototype.addEdgeVisualization = function (edgeV) {
                var _this = this;
                edgeV.models.items.forEach(function (edge) {
                    _this.graph.addEdge(edge);
                });
                this.visualizations.addEdge(edgeV);
            };
            /**
             * Handles the opposite edge expanding animations
             * @param edgeV
             */
            Board.prototype.handleOppositeEdgeExpanding = function (edgeV) {
                var foundOppositeEdgeV = this.visualizations.getEdgeVisualizationByNodes(edgeV.toModel, edgeV.fromModel);
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
            };
            /**
             * Starts editing the edge transition
             * @param edge
             */
            Board.prototype.editEdgeTransition = function (edge) {
                //setTimeout(() => {
                var elm = this.svg.selectAll('g.edgeTransitions text.transition').filter(function (possibleEdge) { return possibleEdge === edge; }).select("tspan:first-child");
                if (elm.length > 0) {
                    this.visualizations.update();
                    this.visualizations.editTransition(edge, elm.node());
                }
                //}, 20);
            };
            /**
             * Sets the initial node for the graph
             * @param node
             * @param trackHistory
             */
            Board.prototype.setInitialNode = function (node, trackHistory) {
                var cmd = new _Board.Command.SetInitialNodeCommand(this, node ? node.model : null);
                if (trackHistory) {
                    this.invocationStack.trackExecution(cmd);
                }
                else {
                    cmd.execute();
                }
            };
            /**
             * Marks the final node for the graph
             * @param node
             * @param trackHistory
             */
            Board.prototype.markFinalNode = function (node, trackHistory) {
                var cmd = new _Board.Command.MarkFinalNodeCommand(this, node ? node.model : null);
                if (trackHistory) {
                    this.invocationStack.trackExecution(cmd);
                }
                else {
                    cmd.execute();
                }
            };
            /**
             * Unmarks the final node for the graph
             * @param node
             * @param trackHistory
             */
            Board.prototype.unmarkFinalNode = function (node, trackHistory) {
                var cmd = new _Board.Command.UnmarkFinalNodeCommand(this, node ? node.model : null);
                if (trackHistory) {
                    this.invocationStack.trackExecution(cmd);
                }
                else {
                    cmd.execute();
                }
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
                if (this.state.mode === 0 /* DRAW */) {
                    if (this.state.editableTextInputField === null) {
                        if (nearestNode.node && nearestNode.distance < 70) {
                            this.state.futureEdgeFrom = nearestNode.node;
                        }
                        else {
                            var snappedPoint = event.point.getMPoint();
                            if (!this.state.shiftKeyPressed) {
                                snappedPoint.round(20);
                            }
                            var cmd = new _Board.Command.AddNodeAtPointCommand(this, snappedPoint);
                            // Only add a node if the user is not currently click out of editing a transition OR is near a node
                            this.invocationStack.trackExecution(cmd);
                            this.state.futureEdgeFromCreated = true;
                            this.state.futureEdgeFrom = cmd.getNodeV();
                        }
                    }
                }
                else if (this.state.mode === 1 /* MOVE */ && !this.state.modifyEdgeControl) {
                    if (nearestNode.node && nearestNode.hover) {
                        this.state.draggingNode = nearestNode.node;
                        this.state.draggingCommand = new _Board.Command.MoveNodeCommand(this, this.state.draggingNode);
                    }
                    else {
                        this.state.isDraggingBoard = true;
                        this.state.draggingCommand = new _Board.Command.MoveBoardCommand(this);
                    }
                }
                else if (this.state.mode === 2 /* ERASE */) {
                    this.state.isErasing = true;
                    this.handleErasing(event.point);
                }
                // If the user was focused on modifying an edge transition, blur it.
                if (this.state.editableTextInputField !== null) {
                    this.state.editableTextInputField.blur();
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
                        if (!this.state.shiftKeyPressed) {
                            point.round(20);
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
                        if (!this.state.futureEdgeFromValid) {
                            // See if the user has dragged outside the node
                            var distance = point.getDistanceTo(this.state.futureEdgeFrom.position);
                            if (distance > this.state.futureEdgeFrom.radius) {
                                this.state.futureEdgeFromValid = true;
                            }
                        }
                        // Check again becuase it may have changed in the above if block
                        if (this.state.futureEdgeFromValid) {
                            this.state.futureEdge = new jsflap.Visualization.FutureEdgeVisualization(event.point.getMPoint(), event.point.getMPoint());
                            this.state.futureEdge.start = this.state.futureEdgeFrom.getAnchorPointFrom(event.point);
                            this.state.futureEdge.addTo(this.svg);
                        }
                    }
                }
                else if (this.state.mode === 1 /* MOVE */ && (this.state.draggingNode || this.state.modifyEdgeControl || this.state.isDraggingBoard)) {
                    var snappedPoint = point.getMPoint();
                    if (!this.state.shiftKeyPressed) {
                        snappedPoint.round(20);
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
                        if (!this.state.shiftKeyPressed) {
                            point.round(20);
                        }
                        point.subtract(this.state.lastMousePoint);
                        this.visualizations.nodes.forEach(function (nodeV) {
                            nodeV.position.add(point);
                        });
                        this.visualizations.edges.forEach(function (edgeV) {
                            var controlPoint = null;
                            // Only bother keeping the relative location of the control point if it has been moved
                            if (edgeV.hasMovedControlPoint()) {
                                controlPoint = edgeV.control.add(point);
                            }
                            edgeV.recalculatePath(controlPoint ? controlPoint : null);
                        });
                    }
                    this.visualizations.update();
                }
                else if (this.state.mode === 2 /* ERASE */ && this.state.isErasing) {
                    this.handleErasing(point);
                }
                var snappedMousePoint = event.point.getMPoint();
                if (!this.state.shiftKeyPressed) {
                    snappedMousePoint.round(20);
                }
                this.state.lastMousePoint = snappedMousePoint;
            };
            /**
             * Handles erasing at a point
             * @param point
             */
            Board.prototype.handleErasing = function (point) {
                // If we are hovering over an edge and we have not yet erased at least the first edge model from it yet
                if (this.state.hoveringEdge && this.graph.hasEdge(this.state.hoveringEdge.models.items[0])) {
                    var cmd = new _Board.Command.EraseEdgeCommand(this, this.state.hoveringEdge);
                    this.invocationStack.trackExecution(cmd);
                }
                else if (this.state.hoveringTransition && this.graph.hasEdge(this.state.hoveringTransition)) {
                    var cmd1 = new _Board.Command.EraseEdgeTransitionCommand(this, this.state.hoveringTransition);
                    this.invocationStack.trackExecution(cmd1);
                }
                else {
                    var nearestNode = this.visualizations.getNearestNode(point);
                    if (nearestNode.node && nearestNode.hover) {
                        var cmd2 = new _Board.Command.EraseNodeCommand(this, nearestNode.node);
                        this.invocationStack.trackExecution(cmd2);
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
             * Removes a transition from an edge, and the edge itself if its the last transition
             * @param edgeV
             * @param edgeModel
             */
            Board.prototype.removeEdgeTransistion = function (edgeV, edgeModel) {
                // If this is the last transition on the edge, just remove the whole edge
                if (edgeV.models.size === 1) {
                    return this.removeEdge(edgeV);
                }
                // Delete this edge from the visualization
                edgeV.models.remove(edgeModel);
                this.graph.removeEdge(edgeModel);
                // Now we need to re-index the visualizations
                edgeV.reindexEdgeModels();
                // And force a update
                this.visualizations.update();
            };
            /**
             * Removes an edge from the graph
             * @param edgeV
             */
            Board.prototype.removeEdge = function (edgeV) {
                var _this = this;
                // Delete each edge from this visualization
                if (edgeV.models.size > 0) {
                    edgeV.models.items.forEach(function (edge) { return _this.graph.removeEdge(edge); });
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
                //alert("Hi")
                var _this = this;
                var toEdges = nodeV.model.toEdges.items.slice(0), fromEdges = nodeV.model.fromEdges.items.slice(0), deleteFn = function (edgeModel) {
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
                // Do not alow any undo/redo, mode changes, or node settings while drawing new edge
                if (this.state.futureEdgeFrom !== null) {
                    return;
                }
                switch (event.which) {
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
                            nearestNode.node.model.final ? this.unmarkFinalNode(nearestNode.node, true) : this.markFinalNode(nearestNode.node, true);
                        }
                        break;
                    case 73:
                        var nearestNode = this.visualizations.getNearestNode(this.state.lastMousePoint);
                        if (nearestNode.node && nearestNode.hover) {
                            if (!nearestNode.node.model.initial) {
                                this.setInitialNode(nearestNode.node, true);
                            }
                            else {
                                this.setInitialNode(null, true);
                            }
                            this.visualizations.update();
                        }
                        break;
                    case 89:
                        if (this.isModifierKeyPressed()) {
                            this.invocationStack.redo();
                            event.preventDefault();
                        }
                        return false;
                        break;
                    case 90:
                        if (this.isModifierKeyPressed()) {
                            if (this.state.shiftKeyPressed) {
                                this.invocationStack.redo();
                            }
                            else {
                                this.invocationStack.undo();
                            }
                            event.preventDefault();
                        }
                        return false;
                        break;
                }
                return true;
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
                return true;
            };
            Board.prototype.isModifierKeyPressed = function () {
                return this.platformIsApple ? this.state.metaKeyPressed : this.state.ctrlKeyPressed;
            };
            Board.prototype.getBounds = function () {
                var minX = Number.MAX_VALUE, maxX = 0, minY = Number.MAX_VALUE, maxY = 0, posX, posY, radius, curMinX, curMaxX, curMinY, curMaxY;
                this.visualizations.nodes.forEach(function (node) {
                    posX = node.position.x;
                    posY = node.position.y;
                    radius = node.radius;
                    curMinX = posX - radius;
                    curMaxX = posX + radius;
                    curMinY = posY - radius;
                    curMaxY = posY + radius;
                    if (node.model.final) {
                        curMinX -= 20;
                    }
                    minX = Math.min(curMinX, minX);
                    maxX = Math.max(curMaxX, maxX);
                    minY = Math.min(curMinY, minY);
                    maxY = Math.max(curMaxY, maxY);
                });
                var startPos, endPos, controlPos;
                this.visualizations.edges.forEach(function (edge) {
                    startPos = edge.start;
                    controlPos = edge.control;
                    endPos = edge.end;
                    curMinX = Math.min(startPos.x, controlPos.x, endPos.x);
                    curMaxX = Math.max(startPos.x, controlPos.x, endPos.x);
                    curMinY = Math.min(startPos.y, controlPos.y, endPos.y);
                    curMaxY = Math.max(startPos.y, controlPos.y, endPos.y);
                    minX = Math.min(curMinX, minX);
                    maxX = Math.max(curMaxX, maxX);
                    minY = Math.min(curMinY, minY);
                    maxY = Math.max(curMaxY, maxY);
                });
                return {
                    minX: minX,
                    maxX: maxX,
                    minY: minY,
                    maxY: maxY
                };
            };
            Board.prototype.clear = function() {
                this.visualizations.edges.forEach(function (edgeV) {
                    this.removeEdge(edgeV);
                });
                alert("Done")
            }
            Board.prototype.toLaTeX = function () {
                var texData = '';
                var bounds = this.getBounds();
                var minX = bounds.minX, maxX = bounds.maxX, minY = bounds.minY, maxY = bounds.maxY;
                var offsetPoint = new jsflap.Point.IMPoint(minX, minY);
                this.visualizations.nodes.forEach(function (node) {
                    var pos = node.position.getMPoint().subtract(offsetPoint).round();
                    texData += '    \\draw (' + pos.x + ',' + pos.y + ') circle (' + node.radius + '); \n';
                    texData += '    \\draw (' + pos.x + ',' + pos.y + ') node[nodeLabel] {$' + node.model.label + '$}; \n';
                    if (node.model.final) {
                        texData += '    \\draw (' + pos.x + ',' + pos.y + ') circle (' + (node.radius - 2) + '); \n';
                    }
                    if (node.model.initial) {
                        texData += '    \\draw (' + (pos.x - node.radius) + ',' + pos.y + ') -- (' + (pos.x - node.radius - 20) + ',' + (pos.y - 20) + ') -- (' + (pos.x - node.radius - 20) + ',' + (pos.y + 20) + ') --  cycle;\n';
                    }
                });
                this.visualizations.edges.forEach(function (edge) {
                    var startPos = edge.start.getMPoint().subtract(offsetPoint).round(), endPos = edge.end.getMPoint().subtract(offsetPoint).round(), controlPos = edge.control.getMPoint().subtract(offsetPoint).round();
                    // Need to convert to cubic Bezier points instead of quadratic Bezier.
                    var cubicControlPos1 = new jsflap.Point.MPoint((1 / 3) * startPos.x + (2 / 3) * controlPos.x, (1 / 3) * startPos.y + (2 / 3) * controlPos.y).round(), cubicControlPos2 = new jsflap.Point.MPoint((2 / 3) * controlPos.x + (1 / 3) * endPos.x, (2 / 3) * controlPos.y + (1 / 3) * endPos.y).round();
                    texData += '    \\draw [edge] (' + startPos.x + ',' + startPos.y + ') .. controls(' + cubicControlPos1.x + ',' + cubicControlPos1.y + ') and (' + cubicControlPos2.x + ',' + cubicControlPos2.y + ') .. (' + endPos.x + ',' + endPos.y + '); \n';
                    edge.models.items.forEach(function (edgeModel) {
                        var textPos = edge.getTransitionPoint(edgeModel.visualizationNumber).getMPoint().subtract(offsetPoint).round(), textContent = edgeModel.transition.toString();
                        if (textContent === jsflap.LAMBDA) {
                            textContent = '\\lambda';
                        }
                        else if (textContent === jsflap.BLANK) {
                            textContent = '\\Box';
                        }
                        texData += '    \\draw (' + textPos.x + ', ' + textPos.y + ') node[edgeTransition] {$' + textContent + '$}; \n';
                    });
                });
                return '\\documentclass[12pt]{article}\n' + '\\usepackage{tikz}\n' + '\\usetikzlibrary{arrows.meta}\n' + '\n' + '\\begin{document}\n' + '\n' + '\\begin{center}\n' + '\\resizebox{\\columnwidth}{!}{\n' + '    \\begin{tikzpicture}[y=-1, x = 1]\n' + '    \\tikzstyle{nodeLabel}+=[inner sep=0pt, font=\\large]\n' + '    \\tikzstyle{edge}+=[-{Latex[length=5, width=7]}]\n' + '    \\tikzstyle{edgeTransition}+=[draw=white, fill=white, inner sep = 1] \n' + texData + '    \\end{tikzpicture}\n' + '}\n' + '\\end{center}\n' + '\n' + '\\end{document}\n';
            };
            Board.prototype.toJSON = function() {
                //Contributed by Jason Ma
                //Creates a string in JSON format of the graph and returns it
                var JSONData = '';
                var bounds = this.getBounds();
                var minX = bounds.minX, maxX = bounds.maxX, minY = bounds.minY, maxY = bounds.maxY;
                var offsetPoint = new jsflap.Point.IMPoint(minX, minY);
                JSONData += '{board : {\n'

                var hasPassed = false;
                var numNodes = 0;
                var nodeData = '';
                this.visualizations.nodes.forEach(function (node) {
                    numNodes += 1;
                    var pos = node.position.getMPoint().subtract(offsetPoint).round();
                    if (hasPassed) {
                        nodeData += ', \n';
                    } else {
                        nodeData += '\tNodeL : [\n';
                    }
                    nodeData += '\t\t{\n'
                    nodeData += '\t\tName : ' + node.model.label + ', \n'
                    nodeData += '\t\tXCoor : ' + pos.x + ', \n';
                    nodeData += '\t\tYCoor : ' + pos.y + ', \n';
                    if (node.model.final) {
                        nodeData += '\t\tFinal : true, \n';
                    } else {
                        nodeData += '\t\tFinal : false, \n';
                    }
                    if (node.model.initial) {
                        nodeData += '\t\tInitial : true, \n';
                    } else {
                        nodeData += '\t\tInitial : false, \n';
                    }
                    nodeData += '\t\t}';
                    hasPassed = true;
                }); 
                if (hasPassed) {
                    nodeData += '\n\t];\n';
                }
                JSONData += '\tnumNodes : ' + numNodes.toString() + ';\n';
                

                
                hasPassed = false;
                var numEdges = 0;
                var edgeData = '';
                this.visualizations.edges.forEach(function (edge) {
                    numEdges += 1
                    if (hasPassed) {
                        edgeData += ', \n'
                    } else {
                        edgeData += '\tEdgeL : [\n';
                    }
                    edgeData += '\t\t{\n'
                    edgeData += '\t\tStart Node : ' + edge.fromModel.label + ', \n';
                    edgeData += '\t\tEnd Node : ' + edge.toModel.label + ', \n';
                    edge.models.items.forEach(function (edgeModel) {
                        edgeData += '\t\tReadValue : ' + edgeModel.transition.toString() + ', \n';
                    });
                    edgeData += '\t\t}';
                    hasPassed = true;
                });
                if (hasPassed) {
                    edgeData += '\n\t];\n';
                }
                JSONData += '\tnumEdges : ' + numEdges.toString() + ';\n';
                JSONData += nodeData;
                JSONData += edgeData;
                JSONData += '}\n';
                return JSONData;
            };
            Board.prototype.toJFLAP = function() {
                //Contributed by Jason
                //Creates an string for an XML file from the graph on the screen and returns its
                var jffData = '';

                var bounds = this.getBounds();

                var minX = bounds.minX,
                    maxX = bounds.maxX,
                    minY = bounds.minY,
                    maxY = bounds.maxY;

                var offsetPoint = new jsflap.Point.IMPoint(minX, minY);

                stateData = '';

                var nodeCounter = 0;
                var dictionary = {};
                this.visualizations.nodes.forEach(function (node) {
                    var pos = node.position.getMPoint().subtract(offsetPoint).round();
                    if (this.graph.shortName === 'FA') {
                        stateData += '\t\t<state id="' + nodeCounter + '" name="' + node.model.label + '">\n'
                        stateData += '\t\t\t<x>' + pos.x + '</x>\n'
                        stateData += '\t\t\t<y>' + pos.y + '</y>\n'

                        dictionary[node.model.label] = nodeCounter;
                        if(node.model.initial) {
                            stateData += '\t\t\t<initial/>\n';
                        } 

                        if(node.model.final) {
                            stateData += '\t\t\t<final/>\n';
                        }
                        stateData += '\t\t</state>\n';
                    } else  {
                        stateData += '\t\t<block id="' + nodeCounter + '" name="' + node.model.label + '">\n'
                        stateData += '\t\t\t<tag>Machine' + nodeCounter + '</tag>' 
                        stateData += '\t\t\t<x>' + pos.x + '</x>\n'
                        stateData += '\t\t\t<y>' + pos.y + '</y>\n'

                        dictionary[node.model.label] = nodeCounter;
                        if(node.model.initial) {
                            stateData += '\t\t\t<initial/>\n';
                        } 

                        if(node.model.final) {
                            stateData += '\t\t\t<final/>\n';
                        }

                        stateData += '\t\t</block>\n';
                    }

                    nodeCounter++;
                });


                var edgeData = '';
                this.visualizations.edges.forEach(function (edge) {
                    edgeData += '\t\t<transition>\n'
                    edgeData += '\t\t\t<from>' + dictionary[edge.fromModel.label] + '</from>\n'
                    edgeData += '\t\t\t<to>' + dictionary[edge.toModel.label] + '</to>\n'


                    edge.models.items.forEach(function (edgeModel) {
                        edgeReadVal = edgeModel.transition.toString();
                        if (this.graph.shortName === 'FA') {
                            if (edgeReadVal === jsflap.LAMBDA) {
                                edgeData += '\t\t\t<read/>\n'
                            } else {
                            edgeData += '\t\t\t<read>' + edgeReadVal + '</read>\n'
                            }
                        } else {
                            alert()
                            edgeRead = edgeReadVal.splice(0,1);
                            edgeWrite = edgeReadVal.splice(2,3);
                            edgeMove = edgeReadVal.splice(4,5);

                            if (edgeRead === jsflap.BLANK) {
                                edgeData += '\t\t\t<read/>\n'
                            } else {
                                edgeData += '\t\t\t<read>' + edgeRead + '</read>\n'
                            }
                            edgeData += '\t\t\t<write>' + edgeWrite + '</write>\n'
                            edgeData += '\t\t\t<move>' + edgeMove + '</move>\n'
                        }
                    });

                    edgeData += '\t\t<transition>\n'
                });

                jffData = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
                jffData += '<!--Created with JFLAP 6.4.-->\n'
                jffData += '<structure>\n'
                if (this.graph.shortName === 'FA') {
                    jffData += '\t<type>fa</type>\n'
                } else {
                    jffData += '\t<type>turing</type>\n'
                }

                jffData += '\t<automaton>\n';
                jffData += '\t<!--The list of states.-->\n';
                jffData += stateData;
                jffData += '\t<!--The list of transitions.-->\n';
                jffData += edgeData;

                if (this.graph.shortName === 'TM') {
                    jffData += '\t<!--The list of automata-->\n';
                    for(var i = 0; i < nodeCounter; i++) {
                        jffData += '\t\t<Machine' + i + '/>\n';
                    }
                }

                jffData += '\t<automaton>\n';
                jffData += '</structure>';

                return jffData;
            
            }

            Board.prototype.upload = function(nodeL, edgeL) {   

                this.setMode(0)
                newNodeL = []
                testNodeL = ["q0", "q1", "q2"]
                testNodeL.forEach( function (node) {
                    newNodeL.push(new jsflap.Node(node))
                });

                return "Hec Yeah";
            }
            return Board;
        })();
        _Board.Board = Board;
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        /**
         * The invocation stack for the commands
         */
        var BoardInvocationStack = (function () {
            function BoardInvocationStack() {
                /**
                 * THe actual list of commands
                 * @type {Array}
                 */
                this.commands = [];
                /**
                 * The current index we are at in the commands
                 * @type {number}
                 */
                this.currentIndex = -1;
            }
            /**
             * Stores and
             * @param command
             */
            BoardInvocationStack.prototype.trackExecution = function (command) {
                // Remove any commands ahead of this one, if at all
                this.commands.splice(this.currentIndex + 1, this.commands.length - this.currentIndex);
                this.commands.push(command);
                this.currentIndex++;
                command.execute();
            };
            /**
             * Undoes the latest command
             */
            BoardInvocationStack.prototype.undo = function () {
                if (!this.hasUndo()) {
                    return;
                }
                this.commands[this.currentIndex].undo();
                this.currentIndex -= 1;
            };
            /**
             * Redoes the latest command
             */
            BoardInvocationStack.prototype.redo = function () {
                if (!this.hasRedo()) {
                    return;
                }
                this.commands[this.currentIndex + 1].execute();
                this.currentIndex += 1;
            };
            /**
             * If we have commands to undo
             * @returns {boolean}
             */
            BoardInvocationStack.prototype.hasUndo = function () {
                return this.currentIndex !== -1;
            };
            /**
             * If we have commands to redo
             * @returns {boolean}
             */
            BoardInvocationStack.prototype.hasRedo = function () {
                return this.currentIndex < (this.commands.length - 1);
            };
            return BoardInvocationStack;
        })();
        Board.BoardInvocationStack = BoardInvocationStack;
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        (function (TransitionStyle) {
            TransitionStyle[TransitionStyle["UPRIGHT"] = 0] = "UPRIGHT";
            TransitionStyle[TransitionStyle["PERPENDICULAR"] = 1] = "PERPENDICULAR";
        })(Board.TransitionStyle || (Board.TransitionStyle = {}));
        var TransitionStyle = Board.TransitionStyle;
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
                this.futureEdgeFromValid = false;
                this.futureEdgeFromCreated = false;
                this.shiftKeyPressed = false;
                this.ctrlKeyPressed = false;
                this.metaKeyPressed = false;
                this.draggingNode = null;
                this.isErasing = false;
                this.hoveringEdge = null;
                this.hoveringTransition = null;
                this.isDraggingBoard = false;
                this.quickMoveFrom = null;
                this.editableTextInputField = null;
                this.modifyEdgeControl = null;
                this.contextMenuOptions = null;
                this.lastMousePoint = null;
                this.draggingCommand = null;
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
                this.shortName = "FA";
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
                    //this.setInitialNode(null);
                    this.initialNode = null;
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
             * @param pending
             * @returns {jsflap.Edge|any}
             */
            FAGraph.prototype.addEdge = function (from, to, transition, pending) {
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
                        transitionObj = this.createTransitionFromString(transition, !!pending);
                    }
                    else if (typeof transition === 'object') {
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
                this.updateAlphabetForEgde(edge);
                return this.edges.add(edge);
            };
            FAGraph.prototype.createTransitionFromString = function (str, pending) {
                return new jsflap.Transition.CharacterTransition(str, pending);
            };
            /**
             * Updates the alphabet after any changes to the transitions
             */
            FAGraph.prototype.updateAlphabet = function () {
                var _this = this;
                // Clear the alphabet
                this.alphabet = {};
                // Update the alphabet
                this.edges.items.forEach(function (edge) { return _this.updateAlphabetForEgde(edge); });
            };
            FAGraph.prototype.updateAlphabetForEgde = function (edge) {
                var transitionChar = edge.transition.toString();
                if (!this.alphabet.hasOwnProperty(transitionChar) && transitionChar !== jsflap.LAMBDA && transitionChar !== jsflap.BLANK) {
                    this.alphabet[transitionChar] = true;
                }
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
                str += this.nodes.items.map(function (node) {
                    return node.toString();
                }).join(', ');
                str += '}, ';
                //Transitions
                str += '{';
                str += this.edges.items.map(function (edge) {
                    return edge.toString();
                }).join(', ');
                str += '}, ';
                // Start symbol
                str += this.initialNode ? this.initialNode.toString() : '';
                str += ', ';
                // Final Nodes
                str += '{';
                str += this.finalNodes.items.map(function (node) {
                    return node.toString();
                }).join(', ');
                str += '}';
                // End definition
                str += ')';
                return str;
            };
            FAGraph.prototype.fromString = function (input) {
                var _this = this;
                var configRegex = new RegExp("^([D,N])" + this.shortName + ":\\({(.*)}, {(.*)}, {(.*)}, (.*), {(.*)}\\)$");
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
                    for (var nodeString in this.nodes.items) {
                        if (this.nodes.items.hasOwnProperty(nodeString)) {
                            var node = this.nodes.items[nodeString];
                            var alphabet = angular.copy(this.alphabet);
                            // Loop through each of the node's outward edges
                            node.toEdges.items.forEach(function (edge) {
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
            FAGraph.prototype.getEmptyTransitionCharacter = function () {
                return jsflap.LAMBDA;
            };
            return FAGraph;
        })();
        Graph.FAGraph = FAGraph;
    })(Graph = jsflap.Graph || (jsflap.Graph = {}));
})(jsflap || (jsflap = {}));



var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jsflap;
(function (jsflap) {
    var Graph;
    (function (Graph) {
        var TMGraph = (function (_super) {
            __extends(TMGraph, _super);
            function TMGraph() {
                _super.apply(this, arguments);
                this.shortName = "TM";
            }
            TMGraph.prototype.createTransitionFromString = function (transition, pending) {
                var read, write, direction;
                if (transition !== null && transition.length === 6) {
                    read = transition[0];
                    write = transition[2];
                    var directionStr = transition[5];
                    direction = (directionStr === "L" ? -1 /* LEFT */ : (directionStr === "R" ? 1 /* RIGHT */ : null));
                }
                else {
                    read = jsflap.BLANK;
                    write = jsflap.BLANK;
                    direction = 1 /* RIGHT */;
                }
                return new jsflap.Transition.TuringTransition(read, write, direction, pending);
            };
            TMGraph.prototype.updateAlphabetForEdge = function (edge) {
                var transitionCharRead = edge.transition.read;
                var transitionCharWrite = edge.transition.write;
                if (transitionCharRead !== null && !this.alphabet.hasOwnProperty(transitionCharRead)) {
                    this.alphabet[transitionCharRead] = true;
                }
                if (transitionCharWrite !== null && !this.alphabet.hasOwnProperty(transitionCharWrite)) {
                    this.alphabet[transitionCharWrite] = true;
                }
            };
            TMGraph.prototype.getEmptyTransitionCharacter = function () {
                return jsflap.BLANK;
            };
            return TMGraph;
        })(Graph.FAGraph);
        Graph.TMGraph = TMGraph;
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
                var edgeList = this.node.toEdges.items, nextStates = [];
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
    var Machine;
    (function (Machine) {
        var MachineError = (function () {
            function MachineError(message) {
                this.message = message;
            }
            MachineError.prototype.toString = function () {
                return this.message;
            };
            return MachineError;
        })();
        Machine.MachineError = MachineError;
    })(Machine = jsflap.Machine || (jsflap.Machine = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Machine;
    (function (Machine) {
        var TMachine = (function () {
            /**
             * Creates a new machine based on a graph
             * @param graph
             */
            function TMachine(graph) {
                /**
                 * The max number of times a state with the same input position, node, and tape contents can be repeated
                 */
                this.MAX_STATE_REPEAT = 100;
                this.MAX_STEP_COUNT = 1000;
                this.stepCount = 0;
                this.setGraph(graph);
            }
            /**
             * Sets the graph for the machine
             * @param graph
             */
            TMachine.prototype.setGraph = function (graph) {
                this.graph = graph;
            };
            /**
             * Runs a string on the machine to see if it passes or fails
             * @param input
             * @returns {boolean}
             * @param graph
             */
            TMachine.prototype.run = function (input, graph) {
                var inputTape = input.split('');
                if (inputTape.length === 0) {
                    inputTape.push(null);
                }
                if (graph) {
                    this.graph = graph;
                }
                if (!this.graph.isValid()) {
                    throw new Error('Invalid graph');
                }
                var initialNode = this.graph.getInitialNode(), initialState = new Machine.TMachineState(inputTape, 0, initialNode);
                // Trivial case
                if (!initialNode) {
                    return false;
                }
                // Setup for backtracking
                this.visitedStates = {};
                this.visitedStates[initialState.toString()] = 1;
                this.queue = [initialState];
                this.stepCount = 0;
                while (this.queue.length > 0 && this.stepCount++ < this.MAX_STEP_COUNT) {
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
                        var nextStateString = nextState.toString();
                        // Check if we have already visited this state before
                        if (!this.visitedStates.hasOwnProperty(nextStateString)) {
                            // We haven't, add it to our visited state list and queue
                            this.visitedStates[nextStateString] = 1;
                            this.queue.push(nextState);
                        }
                        else if (this.visitedStates[nextStateString] < this.MAX_STATE_REPEAT) {
                            this.visitedStates[nextStateString]++;
                            this.queue.push(nextState);
                        }
                        else {
                            throw new Machine.MachineError("Reached max state repeat (" + this.MAX_STATE_REPEAT + ")");
                        }
                    }
                }
                if (this.stepCount - 1 === this.MAX_STEP_COUNT) {
                    throw new Machine.MachineError("Reached max steps (" + this.MAX_STEP_COUNT + ")");
                }
                // If we got here the states were all invalid
                return false;
            };
            TMachine.prototype.getCurrentTapeString = function () {
                if (!this.currentState) {
                    return '';
                }
                var resultString = '';
                this.currentState.input.forEach(function (element, index) {
                    if (element === null) {
                        resultString += jsflap.BLANK;
                    }
                    else {
                        resultString += element;
                    }
                });
                return resultString;
            };
            return TMachine;
        })();
        Machine.TMachine = TMachine;
    })(Machine = jsflap.Machine || (jsflap.Machine = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Machine;
    (function (Machine) {
        var TMachineState = (function () {
            /**
             * Create a new NFA Machine state
             * @param input
             * @param node
             */
            function TMachineState(input, inputPosition, node) {
                this.input = input;
                this.inputPosition = inputPosition;
                this.node = node;
            }
            /**
             * Determines if this state is final
             * @returns {boolean}
             */
            TMachineState.prototype.isFinal = function () {
                return this.getNextStates().length === 0 && this.node.final;
            };
            /**
             * Gets the next possible states
             * @returns {Array}
             */
            TMachineState.prototype.getNextStates = function () {
                var edgeList = this.node.toEdges.items, nextStates = [];
                for (var edgeName in edgeList) {
                    if (edgeList.hasOwnProperty(edgeName)) {
                        var edge = edgeList[edgeName];
                        // See if we can follow this edge
                        var transition = edge.transition;
                        if (transition.canFollowOn(this.input[this.inputPosition])) {
                            var newInputPosition = this.inputPosition + transition.direction;
                            var newInput = this.input.slice();
                            if (typeof (transition.direction) !== 'undefined') {
                                // Create space for the new character
                                newInput[this.inputPosition] = transition.write;
                                if (newInputPosition < 0) {
                                    newInputPosition = 0;
                                    newInput.unshift(null);
                                }
                                else if (newInputPosition >= newInput.length) {
                                    newInput.push(null);
                                }
                                nextStates.push(new TMachineState(newInput, newInputPosition, edge.to));
                            }
                        }
                    }
                }
                return nextStates;
            };
            /**
             * Returns a string representation of the state
             * @returns {string}
             */
            TMachineState.prototype.toString = function () {
                return '(' + this.input + ', ' + this.inputPosition + ', ' + this.node.toString() + ')';
            };
            return TMachineState;
        })();
        Machine.TMachineState = TMachineState;
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
             * Rounds this point to the nearest pixel
             */
            MPoint.prototype.round = function (precision) {
                if (!precision) {
                    precision = 1;
                }
                this.x = Math.round(this.x / precision) * precision;
                this.y = Math.round(this.y / precision) * precision;
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
            function CharacterTransition(character, pending) {
                /**
                 * Whether or not this transition is pending editing
                 */
                this.pending = false;
                if (pending !== null) {
                    this.pending = pending;
                }
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
                return !this.pending ? this.character : jsflap.UNKNOWN;
            };
            /**
             * Determines if the input matches this transition
             * @param input
             * @returns {boolean}
             */
            CharacterTransition.prototype.canFollowOn = function (input) {
                if (this.pending) {
                    return false;
                }
                return this.character === jsflap.LAMBDA ? true : (input.charAt(0) === this.character);
            };
            CharacterTransition.prototype.getTransitionParts = function () {
                return [
                    new Transition.EditableTransitionPart(this.character, function (newContent, transition) { return transition.character = newContent; })
                ];
            };
            CharacterTransition.prototype.clone = function () {
                return new CharacterTransition(this.character, this.pending);
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
         * An editable transition part
         */
        var EditableTransitionPart = (function () {
            function EditableTransitionPart(content, onEdit) {
                this.content = content;
                this.onEdit = onEdit;
            }
            return EditableTransitionPart;
        })();
        Transition.EditableTransitionPart = EditableTransitionPart;
    })(Transition = jsflap.Transition || (jsflap.Transition = {}));
})(jsflap || (jsflap = {}));





var jsflap;
(function (jsflap) {
    var Transition;
    (function (Transition) {
        /**
         * A non-editable transition part
         */
        var StaticTransitionPart = (function () {
            function StaticTransitionPart(content) {
                this.content = content;
            }
            return StaticTransitionPart;
        })();
        Transition.StaticTransitionPart = StaticTransitionPart;
    })(Transition = jsflap.Transition || (jsflap.Transition = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Transition;
    (function (Transition) {
        (function (TuringTransitionDirection) {
            TuringTransitionDirection[TuringTransitionDirection["LEFT"] = -1] = "LEFT";
            TuringTransitionDirection[TuringTransitionDirection["RIGHT"] = 1] = "RIGHT";
        })(Transition.TuringTransitionDirection || (Transition.TuringTransitionDirection = {}));
        var TuringTransitionDirection = Transition.TuringTransitionDirection;
        /**
         * A Transition of a single character in an NFA
         */
        var TuringTransition = (function () {
            /**
             * Creates a new single char transition
             * @param character
             */
            function TuringTransition(read, write, direction, pending) {
                /**
                 * Whether or not this transition is pending editing
                 */
                this.pending = false;
                if (pending !== null) {
                    this.pending = pending;
                }
                if (read.length > 1 || write.length > 1) {
                    throw new Error("Turing Transition read and write length must be less than or equal to 1");
                }
                else {
                    this.read = read;
                    this.write = write;
                    this.direction = direction;
                }
            }
            TuringTransition.prototype.getDirectionString = function () {
                switch (this.direction) {
                    case -1 /* LEFT */:
                        return 'L';
                    case 1 /* RIGHT */:
                        return 'R';
                    default:
                        return 'S';
                }
            };
            TuringTransition.prototype.setDirectionFromString = function (directionString) {
                switch (directionString) {
                    case 'L':
                    case 'l':
                        this.direction = -1 /* LEFT */;
                        break;
                    case 'R':
                    case 'r':
                        this.direction = 1 /* RIGHT */;
                        break;
                    default:
                        this.direction = null;
                }
            };
            /**
             * Gets the string representation of the transition
             * @returns {string}
             */
            TuringTransition.prototype.toString = function () {
                if (this.pending) {
                    return jsflap.UNKNOWN;
                }
                return this.read + '/' + this.write + '; ' + this.getDirectionString();
            };
            /**
             * Determines if the input matches this transition
             * @param input
             * @returns {boolean}
             */
            TuringTransition.prototype.canFollowOn = function (input) {
                if (this.pending) {
                    return false;
                }
                if (this.read === jsflap.BLANK || this.read === null || this.read === '') {
                    return input === jsflap.BLANK || input === null || input === '';
                }
                else {
                    return input === this.read;
                }
            };
            TuringTransition.prototype.getTransitionParts = function () {
                return [
                    new Transition.EditableTransitionPart(this.read, function (newContent, transition) { return transition.read = newContent; }),
                    new Transition.StaticTransitionPart("/"),
                    new Transition.EditableTransitionPart(this.write, function (newContent, transition) { return transition.write = newContent; }),
                    new Transition.StaticTransitionPart(";"),
                    new Transition.EditableTransitionPart(this.getDirectionString(), function (newContent, transition) { return transition.setDirectionFromString(newContent); })
                ];
            };
            TuringTransition.prototype.clone = function () {
                return new TuringTransition(this.read, this.write, this.direction);
            };
            return TuringTransition;
        })();
        Transition.TuringTransition = TuringTransition;
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
             * @param index
             */
            EdgeVisualization.prototype.addEdgeModel = function (edge, index) {
                if (!this.fromModel || !this.toModel) {
                    this.fromModel = edge.from;
                    this.toModel = edge.to;
                    edge.setVisualization(this, typeof index === 'number' ? index : this.models.items.length);
                    return this.models.add(edge, index);
                }
                else if (edge.from === this.fromModel && edge.to === this.toModel) {
                    edge.setVisualization(this, typeof index === 'number' ? index : this.models.items.length);
                    return this.models.add(edge);
                }
                else {
                    return null;
                }
            };
            /**
             * Reindexs the visualization numbers of the edges
             */
            EdgeVisualization.prototype.reindexEdgeModels = function () {
                this.models.items.forEach(function (edge, index) {
                    edge.visualizationNumber = index;
                });
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
            EdgeVisualization.prototype.setControlDirectly = function (point) {
                this._control = point;
            };
            EdgeVisualization.prototype.setHasMovedControlPointDirectly = function (val) {
                this._hasMovedControlPoint = val;
            };
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
        /**
         * Represents an editable text node in an SVG
         * Adapted from http://bl.ocks.org/GerHobbelt/2653660
         */
        var EditableTextNode = (function () {
            function EditableTextNode(board, textNode) {
                this.maxLength = 1;
                this.onComplete = function () {
                };
                this.padding = 3;
                this.offset = [3, 6];
                this.backgroundColor = "#EEE";
                this.board = board;
                this.textNode = textNode;
            }
            /**
             * Shows an error on the input for 1.5 seconds
             */
            EditableTextNode.prototype.showError = function (inp) {
                inp.style('color', "#C3272B");
                setTimeout(function () {
                    inp.style('color', "inherit");
                }, 1500);
            };
            /**
             * Renders the editable text box on the screen and sets up listeners
             */
            EditableTextNode.prototype.render = function () {
                //window.a = this.textNode;
                //this.textNode.setAttribute("fill", "red");
                // Setup params
                var position = this.textNode.getClientRects()[0];
                var bbox = this.textNode.getBBox();
                var boundingClientRect = this.textNode.getBoundingClientRect();
                var el = d3.select(this.textNode);
                var containerElm = document.createElement("div");
                this.board.getContainer().appendChild(containerElm);
                var container = d3.select(containerElm);
                var self = this;
                // Initalize styles
                var fontSize = this.textNode.style.fontSize;
                var fontWeight = this.textNode.style.fontWeight;
                var lineHeight = this.textNode.style.lineHeight;
                var width = (position.width + (2 * this.padding));
                // Force a minimum width of 20
                if (width < 20) {
                    width = 20;
                }
                var height = bbox.height + (2 * this.padding);
                var x = position.left - this.padding + this.offset[0], y = position.top - this.padding - 45 + this.offset[1];
                // 45 is the top padding the 'position: absolute' is off by and the offset is use for line-height issues
                //x = boundingClientRect.left - this.padding;
                //y = boundingClientRect.top - this.padding - 45; 
                var textContainer = this.textNode.parentNode;
                var angle = 0;
                if (textContainer.transform.baseVal.length > 0 && textContainer.transform.baseVal[0].angle != null) {
                    angle = textContainer.transform.baseVal[0].angle;
                    // Adjust the offsets based on the angle from 0
                    var xOffsetAdjust = this.offset[0] * Math.sin((angle * Math.PI) / 180);
                    var yOffsetAdjust = this.offset[1] * Math.sin((angle * Math.PI) / 180);
                    x += xOffsetAdjust;
                    y += yOffsetAdjust;
                }
                //transform:rotate("+ angle +"deg);
                var styleString = "transform:rotate(" + angle + "deg); width: " + width + "px; height: " + height + "; text-align: center; border: none; padding: " + this.padding + "px; outline: none; background-color: #fff; border-radius: 3px; font-size:" + fontSize + "; font-weight:" + fontWeight + "; line-height:" + lineHeight + "; position: absolute; left:" + x + "px; top: " + y + "px;";
                var inp = container.append("form").append("input").attr("value", function () {
                    self.inputField = this;
                    setTimeout(function () {
                        self.inputField.focus();
                        self.inputField.select();
                    }, 5);
                    self.board.state.editableTextInputField = this;
                    return self.value;
                }).attr("style", styleString).attr("maxlength", this.maxLength);
                inp.transition().style('background-color', this.backgroundColor);
                var completed = false;
                inp.on("blur", function (event) {
                    self.value = this.value;
                    if (!completed)
                        self.onComplete(false);
                    completed = true;
                    //debugger;
                    // TODO: Look into why the forigen object is removed here but not in the keyup function
                    container.remove();
                    self.board.state.editableTextInputField = null;
                }).on("keydown", function () {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        e.preventDefault();
                    }
                }).on("keyup", function () {
                    var e = d3.event;
                    switch (e.keyCode) {
                        case 16:
                        case 17:
                        case 91:
                        case 93:
                        case 224:
                            return;
                        default:
                    }
                    // Enter/ Escape/ reached end of field
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length === self.maxLength) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        //inp.on("blur", null);
                        // Set the object's model from the dom object's one.
                        self.value = this.value;
                        if (completed || self.onComplete(true)) {
                            completed = true;
                            // Leave the field up if the completion was invalid
                            this.remove();
                            self.board.state.editableTextInputField = null;
                        }
                        else {
                            // TODO: Show more error feedback
                            self.showError(inp);
                        }
                    }
                });
            };
            return EditableTextNode;
        })();
        Visualization.EditableTextNode = EditableTextNode;
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
                this.model.toEdges.items.forEach(callBackFn);
                this.model.fromEdges.items.forEach(callBackFn);
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
                this.shouldAutoUpdateOnModify = true;
                this.shouldForceUpdateAnimation = false;
                this.shouldForceStandardAnimation = false;
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
                        callback: function () { return _this.board.setInitialNode(null, true); }
                    };
                }
                else {
                    initialOption = {
                        display: 'Make Initial',
                        callback: function () { return _this.board.setInitialNode(node, true); }
                    };
                }
                if (node.model.final) {
                    finalOption = {
                        display: 'Remove Final',
                        callback: function () { return _this.board.unmarkFinalNode(node, true); }
                    };
                }
                else {
                    finalOption = {
                        display: 'Make Final',
                        callback: function () { return _this.board.markFinalNode(node, true); }
                    };
                }
                this.state.contextMenuOptions = [finalOption, initialOption];
            };
            /**
             * Updates the visualizations
             */
            VisualizationCollection.prototype.update = function () {
                var _this = this;
                var shouldAnimateMovement = !this.state.shiftKeyPressed && this.state.mode === 1 /* MOVE */ || this.shouldForceUpdateAnimation;
                var nodesGroup = this.svg.select('g.nodes'), edgesGroup = this.svg.select('g.edges'), transitionsGroup = this.svg.select('g.transitions'), controlPointsGroup = this.svg.select('g.control-points');
                var nodes = nodesGroup.selectAll("circle.node").data(this.nodes, function (node) { return node.model.toString(); });
                nodes.attr("r", function (d) { return d.radius; });
                var newNodes = nodes.enter().append("circle").classed('node', true).attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; }).attr("r", function (d) { return d.radius - 10; }).attr('opacity', 0);
                newNodes.on('contextmenu', function (node) { return _this.nodeContextMenu(node); });
                newNodes.transition().ease("elastic").duration(300).attr("r", function (d) { return d.radius; }).attr('opacity', 1);
                var nodesMovement = shouldAnimateMovement ? nodes.transition().ease('cubic-out').duration(50) : nodes;
                nodesMovement.attr("cx", function (d) { return d.position.x; }).attr("cy", function (d) { return d.position.y; });
                nodes.exit().transition().attr('opacity', 0).attr("r", function (d) { return d.radius - 10; }).remove();
                var nodeLabels = nodesGroup.selectAll("text.nodeLabel").data(this.nodes, function (node) { return node.model; });
                var newNodeLabels = nodeLabels.enter().append('text').classed('nodeLabel', true).attr('text-anchor', 'middle').text(function (d) { return d.model.label; }).attr('opacity', 0);
                newNodeLabels.on('contextmenu', function (node) { return _this.nodeContextMenu(node); });
                newNodeLabels.on("mouseup", function (node) {
                    var event = d3.event; // Cast to any to allow which access below
                    //alert(event.which)
                    // Only respond to left clicks
                    if (event.which != 1) {
                        return;
                    }
                    if (_this.state.mode === 0 /* DRAW */ && !_this.state.futureEdgeFromValid && !_this.state.futureEdgeFromCreated) {
                        // Clicked just on the node and did not drag
                        var etn = new Visualization.EditableTextNode(_this.board, d3.event.target);
                        etn.value = node.model.label;
                        etn.maxLength = 3;
                        etn.padding = 4;
                        etn.offset = [1, 1];
                        etn.onComplete = function () {
                            if (node.model.label !== etn.value) {
                                if (etn.value === "" || etn.value === " " || etn.value === "  " || etn.value === "   ") {
                                    return false;
                                }
                                var matchingNodes = _this.nodes.filter(function (node) {
                                    return node.model.label === etn.value;
                                });
                                if (matchingNodes.length === 0) {
                                    _this.board.invocationStack.trackExecution(new jsflap.Board.Command.RelabelNodeCommand(_this.board, node.model, etn.value));
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                            return true;
                        };
                        etn.render();
                    }
                });
                newNodeLabels.transition().delay(100).duration(300).attr('opacity', 1);
                nodeLabels.text(function (d) { return d.model.label; });
                var nodeLabelsMovement = shouldAnimateMovement ? nodeLabels.transition().ease('cubic-out').duration(50) : nodeLabels;
                nodeLabelsMovement.attr("x", function (d) { return d.position.x; }).attr("y", function (d) { return d.position.y + 5; });
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
                newFinalNodes.on('contextmenu', function (node) { return _this.nodeContextMenu(node); });
                newFinalNodes.transition().attr('opacity', 1).attr("r", function (d) { return d.radius - 3; });
                finalNodes.exit().attr('opacity', 1).transition().attr('opacity', 0).attr("r", function (d) { return d.radius + 10; }).remove();
                var edgeKeyFn = function (edge) { return edge.models.items.map(function (edge) { return edge.toString(); }).join(','); };
                var edgePaths = edgesGroup.selectAll("path.edge").data(this.edges, edgeKeyFn);
                if (shouldAnimateMovement && !this.shouldForceStandardAnimation) {
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
                var edgeTransitionGroup = transitionsGroup.selectAll('g.edgeTransitions').data(this.edges, edgeKeyFn);
                edgeTransitionGroup.enter().append('g').classed('edgeTransitions', true);
                edgeTransitionGroup.exit().transition().attr('opacity', 0).remove();
                var edgeTransitions = edgeTransitionGroup.selectAll('text.transition').data(function (edge) { return edge.models.items; }, function (edge) { return edge.toString(); });
                var newEdgeTransitions = edgeTransitions.enter().append('text').classed('transition', true).attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                var edgeTransitionParts = edgeTransitions.selectAll('tspan.transitionPart').data(function (d) { return d.transition.getTransitionParts(); });
                edgeTransitionParts.enter().append('tspan').classed('transitionPart', true);
                edgeTransitionParts.text(function (d) {
                    var value = d.content;
                    if (value === " ") {
                        return String.fromCharCode(0x2423); // UTF-8 Open Box
                    }
                    else if (value === "") {
                        return String.fromCharCode(0x25a1); // UTF-8 White Square
                    }
                    else {
                        return value;
                    }
                });
                var edgeTransitionsMovement;
                if (shouldAnimateMovement && !this.shouldForceStandardAnimation) {
                    edgeTransitionsMovement = edgeTransitions.transition().ease('cubic-out').duration(50);
                }
                else if (this.state.draggingNode === null && this.state.isDraggingBoard === false) {
                    edgeTransitionsMovement = edgeTransitions.transition().ease('elastic').duration(500);
                }
                else {
                    edgeTransitionsMovement = edgeTransitions;
                }
                edgeTransitionsMovement.attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                if (this.board.settings.transitionStyle == 1 /* PERPENDICULAR */) {
                    edgeTransitions.attr("transform", function (d) {
                        // TODO: Minimize the expensiveness of calling this 3 times per point!
                        var transitionPoint = d.visualization.getTransitionPoint(d.visualizationNumber);
                        var angle = (d.to.visualization.position.getAngleTo(d.from.visualization.position) * (180 / Math.PI));
                        if (angle < -90 || angle >= 90) {
                            angle += 180;
                        }
                        return "rotate(" + angle + " " + transitionPoint.x + ", " + transitionPoint.y + ")";
                    });
                }
                else {
                    edgeTransitionsMovement.attr("transform", "");
                }
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
                        var model = d3.select(d3.event.target).data()[0];
                        if (model instanceof jsflap.Transition.EditableTransitionPart) {
                            _this.editTransition(d, null, true, true);
                        }
                    }
                }).on('mouseover', function (edge) {
                    _this.state.hoveringTransition = edge;
                }).on('mouseout', function (edge) {
                    _this.state.hoveringTransition = null;
                });
                controlPointsGroup.style('display', this.state.mode === 1 /* MOVE */ ? 'block' : '').transition().duration(200).attr("opacity", this.state.mode === 1 /* MOVE */ ? 1 : 0).each('end', function () {
                    controlPointsGroup.style('display', _this.state.mode !== 1 /* MOVE */ ? 'none' : '');
                });
                var edgePathControlPoints = controlPointsGroup.selectAll("circle.control").data(this.edges);
                edgePathControlPoints.enter().append('circle').classed('control', true).attr('r', 10).on('mousedown', function (edge) {
                    if (_this.state.mode === 1 /* MOVE */) {
                        _this.state.modifyEdgeControl = edge;
                        _this.state.draggingCommand = new jsflap.Board.Command.MoveEdgeControlCommand(_this.board, edge);
                    }
                }).on('dblclick', function (edge) {
                    if (_this.state.mode === 1 /* MOVE */) {
                        edge.resetControlPoint();
                        edge.recalculatePath();
                        edgeTransitions.attr('x', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).x; }).attr('y', function (d) { return d.visualization.getTransitionPoint(d.visualizationNumber).y; });
                        _this.shouldForceStandardAnimation = true;
                        _this.update();
                        _this.shouldForceStandardAnimation = false;
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
                // newEdgeTransitions
                //     .attr('opacity', 0)
                //     .transition()
                //     .duration(300)
                //     .attr('opacity', 1);
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
                if (this.shouldAutoUpdateOnModify) {
                    this.update();
                }
                return node;
            };
            /**
             * Adds an edge to the visualization collection
             * @param edge
             */
            VisualizationCollection.prototype.addEdge = function (edge) {
                this.edges.push(edge);
                if (this.shouldAutoUpdateOnModify) {
                    this.update();
                }
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
                if (this.shouldAutoUpdateOnModify) {
                    this.update();
                }
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
                if (this.shouldAutoUpdateOnModify) {
                    this.update();
                }
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
             * Gets a node visualization by its label
             * @param label
             * @returns {*}
             */
            VisualizationCollection.prototype.getNodeVisualizationByLabel = function (label) {
                var query = this.nodes.filter(function (nodeV) {
                    return nodeV.model.label === label;
                });
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
             * @param trackHistory
             */
            VisualizationCollection.prototype.editTransition = function (edge, node, trackHistory, onlyCurrentPart) {
                var _this = this;
                var previousTransition = edge.transition;
                var target;
                // TODO: Generalize this transition editing
                if (node === null) {
                    target = d3.event.target;
                }
                else {
                    target = node;
                }
                var transitionPart = d3.select(target).data()[0];
                var value = transitionPart.content;
                value = value !== this.board.graph.getEmptyTransitionCharacter() ? value : '';
                var etn = new Visualization.EditableTextNode(this.board, target);
                etn.value = value;
                etn.maxLength = 1;
                etn.onComplete = function (wasNormalCompletion) {
                    if (_this.state.editableTextInputField !== etn.inputField) {
                        // The user was no longer editing the transition, don't do anything
                        return true;
                    }
                    var transition = previousTransition.clone();
                    var newValue = etn.inputField.value || _this.board.graph.getEmptyTransitionCharacter();
                    transitionPart.onEdit(newValue, transition);
                    var previousPending = transition.pending;
                    transition.pending = false;
                    var similarTransitions = edge.visualization.models.items.length > 1 ? edge.visualization.models.items.filter(function (otherEdge) { return (otherEdge.hashCode() != edge.hashCode() && (otherEdge.transition.toString() === transition.toString())); }) : [];
                    transition.pending = previousPending;
                    if (similarTransitions.length == 0) {
                        var cmd = new jsflap.Board.Command.EditEdgeTransitionCommand(_this.board, edge, transition, previousTransition);
                        if (onlyCurrentPart) {
                            transition.pending = false;
                            previousTransition.pending = false;
                            if (trackHistory) {
                                _this.board.invocationStack.trackExecution(cmd);
                            }
                            else {
                                cmd.execute();
                            }
                        }
                        else {
                            if (!trackHistory) {
                                transition.pending = false;
                                previousTransition.pending = false;
                                cmd.execute();
                            }
                            if (wasNormalCompletion) {
                                var newTarget = target.nextSibling;
                                while (newTarget !== null && d3.select(newTarget).data()[0] instanceof jsflap.Transition.StaticTransitionPart) {
                                    newTarget = newTarget.nextSibling;
                                }
                                if (newTarget !== null && d3.select(newTarget).data()[0] instanceof jsflap.Transition.EditableTransitionPart) {
                                    setTimeout(function () { return _this.editTransition(edge, newTarget, trackHistory, false); }, 10);
                                }
                                else if (trackHistory) {
                                    transition.pending = false;
                                    previousTransition.pending = false;
                                    _this.board.invocationStack.trackExecution(cmd);
                                }
                            }
                            else if (trackHistory) {
                                transition.pending = false;
                                previousTransition.pending = false;
                                _this.board.invocationStack.trackExecution(cmd);
                            }
                        }
                    }
                    else {
                        // _this.editTransition(edge, target, !!trackHistory);
                        return false;
                    }
                    return true;
                };
                etn.render();
            };
            return VisualizationCollection;
        })();
        Visualization.VisualizationCollection = VisualizationCollection;
    })(Visualization = jsflap.Visualization || (jsflap.Visualization = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Utils;
    (function (Utils) {
        /**
         * ADAPTED FROM:
         * Fast UUID generator, RFC4122 version 4 compliant.
         * @author Jeff Ward (jcward.com).
         * @license MIT license
         * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
         **/
        var lut = [];
        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }
        function getUUID() {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        }
        Utils.getUUID = getUUID;
    })(Utils = jsflap.Utils || (jsflap.Utils = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var AbstractCommand = (function () {
                function AbstractCommand(board) {
                    this.board = board;
                }
                /* abstract */ AbstractCommand.prototype.execute = function () {
                };
                /* abstract */ AbstractCommand.prototype.undo = function () {
                };
                return AbstractCommand;
            })();
            Command.AbstractCommand = AbstractCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var NodeV = jsflap.Visualization.NodeVisualization;
            var AddEdgeFromNodeCommand = (function () {
                function AddEdgeFromNodeCommand(board, startNodeV, endingPoint) {
                    this.firstTime = true;
                    this.board = board;
                    this.graph = board.graph;
                    this.startNodeV = startNodeV;
                    var nearestNode = board.visualizations.getNearestNode(endingPoint);
                    if (nearestNode.node && nearestNode.distance < 40) {
                        this.endNodeV = nearestNode.node;
                        this.endNode = nearestNode.node.model;
                        this.neededToCreateNode = false;
                    }
                    else {
                        this.endNode = new jsflap.Node(board.getNextNodeLabel());
                        this.endNodeV = new NodeV(this.endNode, endingPoint.getMPoint());
                        this.neededToCreateNode = true;
                    }
                }
                AddEdgeFromNodeCommand.prototype.execute = function () {
                    if (this.neededToCreateNode) {
                        this.graph.addNode(this.endNode);
                        this.board.visualizations.addNode(this.endNodeV);
                    }
                    //if(!this.edgeV) {
                    this.edgeV = this.board.addEdge(this.edgeV, this.startNodeV, this.endNodeV, this.edge ? this.edge.transition : null, null, true);
                    this.firstTime = false;
                    //} else {
                    //    this.board.addEdgeVisualization(this.edgeV);
                    //    this.board.handleOppositeEdgeExpanding(this.edgeV);
                    //}
                    if (!this.edgeIndex) {
                        this.edgeIndex = this.edgeV.models.items.length - 1;
                        this.edge = this.edgeV.models.items[this.edgeIndex];
                    }
                };
                AddEdgeFromNodeCommand.prototype.undo = function () {
                    this.board.removeEdgeTransistion(this.edgeV, this.edge);
                    if (this.neededToCreateNode) {
                        this.board.removeNodeAndSaveSettings(this.endNodeV);
                    }
                };
                AddEdgeFromNodeCommand.prototype.getEndNodeV = function () {
                    return this.endNodeV;
                };
                AddEdgeFromNodeCommand.prototype.getEdge = function () {
                    return this.edge;
                };
                return AddEdgeFromNodeCommand;
            })();
            Command.AddEdgeFromNodeCommand = AddEdgeFromNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var NodeV = jsflap.Visualization.NodeVisualization;
            var AddNodeAtPointCommand = (function () {
                function AddNodeAtPointCommand(board, point) {
                    this.board = board;
                    this.graph = board.graph;
                    this.point = point;
                    this.node = new jsflap.Node(board.getNextNodeLabel());
                    if (board.visualizations.nodes.length === 0) {
                        this.node.initial = true;
                    }
                    this.nodeV = new NodeV(this.node, this.point.getMPoint());
                }
                AddNodeAtPointCommand.prototype.execute = function () {
                    this.graph.addNode(this.node);
                    this.board.visualizations.addNode(this.nodeV);
                };
                AddNodeAtPointCommand.prototype.undo = function () {
                    this.graph.removeNode(this.node);
                    this.board.visualizations.removeNode(this.nodeV);
                };
                AddNodeAtPointCommand.prototype.getNodeV = function () {
                    return this.nodeV;
                };
                AddNodeAtPointCommand.prototype.getNode = function () {
                    return this.node;
                };
                return AddNodeAtPointCommand;
            })();
            Command.AddNodeAtPointCommand = AddNodeAtPointCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var EditEdgeTransitionCommand = (function () {
                function EditEdgeTransitionCommand(board, edge, transitionTo, transitionFrom) {
                    this.board = board;
                    this.graph = board.graph;
                    this.edge = edge;
                    this.transitionTo = transitionTo;
                    this.transitionFrom = transitionFrom;
                }
                EditEdgeTransitionCommand.prototype.execute = function () {
                    var _this = this;
                    var results = this.edge.visualization.models.items.filter(function (edge) { return edge.transition === _this.transitionFrom; });
                    results[0].transition = this.transitionTo;
                    this.board.state.editableTextInputField = null;
                    this.board.visualizations.update();
                    if (typeof this.board.onBoardUpdateFn === 'function') {
                        this.board.onBoardUpdateFn();
                    }
                };
                EditEdgeTransitionCommand.prototype.undo = function () {
                    var _this = this;
                    var results = this.edge.visualization.models.items.filter(function (edge) { return edge.transition === _this.transitionTo; });
                    results[0].transition = this.transitionFrom;
                    this.board.state.editableTextInputField = null;
                    this.board.visualizations.update();
                    if (typeof this.board.onBoardUpdateFn === 'function') {
                        this.board.onBoardUpdateFn();
                    }
                };
                return EditEdgeTransitionCommand;
            })();
            Command.EditEdgeTransitionCommand = EditEdgeTransitionCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var EraseEdgeCommand = (function () {
                function EraseEdgeCommand(board, edgeV) {
                    this.board = board;
                    this.graph = board.graph;
                    this.edgeV = edgeV;
                }
                EraseEdgeCommand.prototype.execute = function () {
                    //this.edgeModels = this.edgeV.models.items.slice(0);
                    this.board.removeEdge(this.edgeV);
                };
                EraseEdgeCommand.prototype.undo = function () {
                    var _this = this;
                    var from = this.edgeV.fromModel, to = this.edgeV.toModel;
                    this.edgeV.models.items.forEach(function (edge) {
                        _this.graph.addEdge(edge);
                        edge.addNodes();
                        //this.edgeV.addEdgeModel(edge);
                    });
                    this.edgeV.reindexEdgeModels();
                    this.board.handleOppositeEdgeExpanding(this.edgeV);
                    this.board.visualizations.addEdge(this.edgeV);
                    this.edgeV.toModel = to;
                    this.edgeV.fromModel = from;
                };
                return EraseEdgeCommand;
            })();
            Command.EraseEdgeCommand = EraseEdgeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var EraseEdgeTransitionCommand = (function () {
                function EraseEdgeTransitionCommand(board, edge) {
                    this.board = board;
                    this.graph = board.graph;
                    this.edge = edge;
                }
                EraseEdgeTransitionCommand.prototype.execute = function () {
                    this.edgeV = this.edge.visualization;
                    this.edgeT = this.edge.transition;
                    this.fromNodeV = this.edgeV.fromModel.visualization;
                    this.toNodeV = this.edgeV.toModel.visualization;
                    this.edgeIndex = this.edgeV.models.items.indexOf(this.edge);
                    this.board.removeEdgeTransistion(this.edge.visualization, this.edge);
                };
                EraseEdgeTransitionCommand.prototype.undo = function () {
                    this.edgeV = this.edge.visualization;
                    this.edgeT = this.edge.transition;
                    this.fromNodeV = this.edgeV.fromModel.visualization;
                    this.toNodeV = this.edgeV.toModel.visualization;
                    this.edgeIndex = this.edgeV.models.items.indexOf(this.edge);
                    this.board.addEdge(this.edgeV, this.fromNodeV, this.toNodeV, this.edgeT, this.edgeIndex);
                };
                return EraseEdgeTransitionCommand;
            })();
            Command.EraseEdgeTransitionCommand = EraseEdgeTransitionCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var EraseNodeCommand = (function () {
                function EraseNodeCommand(board, nodeV) {
                    this.board = board;
                    this.graph = board.graph;
                    this.nodeV = nodeV;
                    this.node = nodeV.model;
                }
                EraseNodeCommand.prototype.execute = function () {
                    this.fromEdges = this.node.fromEdges.items.slice(0);
                    this.toEdges = this.node.toEdges.items.slice(0);
                    this.board.removeNode(this.nodeV);
                };
                EraseNodeCommand.prototype.undo = function () {
                    var _this = this;
                    this.board.visualizations.shouldAutoUpdateOnModify = false;
                    this.graph.addNode(this.node);
                    this.board.visualizations.addNode(this.nodeV);
                    var updateFn = function (edge) {
                        _this.board.addEdge(edge.visualization, edge.from.visualization, edge.to.visualization, edge.transition, edge.visualizationNumber);
                        edge.visualization.reindexEdgeModels();
                    };
                    this.fromEdges.forEach(updateFn);
                    this.toEdges.forEach(updateFn);
                    this.nodeV.model = this.node;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldAutoUpdateOnModify = true;
                };
                EraseNodeCommand.prototype.getNode = function () {
                    return this.node;
                };
                return EraseNodeCommand;
            })();
            Command.EraseNodeCommand = EraseNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));



var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var MarkFinalNodeCommand = (function () {
                function MarkFinalNodeCommand(board, node) {
                    this.board = board;
                    this.graph = board.graph;
                    this.node = node;
                }
                MarkFinalNodeCommand.prototype.execute = function () {
                    this.graph.markFinalNode(this.node);
                    this.board.visualizations.update();
                };
                MarkFinalNodeCommand.prototype.undo = function () {
                    this.graph.unmarkFinalNode(this.node);
                    this.board.visualizations.update();
                };
                return MarkFinalNodeCommand;
            })();
            Command.MarkFinalNodeCommand = MarkFinalNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var MoveBoardCommand = (function () {
                function MoveBoardCommand(board) {
                    this.firstTime = true;
                    this.board = board;
                    this.graph = board.graph;
                    this.nodes = this.board.visualizations.nodes;
                    this.edges = this.board.visualizations.edges;
                    this.nodeStartPositions = this.makeNodeVisualizationPositionStates(this.nodes);
                    this.edgeVisualizationStartPositions = this.makeEdgeVisualizationPositionStates(this.edges);
                }
                MoveBoardCommand.prototype.makeNodeVisualizationPositionStates = function (nodeVisualizations) {
                    var nodeVisualizationPositionStates = [];
                    nodeVisualizations.forEach(function (nodeV) {
                        nodeVisualizationPositionStates.push({
                            visualization: nodeV,
                            position: nodeV.position.getMPoint()
                        });
                    });
                    return nodeVisualizationPositionStates;
                };
                MoveBoardCommand.prototype.applyNodeVisualizationPositionStates = function (nodeVisualizationPositionState) {
                    nodeVisualizationPositionState.forEach(function (eps) {
                        var vis = eps.visualization;
                        vis.position = eps.position.getMPoint();
                    });
                };
                MoveBoardCommand.prototype.makeEdgeVisualizationPositionStates = function (edgeVisualizations) {
                    var edgeVisualizationPositionStates = [];
                    edgeVisualizations.forEach(function (edgeV) {
                        edgeVisualizationPositionStates.push({
                            visualization: edgeV,
                            start: edgeV.start.getMPoint(),
                            end: edgeV.end.getMPoint(),
                            control: edgeV.control.getMPoint()
                        });
                    });
                    return edgeVisualizationPositionStates;
                };
                MoveBoardCommand.prototype.applyEdgeVisualizationPositionStates = function (edgeVisualizationPositionState) {
                    edgeVisualizationPositionState.forEach(function (eps) {
                        var vis = eps.visualization;
                        vis.start = eps.start.getMPoint();
                        vis.end = eps.end.getMPoint();
                        vis.setControlDirectly(eps.control.getMPoint());
                    });
                };
                MoveBoardCommand.prototype.execute = function () {
                    if (this.firstTime) {
                        this.nodeEndPositions = this.makeNodeVisualizationPositionStates(this.nodes);
                        this.edgeVisualizationEndPositions = this.makeEdgeVisualizationPositionStates(this.edges);
                        this.firstTime = false;
                        return;
                    }
                    this.applyNodeVisualizationPositionStates(this.nodeEndPositions);
                    this.applyEdgeVisualizationPositionStates(this.edgeVisualizationEndPositions);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                MoveBoardCommand.prototype.undo = function () {
                    this.applyNodeVisualizationPositionStates(this.nodeStartPositions);
                    this.applyEdgeVisualizationPositionStates(this.edgeVisualizationStartPositions);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                return MoveBoardCommand;
            })();
            Command.MoveBoardCommand = MoveBoardCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var MoveEdgeControlCommand = (function () {
                function MoveEdgeControlCommand(board, edgeV) {
                    this.firstTime = true;
                    this.board = board;
                    this.graph = board.graph;
                    this.edgeV = edgeV;
                    this.edgeVisualizationControlStartPosition = this.makeEdgeVisualizationControlPositionStates(this.edgeV);
                }
                MoveEdgeControlCommand.prototype.makeEdgeVisualizationControlPositionStates = function (edgeV) {
                    return {
                        visualization: edgeV,
                        hasMovedControl: edgeV.hasMovedControlPoint(),
                        control: edgeV.control.getMPoint(),
                        start: edgeV.start.getMPoint(),
                        end: edgeV.end.getMPoint()
                    };
                };
                MoveEdgeControlCommand.prototype.applyEdgeVisualizationControlPositionStates = function (eps) {
                    var vis = eps.visualization;
                    vis.setHasMovedControlPointDirectly(eps.hasMovedControl);
                    vis.start = eps.start.getMPoint();
                    vis.end = eps.end.getMPoint();
                    vis.setControlDirectly(eps.control.getMPoint());
                };
                MoveEdgeControlCommand.prototype.execute = function () {
                    if (this.firstTime) {
                        this.edgeVisualizationControlEndPosition = this.makeEdgeVisualizationControlPositionStates(this.edgeV);
                        this.firstTime = false;
                        return;
                    }
                    this.applyEdgeVisualizationControlPositionStates(this.edgeVisualizationControlEndPosition);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                MoveEdgeControlCommand.prototype.undo = function () {
                    this.applyEdgeVisualizationControlPositionStates(this.edgeVisualizationControlStartPosition);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                return MoveEdgeControlCommand;
            })();
            Command.MoveEdgeControlCommand = MoveEdgeControlCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var MoveNodeCommand = (function () {
                function MoveNodeCommand(board, nodeV) {
                    this.firstTime = true;
                    this.board = board;
                    this.graph = board.graph;
                    this.nodeV = nodeV;
                    this.nodeStartPosition = nodeV.position.getMPoint();
                    this.relatedEdges = this.getRelatedEdges();
                    this.edgeVisualizationStartPositions = this.makeEdgeVisualizationPositionStates(this.relatedEdges);
                }
                MoveNodeCommand.prototype.getRelatedEdges = function () {
                    var _this = this;
                    return this.board.visualizations.edges.filter(function (edgeV) {
                        return edgeV.fromModel.visualization === _this.nodeV || edgeV.toModel.visualization === _this.nodeV;
                    });
                };
                MoveNodeCommand.prototype.makeEdgeVisualizationPositionStates = function (edgeVisualizations) {
                    var edgeVisualizationPositionStates = [];
                    edgeVisualizations.forEach(function (edgeV) {
                        edgeVisualizationPositionStates.push({
                            visualization: edgeV,
                            start: edgeV.start.getMPoint(),
                            end: edgeV.end.getMPoint(),
                            control: edgeV.control.getMPoint()
                        });
                    });
                    return edgeVisualizationPositionStates;
                };
                MoveNodeCommand.prototype.applyEdgeVisualizationPositionStates = function (edgeVisualizationPositionState) {
                    edgeVisualizationPositionState.forEach(function (eps) {
                        var vis = eps.visualization;
                        vis.start = eps.start.getMPoint();
                        vis.end = eps.end.getMPoint();
                        vis.setControlDirectly(eps.control.getMPoint());
                    });
                };
                MoveNodeCommand.prototype.execute = function () {
                    if (this.firstTime) {
                        this.nodeEndPosition = this.nodeV.position.getMPoint();
                        this.edgeVisualizationEndPositions = this.makeEdgeVisualizationPositionStates(this.relatedEdges);
                        this.firstTime = false;
                        return;
                    }
                    this.nodeV.position = this.nodeEndPosition.getMPoint();
                    this.applyEdgeVisualizationPositionStates(this.edgeVisualizationEndPositions);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                MoveNodeCommand.prototype.undo = function () {
                    this.nodeV.position = this.nodeStartPosition.getMPoint();
                    this.applyEdgeVisualizationPositionStates(this.edgeVisualizationStartPositions);
                    this.board.visualizations.shouldForceUpdateAnimation = true;
                    this.board.visualizations.update();
                    this.board.visualizations.shouldForceUpdateAnimation = false;
                };
                return MoveNodeCommand;
            })();
            Command.MoveNodeCommand = MoveNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var ReindexNodeLabelsCommand = (function () {
                function ReindexNodeLabelsCommand(board) {
                    this.board = board;
                    this.graph = board.graph;
                    this.nodes = this.graph.getNodes().items;
                    this.nodeLabelStateStart = this.makeNodeLabelStates(this.nodes);
                }
                ReindexNodeLabelsCommand.prototype.makeNodeLabelStates = function (nodes) {
                    var nodeLabelStates = [];
                    nodes.forEach(function (node) {
                        nodeLabelStates.push({
                            model: node,
                            label: node.label
                        });
                    });
                    return nodeLabelStates;
                };
                ReindexNodeLabelsCommand.prototype.applyNodeLabelStates = function (nodeVisualizationPositionState) {
                    nodeVisualizationPositionState.forEach(function (eps) {
                        eps.model.label = eps.label;
                    });
                };
                ReindexNodeLabelsCommand.prototype.execute = function () {
                    this.nodes.forEach(function (node, index) {
                        node.label = "q" + index;
                    });
                    this.board.visualizations.update();
                };
                ReindexNodeLabelsCommand.prototype.undo = function () {
                    this.applyNodeLabelStates(this.nodeLabelStateStart);
                    this.board.visualizations.update();
                };
                return ReindexNodeLabelsCommand;
            })();
            Command.ReindexNodeLabelsCommand = ReindexNodeLabelsCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var RelabelNodeCommand = (function () {
                function RelabelNodeCommand(board, node, newName) {
                    this.board = board;
                    this.graph = board.graph;
                    this.node = node;
                    this.oldName = node.label;
                    this.newName = newName;
                }
                RelabelNodeCommand.prototype.execute = function () {
                    this.node.label = this.newName;
                    this.board.visualizations.update();
                };
                RelabelNodeCommand.prototype.undo = function () {
                    this.node.label = this.oldName;
                    this.board.visualizations.update();
                };
                return RelabelNodeCommand;
            })();
            Command.RelabelNodeCommand = RelabelNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var SetInitialNodeCommand = (function () {
                function SetInitialNodeCommand(board, setInitialNode) {
                    this.board = board;
                    this.graph = board.graph;
                    this.setInitialNode = setInitialNode;
                    this.prevInitialNode = this.graph.getInitialNode();
                }
                SetInitialNodeCommand.prototype.execute = function () {
                    this.graph.setInitialNode(this.setInitialNode);
                    this.board.visualizations.update();
                };
                SetInitialNodeCommand.prototype.undo = function () {
                    this.graph.setInitialNode(this.prevInitialNode);
                    this.board.visualizations.update();
                };
                return SetInitialNodeCommand;
            })();
            Command.SetInitialNodeCommand = SetInitialNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));

var jsflap;
(function (jsflap) {
    var Board;
    (function (Board) {
        var Command;
        (function (Command) {
            var UnmarkFinalNodeCommand = (function () {
                function UnmarkFinalNodeCommand(board, node) {
                    this.board = board;
                    this.graph = board.graph;
                    this.node = node;
                }
                UnmarkFinalNodeCommand.prototype.execute = function () {
                    this.graph.unmarkFinalNode(this.node);
                    this.board.visualizations.update();
                };
                UnmarkFinalNodeCommand.prototype.undo = function () {
                    this.graph.markFinalNode(this.node);
                    this.board.visualizations.update();
                };
                return UnmarkFinalNodeCommand;
            })();
            Command.UnmarkFinalNodeCommand = UnmarkFinalNodeCommand;
        })(Command = Board.Command || (Board.Command = {}));
    })(Board = jsflap.Board || (jsflap.Board = {}));
})(jsflap || (jsflap = {}));
