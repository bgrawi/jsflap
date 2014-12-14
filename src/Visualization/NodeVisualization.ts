module jsflap.Visualization {
    class NodeVisualization {

        /**
         * The label for the node
         */
        public label: string =  'NL';

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
         * @param label
         */
        constructor(location: Point.MutablePoint, label: string) {
            this.location = location;
            this.label = label;
        }
    }
}