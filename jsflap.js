/*global angular: true */
(function(window, angular) {
    "use strict";

    angular.module('jsflap', []);
    angular.module('jsflap')
        .directive('jflapBoard', function() {
            return {
                link: function(scope, elm, attrs) {
                    var svgContainer = d3.select(elm[0]).append("svg")
                        .attr("width", 500)
                        .attr("height", 500)
                        .on('mouseup', function() {
                            svgContainer.on("mousemove", null);
                            var m = d3.event;
                            console.log(m);
                            d3.event.preventDefault();
                            if(m.which > 1) {
                                return false;
                            } else {
                                svgContainer.append("circle")
                                    .attr("cx", m.x)
                                    .attr("cy", m.y)
                                    .attr("r", 20)
                                    .attr('fill', "LightGoldenrodYellow")
                                    .attr('stroke', "#333333");
                            }

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

                    var line;
                    function mousedown() {
                        var m = d3.mouse(this);
                        var c1 = {
                            cx: m[0],
                            cy: m[1],
                            r: 100
                        };

                        var nearestCircle = null;
                        var nearestCircleDistance = 100;
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
                            if(distance < nearestCircleDistance) {
                                nearestCircle = c2;
                            }

                        });

                        var lineStartX = m[0],
                            lineStartY = m[1];
                        if(nearestCircle) {
                            if(lineStartX > nearestCircle.cx) {
                                lineStartX = nearestCircle.cx + nearestCircle.r;
                            } else {
                                lineStartX = nearestCircle.cx - nearestCircle.r;
                            }
                            lineStartY = nearestCircle.cy;
                            //if(lineStartY > nearestCircle.cy) {
                            //    lineStartY = nearestCircle.cy + nearestCircle.r;
                            //} else {
                            //    lineStartY = nearestCircle.cy - nearestCircle.r;
                            //}
                        }
                        line = svgContainer.append("line")
                            .attr("x1", lineStartX)
                            .attr("y1", lineStartY)
                            .attr("x2", lineStartX)
                            .attr("y2", lineStartY)
                            .attr('stroke', "#333333");

                        svgContainer.on("mousemove", mousemove);
                    }

                    function mousemove() {
                        var m = d3.mouse(this);
                        line.attr("x2", m[0])
                            .attr("y2", m[1]);
                    }
                }
            }
        })
        .controller('AppController', function($scope) {
            $scope.message = 'Welcome to jsflap!';
        });
}(window, window.angular));