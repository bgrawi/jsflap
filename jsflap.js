/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jflapBoard', function() {
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
                            svgContainer.on("mousemove", null);
                            var m = d3.event;
                            var testPoint;
                            d3.event.preventDefault();
                            if(m.which > 1) {
                                return false;
                            } else {
                                var closetCircle = getNearestCircleBy(m.x, m.y, 20);
                                if(!closetCircle) {
                                    nodeCount++;
                                    svgContainer.append("circle")
                                        .attr("cx", m.x)
                                        .attr("cy", m.y)
                                        .attr("r", 20)
                                        .attr('fill', "LightGoldenrodYellow")
                                        .attr('stroke', "#333333")
                                        .attr('opacity', 0)
                                        .transition()
                                        .attr('opacity', 1);

                                    if(nodeCount === 1) {
                                        var lineFunction = d3.svg.line()
                                            .x(function(d) { return d.x + m.x - 20 })
                                            .y(function(d) { return d.y + m.y})
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
                                        cx: m.x,
                                        cy: m.y,
                                        r: 20
                                    };
                                }

                                if(line) {

                                    testPoint = {
                                        x: +line.attr('x1'),
                                        y: +line.attr('y1')
                                    };

                                    var point = getCircleIntersectionPoint(closetCircle, testPoint, true);
                                    line.attr('x2', point.x)
                                        .attr('y2', point.y);
                                }
                            }

                            lineNearestCircle = null;
                            line = null;
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
                    var lineNearestCircle = null;
                    function mousedown() {
                        var m = d3.event;
                        lineNearestCircle = null;
                        var lineStartX = m.x,
                            lineStartY = m.y,
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
                                .attr('stroke', "#333333")
                                .attr('style', "marker-end:url(#markerArrow)");
                        }
                        svgContainer.on("mousemove", mousemove);
                    }

                    function mousemove() {
                        if(line) {
                            var m = d3.mouse(this);
                            line.attr("x2", m[0])
                                .attr("y2", m[1]);

                            if (lineNearestCircle) {
                                var point = getCircleIntersectionPoint(lineNearestCircle, {
                                    x: m[0],
                                    y: m[1]
                                });
                                line.attr("x1", point.x)
                                    .attr("y1", point.y);

                            }
                        }
                    }
                }
            }
        })
        .controller('AppController', function($scope) {
            $scope.message = 'Welcome to jsflap!';
        });
}(window, window.angular));