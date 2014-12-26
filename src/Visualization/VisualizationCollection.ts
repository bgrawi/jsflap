module jsflap.Visualization {

    var initialStatePath = [
        {"x": -20, "y": -20}, {"x": 0, "y": 0},
        {"x": -20, "y": 20}, {"x": -20, "y": -20}
    ];

    /**
     * The information needed to determine the nearest node
     */
    export interface NearestNode {

        /**
         * The node
         */
        node: NodeVisualization;

        /**
         * The distance to the node
         */
        distance: number;

        /**
         * If currently hovering
         */
        hover: boolean;
    }

    export class VisualizationCollection {

        /**
         * The list of nodes in the visualization
         */
        public nodes: Array<Visualization.NodeVisualization>;

        /**
         * The list of edges in the visualization
         */
        public edges: Array<Visualization.EdgeVisualization>;

        /**
         * The svg location of the visualizations
         */
        public svg: D3.Selection;

        /**
         * The state of the current board
         */
        public state: Board.BoardState;

        /**
         * The board
         */
        public board: Board.Board;

        /**
         * Creates a new visualization collection
         * @param svg
         * @param board
         */
        constructor(svg: D3.Selection, board: Board.Board) {
            this.svg = svg;
            this.state = board.state;
            this.board = board;
            this.nodes = [];
            this.edges = [];
            this.update();
        }

        /**
         * Updates the visualizations
         */
        public update() {

            var nodes = this.svg.selectAll("circle.node")
                .data(this.nodes);

            var newNodes = nodes.enter()
                .append("circle")
                .classed('node', true)
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y)
                .attr('fill', "#008cba")
                //.attr('stroke', "#333")
                .attr("r", (d: NodeVisualization) => d.radius - 10)
                .attr('opacity', 0);

            var nodeContextMenu = (node: Visualization.NodeVisualization) => {
                var event = d3.event;
                var initialOption, finalOption;
                if(node.model.initial) {
                    initialOption = {
                        display: 'Remove Initial',
                        callback: () => {
                            this.board.setInitialNode(null);
                            this.update();
                        }
                    };
                } else {
                    initialOption = {
                        display: 'Make Initial',
                        callback: () => {
                            this.board.setInitialNode(node);
                            this.update();
                        }
                    };
                }
                
                if(node.model.final) {
                    finalOption = {
                        display: 'Remove Final',
                        callback: () => {
                            this.board.unmarkFinalNode(node);
                            this.update();
                        }
                    };
                } else {
                    finalOption = {
                        display: 'Make Final',
                        callback: () => {
                            this.board.markFinalNode(node);
                            this.update();
                        }
                    };
                }

                this.state.contextMenuOptions = [finalOption, initialOption];
            };
            newNodes.on('contextmenu', nodeContextMenu);

            newNodes.transition()
                .ease("elastic")
                .duration(300)
                .attr("r", (d: NodeVisualization) => d.radius)
                .attr('opacity', 1);

            nodes
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y);

            nodes.exit().remove();

            var nodeLabels = this.svg.selectAll("text.nodeLabel")
                .data(this.nodes);

            var newNodeLabels = nodeLabels
                .enter()
                .append('text')
                .classed('nodeLabel', true)
                .text((d: NodeVisualization) => d.model.label)
                .attr("x", (d: NodeVisualization) => d.position.x - ((d.model.label.length <= 2) ? 11 : 15))
                .attr("y", (d: NodeVisualization) => d.position.y + 5)
                .attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("fill", "#FFF")
                .attr('opacity', 0);

            newNodeLabels.on('contextmenu', nodeContextMenu);

            newNodeLabels.transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            nodeLabels
                .attr("x", (d: NodeVisualization) => d.position.x - ((d.model.label.length <= 2) ? 11 : 15))
                .attr("y", (d: NodeVisualization) => d.position.y + 5);

            nodeLabels.exit().remove();

            var initialNodes = this.svg.selectAll("path.initialPath")
                .data(this.nodes.filter((node: Visualization.NodeVisualization) => node.model.initial));

            initialNodes
                .transition()
                .attr('d', (d: Visualization.NodeVisualization) => 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z');

            var newInitialNodes = initialNodes
                .enter()
                .append('path')
                .classed('initialPath', true)
                .attr('d', (d: Visualization.NodeVisualization) => 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z')
                .attr('fill', "#333");

            newInitialNodes
                .attr('opacity', 0)
                .transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            initialNodes.exit()
                .attr('opacity', 1)
                .transition()
                .attr('opacity', 0)
                .remove();

            var finalNodes = this.svg.selectAll("circle.finalCircle")
                .data(this.nodes.filter((node: Visualization.NodeVisualization) => node.model.final));

            finalNodes
                .attr("r", (d: NodeVisualization) => d.radius - 3)
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y);

            var newFinalNodes = finalNodes
                .enter()
                .append('circle')
                .classed('finalCircle', true)
                .attr("r", (d: NodeVisualization) => d.radius - 3)
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y)
                .attr('stroke', "#FFF")
                .attr('stroke-width', "1")
                .attr('fill', "none");

            newFinalNodes.on('contextmenu', nodeContextMenu);

            newFinalNodes
                .attr('opacity', 0)
                .transition()
                .attr('opacity', 1);

            finalNodes.exit()
                .attr('opacity', 1)
                .transition()
                .attr('opacity', 0)
                .remove();

            var edgePaths = this.svg.selectAll("path.edge")
                .data(this.edges);

            edgePaths
                .enter()
                .append('path')
                .classed('edge', true)
                .attr('d', (d: EdgeVisualization) => d.getPath())
                .attr('stroke', '#333')
                .attr('stroke-width', '1')
                .attr('opacity', .8)
                .transition()
                .duration(300)
                .attr('opacity', 1)
                .attr('style', "marker-end:url(#markerArrow)");

            edgePaths.exit().remove();

            var edgeTransitions = this.svg.selectAll('text.transition')
                .data(this.edges);

            var newEdgeTransitions = edgeTransitions
                .enter()
                .append('text')
                .classed('transition', true)
                .attr("font-family", "sans-serif")
                .attr("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("fill", "#000")

                // TODO: Optimize this so we don't have to run the Bezier formula twice
                .attr('x', (d: Visualization.EdgeVisualization) =>  d.getTransitionPoint().x)
                .attr('y', (d: Visualization.EdgeVisualization) =>  d.getTransitionPoint().y)
                .text((d: Visualization.EdgeVisualization) => d.model.transition.toString());

            newEdgeTransitions
                .on('mousedown', () => {
                    var event = d3.event;
                    event.stopPropagation();
                    event.preventDefault();
                })
                .on("mouseup", (d) => {
                    this.editTransition(d);
                });

            newEdgeTransitions
                .attr('opacity', 0)
                .transition()
                .duration(300)
                .attr('opacity', 1);

            if(typeof this.board.onBoardUpdateFn === 'function') {
                this.board.onBoardUpdateFn();
            }

        }

        /**
         * Adds a node to the visualization collection
         * @param node
         */
        public addNode(node: Visualization.NodeVisualization) {
            this.nodes.push(node);
            this.update();
            return node;
        }

        /**
         * Adds an edge to the visualization collection
         * @param edge
         */
        public addEdge(edge: Visualization.EdgeVisualization) {
            this.edges.push(edge);
            this.update();
            return edge;
        }

        /**
         * Gets the nearest node from a point
         * @param point
         * @returns {NearestNode}
         */
        getNearestNode(point: Point.IPoint): NearestNode {

            var nearestNode: NearestNode = {
                node: null,
                distance: Infinity,
                hover: false
            };

            this.nodes.forEach((node) => {
                var distance = point.getDistanceTo(node.position);
                if (distance < nearestNode.distance) {
                    nearestNode.node = node;
                    nearestNode.distance = distance;
                    nearestNode.hover = nearestNode.distance <= node.radius;
                }
            });

            return nearestNode;
        }

        editTransition(d: Visualization.EdgeVisualization, node? :SVGTextElement) {
            // Adapted from http://bl.ocks.org/GerHobbelt/2653660

            var _this = this;
            // TODO: Generalize this transition editing
            var target: SVGTextElement = node || <SVGTextElement> d3.event.target;

            // Need to figure out positions better
            var position = target.getBoundingClientRect();
            var bbox = target.getBBox();

            var el = d3.select(target);
            var frm = this.svg.append("foreignObject");

            el.node();

            function updateTransition() {
                (<Transition.CharacterTransition> d.model.transition).character = (<HTMLInputElement> inp.node()).value || LAMBDA;
                el.text(function(d) { return d.model.transition.toString() });
                _this.svg.select("foreignObject").remove();
                _this.state.modifyEdgeTransition = null;
                if(typeof _this.board.onBoardUpdateFn === 'function') {
                    _this.board.onBoardUpdateFn();
                }
            }

            var inp = frm
                .attr("x", position.left - 3)
                .attr("y", bbox.y - 3)
                .attr("width", 30)
                .attr("height", 25)
                .append("xhtml:form")
                .append("input")
                .attr("value", function() {
                    this.focus();
                    _this.state.modifyEdgeTransition = this;

                    var value = d.model.transition.toString();
                    return value !== LAMBDA? value: '';
                })
                .attr("style", "width: 20px; border: none; padding: 3px; outline: none; background-color: #fff; border-radius: 3px")
                .attr("maxlength", "1");

            inp.transition()
            .style('background-color', '#eee');

            inp
                .on("blur", function() {
                    updateTransition();
                    frm.remove();
                })
                .on("keypress", function() {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();

                        updateTransition();
                        this.remove();
                    }
                });
        }
    }
}