module jsflap.Visualization {
    export class NodeVisualization {

        /**
         * The actual node in the graph
         */
        public node: Node;

        /**
         * The radius of the circle
         */
        public radius: number = 20;

        /**
         * The location of the node
         */
        public location: Point.IPoint;

        /**
         * Creates the node
         * @param location
         * @param node
         */
        constructor(location: Point.MutablePoint, node: Node) {
            this.location = location;
            this.node = node;
            node.setVisualization(this);
        }

        addTo(svg: D3.Selection) {
            svg.append("circle")
                .attr("cx", this.location.x)
                .attr("cy", this.location.y)
                .attr("r", this.radius)
                .attr('fill', "LightGoldenrodYellow")
                .attr('stroke', "#333333")
                .attr('opacity', 0)
                .transition()
                .attr('opacity', 1);

            svg.append("text")
                .text(this.node.label)
                .attr("x", this.location.x - ((this.node.label.length <= 2)? 11: 15))
                .attr("y", this.location.y + 5)
                .attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("fill", "#333")
                .attr('opacity', 0)
                .transition()
                .attr('opacity', 1);
        }
    }
}