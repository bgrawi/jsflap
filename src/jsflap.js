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