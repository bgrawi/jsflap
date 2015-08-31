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

            var svgClone;

            $scope.saveToImage = function () {

                var bounds = self.board.getBounds();

                var width = bounds.maxX + 50 - bounds.minX,
                    height = bounds.maxY + 50 - bounds.minY;

                svgClone = self.board.svg[0][0].cloneNode(true);

                svgClone.innerHTML = svgClone.innerHTML.replace(/markerArrow/g, "markerArrow_save")

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
                    context.fillStyle = "#FFFFFF";
                    context.fillRect(0, 0, width, height);

                    context.drawImage(image, 0, 0);

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