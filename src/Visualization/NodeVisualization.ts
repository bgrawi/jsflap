module jsflap.Visualization {
    export class NodeVisualization {

        /**
         * The actual node in the graph
         */
        public model: Node;

        /**
         * The radius of the circle
         */
        public radius: number = 20;

        /**
         * The location of the node
         */
        public position: Point.MPoint;

        /**
         * Creates the node
         * @param model
         * @param position
         */
        constructor(model: Node, position: Point.MPoint) {
            this.position = position;
            this.model = model;
            model.setVisualization(this);
        }

        /**
         * Updates the edges that this node is connected to, useful for when this node's position changes
         */
        public updateEdgeVisualizationPaths(updateFn?: (value: Edge, index: number, array: Edge[]) => void) {
            if(!updateFn) {
                updateFn = (edgeModel: Edge) => {
                    edgeModel.visualization.recalculatePath(edgeModel.visualization.hasMovedControlPoint()? edgeModel.visualization.control: null);
                };
            }
            this.forEachEdge(updateFn);
        }

        /**
         * Calls the forEach method on both model.toEdges and model.fromEdges
         * @param callBackFn
         */
        public forEachEdge(callBackFn: (value: Edge, index: number, array: Edge[]) => void) {
            this.model.toEdges.items.forEach(callBackFn);
            this.model.fromEdges.items.forEach(callBackFn);
        }


        /**
         * Gets an anchor point on the edge of the circle from any other given point
         * @param point
         * @returns {jsflap.Point.MPoint}
         */
        public getAnchorPointFrom(point: Point.IPoint) {
            var posX = this.position.x,
                posY = this.position.y,
                r = this.radius,
                dx = point.x - posX,
                dy = point.y - posY,
                theta = Math.atan2(dy, dx),
                anchorX = posX + r * Math.cos(theta),
                anchorY = posY + r * Math.sin(theta);
            return new Point.MPoint(anchorX, anchorY);
        }

        /**
         * Gets the self anchor points if an edge goes to the same node
         * @returns {any[]}
         */
        public getSelfAnchorPoints(from?: Point.IPoint) {
            var posX = this.position.x,
                posY = this.position.y,
                r = this.radius,
                theta0 = from? this.position.getAngleTo(from): Math.PI / 2,
                theta1 = theta0 + Math.PI / 6,
                theta2 = theta0 - Math.PI / 6,
                anchorX1 = posX + -r * Math.cos(theta1),
                anchorY1 = posY + -r * Math.sin(theta1),
                anchorX2 = posX + -r * Math.cos(theta2),
                anchorY2 = posY + -r * Math.sin(theta2);
            return [
                new Point.MPoint(anchorX1, anchorY1),
                new Point.MPoint(anchorX2, anchorY2),
            ];
        }
    }
}