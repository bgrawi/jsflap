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
        public position: Point.MutablePoint;

        /**
         * Creates the node
         * @param position
         * @param model
         */
        constructor(position: Point.MutablePoint, model: Node) {
            this.position = position;
            this.model = model;
            model.setVisualization(this);
        }


        /**
         * Gets an anchor point on the edge of the circle from any other given point
         * @param point
         * @returns {jsflap.Point.MutablePoint}
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
            return new Point.MutablePoint(anchorX, anchorY);
        }
    }
}