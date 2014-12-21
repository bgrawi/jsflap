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
                theta = Math.atan(dy/dx),
                trigSide = (dx >= 0)? 1: -1,
                anchorX = posX + trigSide * r * Math.cos(theta),
                anchorY = posY + trigSide * r * Math.sin(theta);
            return new Point.MPoint(anchorX, anchorY);
        }

        /**
         * Gets the self anchor points if an edge goes to the same node
         * @returns {any[]}
         */
        public getSelfAnchorPoints() {
            var posX = this.position.x,
                posY = this.position.y,
                r = this.radius,
                theta1 = 2 * Math.PI / 6,
                trigSide1 = -1,
                theta2 = 4 * Math.PI / 6,
                trigSide2 = -1,
                anchorX1 = posX + trigSide1 * r * Math.cos(theta1),
                anchorY1 = posY + trigSide1 * r * Math.sin(theta1),
                anchorX2 = posX + trigSide2 * r * Math.cos(theta2),
                anchorY2 = posY + trigSide2 * r * Math.sin(theta2);
            return [
                new Point.MPoint(anchorX1, anchorY1),
                new Point.MPoint(anchorX2, anchorY2),
            ];
        }
    }
}