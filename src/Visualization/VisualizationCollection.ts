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

        public shouldAutoUpdateOnModify: boolean = true;

        public shouldForceUpdateAnimation: boolean = false;
        
        public shouldForceStandardAnimation: boolean = false;

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
                    callback: () => this.board.setInitialNode(null, true)
                };
            } else {
                initialOption = {
                    display: 'Make Initial',
                    callback: () => this.board.setInitialNode(node, true)
                };
            }

            if(node.model.final) {
                finalOption = {
                    display: 'Remove Final',
                    callback: () => this.board.unmarkFinalNode(node, true)
                };
            } else {
                finalOption = {
                    display: 'Make Final',
                    callback: () => this.board.markFinalNode(node, true)
                };
            }

            this.state.contextMenuOptions = [finalOption, initialOption];
        }

        /**
         * Updates the visualizations
         */
        public update() {
            var shouldAnimateMovement = !this.state.shiftKeyPressed && this.state.mode === Board.BoardMode.MOVE || this.shouldForceUpdateAnimation;

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
                .attr('text-anchor', 'middle')
                .text((d: NodeVisualization) => d.model.label)
                .attr('opacity', 0);

            newNodeLabels.on('contextmenu', (node: NodeVisualization) => this.nodeContextMenu(node));
            
            newNodeLabels.on("mouseup", (node: NodeVisualization) => {
                    var event = <any> d3.event; // Cast to any to allow which access below
                    
                    // Only respond to left clicks
                    if(event.which != 1) {
                        return;
                    }
                    if(this.state.mode === Board.BoardMode.DRAW && !this.state.futureEdgeFromValid && !this.state.futureEdgeFromCreated) {
                        
                        // Clicked just on the node and did not drag
                        var etn = new EditableTextNode(this.board, <SVGTextElement> d3.event.target);
                        etn.value = node.model.label;
                        etn.maxLength = 3;
                        etn.padding = 4;
                        etn.offset = [1, 1];
                        etn.onComplete = () => {
                            if(node.model.label !== etn.value) {
                                if(etn.value === "" || etn.value === " " || etn.value === "  " || etn.value === "   ") {
                                    return false;
                                }
                                var matchingNodes = this.nodes.filter((node: NodeVisualization) => {
                                    return node.model.label === etn.value;
                                });
                                if(matchingNodes.length === 0) {
                                    this.board.invocationStack.trackExecution(new jsflap.Board.Command.RelabelNodeCommand(this.board, node.model, etn.value));
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            return true;
                        };
                        etn.render();
                    }
                })

            newNodeLabels.transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            nodeLabels
                .text((d: NodeVisualization) => d.model.label);

            var nodeLabelsMovement: any = shouldAnimateMovement? nodeLabels.transition().ease('cubic-out').duration(50): nodeLabels;
            nodeLabelsMovement
                .attr("x", (d: NodeVisualization) => d.position.x)
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

            if(shouldAnimateMovement && !this.shouldForceStandardAnimation) {
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

            var edgeTransitionParts = edgeTransitions.selectAll('tspan.transitionPart')
                .data((d: Edge) => d.transition.getTransitionParts());
                
            
            edgeTransitionParts
                .enter()
                .append('tspan')
                .classed('transitionPart', true);
                
            edgeTransitionParts
                .text((d: Transition.ITransitionPart) => {
                        var value = d.content;
                        if(value === " ") {
                            return String.fromCharCode(0x2423); // UTF-8 Open Box
                        } else if(value === "") {
                            return String.fromCharCode(0x25a1); // UTF-8 White Square
                        } else {
                            return value;
                        }
                    });

            var edgeTransitionsMovement;
            if(shouldAnimateMovement && !this.shouldForceStandardAnimation) {
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
                
            if(this.board.settings.transitionStyle == Board.TransitionStyle.PERPENDICULAR) {
                edgeTransitions
                    .attr("transform", function(d: Edge) {
                        // TODO: Minimize the expensiveness of calling this 3 times per point!
                        var transitionPoint = d.visualization.getTransitionPoint(d.visualizationNumber); 
                        var angle = (d.to.visualization.position.getAngleTo(d.from.visualization.position) * (180 / Math.PI));
                        if(angle < -90 || angle >= 90) {
                            angle += 180;
                        }
                        return "rotate("+ angle +" " + transitionPoint.x + ", " + transitionPoint.y + ")"
                });
            } else {
                edgeTransitionsMovement
                    .attr("transform", "");
            }

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
                        var model = d3.select(d3.event.target).data()[0];
                        if(model instanceof Transition.EditableTransitionPart) {
                            this.editTransition(d, null, true, true);
                        }
                    }
                })
                .on('mouseover', (edge: Edge) => {
                    this.state.hoveringTransition = edge;
                }).on('mouseout', (edge: Edge) => {
                    this.state.hoveringTransition = null;
                });
                
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
                        this.state.draggingCommand = new Board.Command.MoveEdgeControlCommand(this.board, edge);
                    }
                })
                .on('dblclick', (edge: EdgeVisualization) => {
                    if(this.state.mode === Board.BoardMode.MOVE) {
                        edge.resetControlPoint();
                        edge.recalculatePath();
                         edgeTransitions
                            .attr('x', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).x)
                            .attr('y', (d: Edge) =>  d.visualization.getTransitionPoint(d.visualizationNumber).y);
                        this.shouldForceStandardAnimation = true;
                        this.update();
                        this.shouldForceStandardAnimation = false;
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

            // newEdgeTransitions
            //     .attr('opacity', 0)
            //     .transition()
            //     .duration(300)
            //     .attr('opacity', 1);

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
            if(this.shouldAutoUpdateOnModify) {
                this.update();
            }
            return node;
        }

        /**
         * Adds an edge to the visualization collection
         * @param edge
         */
        public addEdge(edge: EdgeVisualization) {
            this.edges.push(edge);
            if(this.shouldAutoUpdateOnModify) {
                this.update();
            }
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

            if(this.shouldAutoUpdateOnModify) {
                this.update();
            }
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
            if(this.shouldAutoUpdateOnModify) {
                this.update();
            }
            return true;
        }

        /**
         * Gets an edge by its fromModel and toModel
         * @param from
         * @param to
         * @returns {*}
         */
        getEdgeVisualizationByNodes(from: Node, to: Node): EdgeVisualization {
            var query: EdgeVisualization[] = this.edges.filter((edge: EdgeVisualization) => edge.fromModel === from && edge.toModel === to);
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
            var query: NodeVisualization[] = this.nodes.filter((nodeV: Visualization.NodeVisualization) => {
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
        editTransition(edge: Edge, node?: SVGTextElement, trackHistory?: boolean, onlyCurrentPart?: boolean) {
            var previousTransition = edge.transition;

            var target: SVGTextElement;

            // TODO: Generalize this transition editing
            if(node === null) {
                target = <SVGTextElement> d3.event.target;
            } else {
                target = node;
            }
         
            var transitionPart: Transition.EditableTransitionPart = d3.select(target).data()[0];
         
            var value = transitionPart.content;
            
            value = value !== this.board.graph.getEmptyTransitionCharacter()? value: '';
            
            var etn = new EditableTextNode(this.board, target);
            etn.value = value;
            etn.maxLength = 1;
            etn.onComplete = (wasNormalCompletion: boolean) => {
                if(this.state.editableTextInputField !== etn.inputField) {

                    // The user was no longer editing the transition, don't do anything
                    return true;
                }
                
                var transition = previousTransition.clone();
                
                var newValue = (<HTMLInputElement> etn.inputField).value || this.board.graph.getEmptyTransitionCharacter();
                transitionPart.onEdit(newValue, transition);
                var previousPending = transition.pending;
                transition.pending = false;
                var similarTransitions = edge.visualization.models.items.length > 1?
                    edge.visualization.models.items
                        .filter((otherEdge: Edge) => (otherEdge.hashCode() != edge.hashCode() && (otherEdge.transition.toString() === transition.toString())))
                        :[];
                    transition.pending = previousPending;

                if(similarTransitions.length == 0) {
                    var cmd = new jsflap.Board.Command.EditEdgeTransitionCommand(this.board, edge, transition, previousTransition);
                    if(onlyCurrentPart) {
                        transition.pending = false;
                        previousTransition.pending = false;
                        if(trackHistory) {
                            this.board.invocationStack.trackExecution(cmd);
                        } else {
                            cmd.execute();
                        }
                    } else { 
                        if(!trackHistory) {
                            transition.pending = false;
                            previousTransition.pending = false;
                            cmd.execute();
                        }   
                        if(wasNormalCompletion) {
                            var newTarget = target.nextSibling;
                            while(newTarget !== null &&  d3.select(newTarget).data()[0] instanceof Transition.StaticTransitionPart) {
                                newTarget = newTarget.nextSibling;
                            }
                            if(newTarget !== null && d3.select(newTarget).data()[0] instanceof Transition.EditableTransitionPart) {
                                setTimeout( () => this.editTransition(edge, <SVGTextElement> newTarget, trackHistory, false), 10);
                            } else if(trackHistory) {
                                transition.pending = false;
                                previousTransition.pending = false;
                                this.board.invocationStack.trackExecution(cmd);
                            }
                        } else if(trackHistory) {
                            transition.pending = false;
                            previousTransition.pending = false;
                            this.board.invocationStack.trackExecution(cmd);
                        }
                    }
                } else {
                   // _this.editTransition(edge, target, !!trackHistory);
                   return false;
                }
                return true;
            };
            etn.render();
        }
    }
}