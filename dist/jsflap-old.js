/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jsflapBoard', function($rootScope) {
            return {
                link: function(scope, elm, attrs) {
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