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
        public nodes: Array<NodeVisualization>;

        /**
         * The list of edges in the visualization
         */
        public edges: Array<EdgeVisualization>;

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

        public nodeContextMenu(node: NodeVisualization) {
            var event = d3.event;
            var initialOption, finalOption;
            if(node.model.initial) {
                initialOption = {
                    display: 'Remove Initial',
                    callback: () => {
                        this.board.setInitialNode(null, true);
                        this.update();
                    }
                };
            } else {
                initialOption = {
                    display: 'Make Initial',
                    callback: () => {
                        this.board.setInitialNode(node, true);
                        this.update();
                    }
                };
            }

            if(node.model.final) {
                finalOption = {
                    display: 'Remove Final',
                    callback: () => {
                        this.board.unmarkFinalNode(node, true);
                        this.update();
                    }
                };
            } else {
                finalOption = {
                    display: 'Make Final',
                    callback: () => {
                        this.board.markFinalNode(node, true);
                        this.update();
                    }
                };
            }

            this.state.contextMenuOptions = [finalOption, initialOption];
        }

        /**
         * Updates the visualizations
         */
        public update() {
            var shouldAnimateMovement = this.state.shiftKeyPressed && this.state.mode === Board.BoardMode.MOVE;

            var nodesGroup = this.svg.select('g.nodes'),
                edgesGroup = this.svg.select('g.edges'),
                transitionsGroup = this.svg.select('g.transitions'),
                controlPointsGroup = this.svg.select('g.control-points');

            var nodes = nodesGroup.selectAll("circle.node")
                .data(this.nodes, (node: NodeVisualization) => node.model.toString());

            nodes
                .attr("r", (d: NodeVisualization) => d.radius);

            var newNodes = nodes.enter()
                .append("circle")
                .classed('node', true)
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y)
                .attr("r", (d: NodeVisualization) => d.radius - 10)
                .attr('opacity', 0);

            newNodes.on('contextmenu', (node: NodeVisualization) => this.nodeContextMenu(node));

            newNodes.transition()
                .ease("elastic")
                .duration(300)
                .attr("r", (d: NodeVisualization) => d.radius)
                .attr('opacity', 1);

            var nodesMovement: any = shouldAnimateMovement? nodes.transition().ease('cubic-out').duration(50): nodes;
            nodesMovement
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y);

            nodes.exit()
                .transition()
                .attr('opacity', 0)
                .attr("r", (d: NodeVisualization) => d.radius - 10)
                .remove();

            var nodeLabels = nodesGroup.selectAll("text.nodeLabel")
                .data(this.nodes, (node: NodeVisualization) => node.model);

            var newNodeLabels = nodeLabels
                .enter()
                .append('text')
                .classed('nodeLabel', true)
                .text((d: NodeVisualization) => d.model.label)
                .attr('opacity', 0);

            newNodeLabels.on('contextmenu', (node: NodeVisualization) => this.nodeContextMenu(node));

            newNodeLabels.transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            nodeLabels
                .text((d: NodeVisualization) => d.model.label);

            var nodeLabelsMovement: any = shouldAnimateMovement? nodeLabels.transition().ease('cubic-out').duration(50): nodeLabels;
            nodeLabelsMovement
                .attr("x", (d: NodeVisualization) => d.position.x - ((d.model.label.length <= 2) ? 11 : 15))
                .attr("y", (d: NodeVisualization) => d.position.y + 5);

            nodeLabels.exit()
                .transition()
                .attr('opacity', 0)
                .remove();

            var initialNodes = nodesGroup.selectAll("path.initialPath")
                .data(this.nodes.filter((node: NodeVisualization) => node.model.initial));

            var newInitialNodes = initialNodes
                .enter()
                .append('path')
                .classed('initialPath', true);

            newInitialNodes
                .attr('opacity', 0)
                .transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            // Only animate the transition if we are not dragging the nodes
            var initialNodesMovement;
            if(this.board.state.mode === Board.BoardMode.DRAW) {
                initialNodesMovement =
                    initialNodes
                        .transition()
                        .attr('opacity', 1);
            } else if(shouldAnimateMovement) {
                initialNodesMovement =
                    initialNodes
                        .transition()
                        .ease('cubic-out')
                        .duration(50)
                        .attr('opacity', 1);
            } else {
                initialNodesMovement = initialNodes;
            }
            initialNodesMovement
                .attr('d', (d: NodeVisualization) => 'M' + (d.position.x - d.radius) + ',' + d.position.y + ' l-20,-20 l0,40 Z');

            initialNodes.exit()
                .attr('opacity', 1)
                .transition()
                .attr('opacity', 0)
                .remove();

            var finalNodes = nodesGroup.selectAll("circle.finalCircle")
                .data(this.nodes.filter((node: NodeVisualization) => node.model.final), (node: NodeVisualization) => node.model);

            finalNodes
                .attr('opacity', 1)
                .classed('finalCircle', true)
                .attr("r", (d: NodeVisualization) => d.radius - 3);

            var finalNodesMovement: any = shouldAnimateMovement? finalNodes.transition().ease('cubic-out').duration(50): finalNodes;
            finalNodesMovement
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y);

            var newFinalNodes = finalNodes
                .enter()
                .append('circle')
                .classed('finalCircle', true)
                .attr("r", (d: NodeVisualization) => d.radius - 10)
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y)
                .attr('opacity', 0);

            newFinalNodes.on('contextmenu', (node: NodeVisualization) => this.nodeContextMenu(node));

            newFinalNodes
                .transition()
                .attr('opacity', 1)
                .attr("r", (d: NodeVisualization) => d.radius - 3);

            finalNodes.exit()
                .attr('opacity', 1)
                .transition()
                .attr('opacity', 0)
                .attr("r", (d: NodeVisualization) => d.radius + 10)
                .remove();

            var edgeKeyFn = (edge: EdgeVisualization) => edge.models.items.map((edge) => edge.toString()).join(',');
            var edgePaths = edgesGroup.selectAll("path.edge")

                // TODO: Make the key function less expensive
                .data(this.edges, edgeKeyFn);

            if(shouldAnimateMovement) {
                edgePaths
                    .transition()
                    .ease('cubic-out')
                    .duration(50)
                    .attr('d', (d: EdgeVisualization) => d.getPath());
            } else if(this.state.draggingNode === null && this.state.isDraggingBoard === false) {
                edgePaths
                    //.filter((edge: EdgeVisualization) => edge.pathMode === EdgeVisualizationPathMode.OPPOSING_A || edge.pathMode === EdgeVisualizationPathMode.OPPOSING_B)
                    .transition()
                    .duration(500)
                    .ease('elastic')
                    .attr('d', (d: EdgeVisualization) => d.getPath());

            } else {
                edgePaths
                    .attr('d', (edge: EdgeVisualization) => edge.getPath());

            }

            var newEdgePaths = edgePaths
                .enter()
                .append('path')
                .classed('edge', true);

            newEdgePaths
                .filter((edge: EdgeVisualization) => edge.pathMode !== EdgeVisualizationPathMode.DEFAULT)
                .attr('d', (edge: EdgeVisualization) => 'M' + edge.start + ' L' + edge.end)
                .attr('opacity', .8)
                .transition()
                .attr('opacity', .8)
                .duration(500)
                .ease('elastic')
                .attr('d', (d: EdgeVisualization) => d.getPath());

            newEdgePaths
                .filter((edge: EdgeVisualization) => edge.pathMode === EdgeVisualizationPathMode.DEFAULT)
                .attr('opacity', .8)
                .transition()
                .duration(300)
                .attr('opacity', .8)
                .attr('d', (d: EdgeVisualization) => d.getPath());


            newEdgePaths.on('mouseover', (edge: EdgeVisualization) => {
                this.state.hoveringEdge = edge;
            }).on('mouseout', (edge: EdgeVisualization) => {
                this.state.hoveringEdge = null;
            });

            newEdgePaths
                .attr('style', "marker-end:url(#markerArrow)");

            edgePaths
                .classed('rightAngle', (edge: EdgeVisualization) => ((Math.abs(edge.start.x - edge.end.x) < .1) && (Math.abs(edge.start.x - edge.control.x) < .1)) ||
                (Math.abs(edge.start.y - edge.end.y) < .1) && (Math.abs(edge.start.y - edge.control.y) < 1));

            edgePaths.exit()
                .transition()
                .attr("opacity", 0)
                .remove();


            controlPointsGroup
                .style('display', this.state.mode === Board.BoardMode.MOVE? 'block': '')
                .transition()
                .duration(200)
                .attr("opacity", this.state.mode === Board.BoardMode.MOVE? 1: 0)
                .each('end', () => {
                    controlPointsGroup.style('display', this.state.mode !== Board.BoardMode.MOVE? 'none': '');
                });

            var edgePathControlPoints = controlPointsGroup.selectAll("circle.control")
                .data(this.edges);

            edgePathControlPoints
                .enter()
                .append('circle')
                .classed('control', true)
                .attr('r', 10)
                .on('mousedown', (edge: EdgeVisualization) => {
                    if(this.state.mode === Board.BoardMode.MOVE) {
                        this.state.modifyEdgeControl = edge;
                    }
                })
                .on('dblclick', (edge: EdgeVisualization) => {
                    if(this.state.mode === Board.BoardMode.MOVE) {
                        edge.resetControlPoint();
                        edge.recalculatePath();
                        edgePaths
                            .transition()
                            .duration(500)
                            .ease('elastic')
                            .attr('d', (d: EdgeVisualization) => d.getPath());

                        edgeTransitions
                            .transition()
                            .duration(500)
                            .ease('elastic')
                            .attr('x', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).x)
                            .attr('y', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).y);

                        edgePathControlPoints
                            .transition()
                            .ease('elastic')
                            .duration(500)
                            .attr('cx', (d: EdgeVisualization) =>  d.control.x)
                            .attr('cy', (d: EdgeVisualization) =>  d.control.y)
                            .each('end', () => {
                                this.update();
                            });

                        //this.update();
                    }
                })
                .on('mouseover', (edge: EdgeVisualization) => {
                    this.state.hoveringEdge = edge;
                }).on('mouseout', (edge: EdgeVisualization) => {
                    this.state.hoveringEdge = null;
                });

            var edgePathControlPointsMovement;
            if(shouldAnimateMovement) {
                edgePathControlPointsMovement = edgePathControlPoints
                    .transition()
                    .ease('cubic-out')
                    .duration(50);
            } else {
                edgePathControlPointsMovement = edgePathControlPoints;
            }
            edgePathControlPointsMovement
                .attr('cx', (d: EdgeVisualization) =>  d.control.x)
                .attr('cy', (d: EdgeVisualization) =>  d.control.y);

            edgePathControlPoints.exit().remove();

            var edgeTransitionGroup = transitionsGroup.selectAll('g.edgeTransitions')
                .data(this.edges, edgeKeyFn);

            edgeTransitionGroup
                .enter()
                .append('g')
                .classed('edgeTransitions', true);

            edgeTransitionGroup
                .exit()
                .transition()
                .attr('opacity', 0)
                .remove();

            var edgeTransitions = edgeTransitionGroup.selectAll('text.transition')
                .data((edge: EdgeVisualization) => edge.models.items, (edge: Edge) => edge.toString());


            var newEdgeTransitions = edgeTransitions
                .enter()
                .append('text')
                .classed('transition', true)
                .attr('x', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).x)
                .attr('y', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).y);

            edgeTransitions
                .text((d: Edge) => d.transition.toString());

            var edgeTransitionsMovement;
            if(shouldAnimateMovement) {
                edgeTransitionsMovement = edgeTransitions
                    .transition()
                    .ease('cubic-out')
                    .duration(50);
            } else if(this.state.draggingNode === null && this.state.isDraggingBoard === false) {
                edgeTransitionsMovement = edgeTransitions
                    .transition()
                    .ease('elastic')
                    .duration(500);
            } else {
                edgeTransitionsMovement = edgeTransitions;
            }
            edgeTransitionsMovement
                .attr('x', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).x)
                .attr('y', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).y);

            edgeTransitions.exit()
                .transition()
                .attr('opacity', 0)
                .remove();

            newEdgeTransitions
                .on('mousedown', (edge: Edge) => {
                    var event = d3.event;
                    if(this.state.mode === Board.BoardMode.DRAW) {
                        event.stopPropagation();
                        event.preventDefault();
                    } else if(this.state.mode === Board.BoardMode.ERASE) {
                        this.state.hoveringTransition = edge;
                    } else {
                        this.state.modifyEdgeControl = edge.visualization;
                    }
                })
                .on("mouseup", (d: Edge) => {
                    if(this.state.modifyEdgeControl) {
                        this.state.modifyEdgeControl = null;
                    } else if(this.state.mode === Board.BoardMode.DRAW) {
                        this.editTransition(d, null, true);
                    }
                })
                .on('mouseover', (edge: Edge) => {
                    this.state.hoveringTransition = edge;
                }).on('mouseout', (edge: Edge) => {
                    this.state.hoveringTransition = null;
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
        public addNode(node: NodeVisualization) {
            this.nodes.push(node);
            this.update();
            return node;
        }

        /**
         * Adds an edge to the visualization collection
         * @param edge
         */
        public addEdge(edge: EdgeVisualization) {
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

        /**
         * Removes an node from the collection
         * @param node
         * @returns {boolean}
         */
        removeNode(node: NodeVisualization): boolean {
            var nodeIndex = this.nodes.indexOf(node);
            if(nodeIndex === -1) {
                return false;
            }
            this.nodes.splice(nodeIndex, 1);
            this.update();
            return true;
        }

        /**
         * Removes an edge from the collection
         * @param edge
         * @returns {boolean}
         */
        removeEdge(edge: EdgeVisualization): boolean {
            var edgeIndex = this.edges.indexOf(edge);
            if(edgeIndex === -1) {
                return false;
            }
            this.edges.splice(edgeIndex, 1);
            this.update();
            return true;
        }

        /**
         * Gets an edge by its fromModel and toModel
         * @param from
         * @param to
         * @returns {*}
         */
        getEdgeVisualizationByNodes(from: Node, to: Node): EdgeVisualization {
            var query = this.edges.filter((edge: EdgeVisualization) => edge.fromModel === from && edge.toModel === to);
            if(query.length > 0) {
                return query[0];
            } else {
                return null;
            }
        }

        /**
         * Gets a node visualization by its label
         * @param label
         * @returns {*}
         */
        getNodeVisualizationByLabel(label: string): NodeVisualization {
            var query = this.nodes.filter((nodeV: Visualization.NodeVisualization) => {
                return nodeV.model.label === label;
            });
            if(query.length > 0) {
                return query[0];
            } else {
                return null;
            }
        }

        /**
         * Opens a new text field for editing a transition
         * @param edge
         * @param node
         * @param trackHistory
         */
        editTransition(edge: Edge, node?: SVGTextElement, trackHistory?: boolean) {
            // Adapted from http://bl.ocks.org/GerHobbelt/2653660

            var _this = this;
            // TODO: Generalize this transition editing
            var target: SVGTextElement = node || <SVGTextElement> d3.event.target;

            // Need to figure out positions better
            var position = target.getBoundingClientRect();
            var bbox = target.getBBox();

            var el = d3.select(target);
            var frm = this.svg.append("foreignObject");

            var previousTransition = <Transition.CharacterTransition> edge.transition;

            el.node();

            function applyTransition(edge, transition) {
                _this.board.updateEdgeTransition(edge, transition);
                _this.svg.select("foreignObject").remove();
                _this.state.modifyEdgeTransition = null;
                _this.update();
                if (typeof _this.board.onBoardUpdateFn === 'function') {
                    _this.board.onBoardUpdateFn();
                }
            }

            function updateTransition() {
                if(_this.state.modifyEdgeTransition !== inp.node()) {

                    // The user was no longer editing the transition, don't do anything
                    return;
                }
                var transition = new Transition.CharacterTransition((<HTMLInputElement> inp.node()).value || LAMBDA);
                var similarTransitions = edge.visualization.models.items.length > 1?
                    edge.visualization.models.items
                        .filter((otherEdge: Edge) => otherEdge.transition.toString() === transition.toString())
                        :[];

                if(similarTransitions.length == 0) {
                    applyTransition(edge, transition);
                    if(trackHistory) {
                        _this.board.undoManager.add({
                            undo: () => {
                                var fromModel = _this.getNodeVisualizationByLabel(edge.from.label).model,
                                    toModel = _this.getNodeVisualizationByLabel(edge.to.label).model,
                                    edgeV = _this.getEdgeVisualizationByNodes(fromModel, toModel),
                                    foundEdges = edgeV.models.items
                                    .filter((otherEdge: Edge) => otherEdge.transition.toString() === transition.toString());
                                if(foundEdges.length === 1) {
                                    applyTransition(foundEdges[0], previousTransition);
                                }
                            },
                            redo: () => {
                                var fromModel = _this.getNodeVisualizationByLabel(edge.from.label).model,
                                    toModel = _this.getNodeVisualizationByLabel(edge.to.label).model,
                                    edgeV = _this.getEdgeVisualizationByNodes(fromModel, toModel),
                                    foundEdges = edgeV.models.items
                                    .filter((otherEdge: Edge) => otherEdge.transition.toString() === previousTransition.toString());
                                if(foundEdges.length === 1) {
                                    applyTransition(foundEdges[0], transition);
                                }
                            }
                        });
                    }
                } else {
                    _this.editTransition(edge, target, !!trackHistory);
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
                    var inputField: HTMLInputElement = this;
                    setTimeout(function() {
                        inputField.focus();
                        inputField.select();
                    }, 5);
                    _this.state.modifyEdgeTransition = this;

                    var value = edge.transition.toString();
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
                .on("keyup", function() {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length > 0) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();

                        updateTransition();
                        //inp.on('blur', null);
                        this.remove();
                    }
                });
        }
    }
}