module jsflap.Visualization {

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
         * Creates a new visualization collection
         * @param svg
         */
        constructor(svg: D3.Selection) {
            this.svg = svg;
            this.nodes = [];
            this.edges = [];
            this.update();
        }

        public update() {
            var circles = this.svg.selectAll("circle")
                .data(this.nodes);

            circles.enter()
                .append("circle")
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y)
                .attr('fill', "LightGoldenrodYellow")
                .attr('stroke', "#333")
                .attr("r", (d: NodeVisualization) => d.radius - 10)
                .attr('opacity', 0)
                .transition()
                .ease("elastic")
                .duration(300)
                .attr("r", (d: NodeVisualization) => d.radius)
                .attr('opacity', 1);

            circles
                .attr("cx", (d: NodeVisualization) => d.position.x)
                .attr("cy", (d: NodeVisualization) => d.position.y);

            circles.exit().remove();

            var circleLabels = this.svg.selectAll("text")
                .data(this.nodes);

            circleLabels
                .enter()
                .append('text')
                .text((d: NodeVisualization) => d.model.label)
                .attr("x", (d: NodeVisualization) => d.position.x - ((d.model.label.length <= 2)? 11: 15))
                .attr("y", (d: NodeVisualization) => d.position.y + 5)
                .attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("fill", "#333")
                .attr('opacity', 0)
                .transition()
                .delay(100)
                .duration(300)
                .attr('opacity', 1);

            circleLabels
                .attr("x", (d: NodeVisualization) => d.position.x - ((d.model.label.length <= 2)? 11: 15))
                .attr("y", (d: NodeVisualization) => d.position.y + 5);

            circleLabels.exit().remove();

            var edgePaths = this.svg.selectAll("path.edge")
                .data(this.edges);

            var edgePath = d3.svg.line().interpolate('cardinal')
                .x((d) => d.x)
                .y((d) => d.y);

            edgePaths
                .enter()
                .append('path')
                .classed('edge', true)
                .attr('d', (d: EdgeVisualization) => edgePath(d.pathCoords))
                .attr('stroke', '#333')
                .attr('stroke-width', '1')
                .attr('opacity', .8)
                .transition()
                .duration(300)
                .attr('opacity', 1)
                .attr('style', "marker-end:url(#markerArrow)");

            edgePaths.exit().remove();
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
                if(distance < nearestNode.distance) {
                    nearestNode.node = node;
                    nearestNode.distance = distance;
                    nearestNode.hover = nearestNode.distance <= node.radius;
                }
            });

            return nearestNode;
        }
    }
}