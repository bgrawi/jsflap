
module jsflap.Board {
    export class MouseEvent {

        /**
         * The actual mosue event
         */
        public event: D3.D3Event;

        /**
         * The relative point that the mouse action was performed
         */
        public point: Point.ImmutablePoint;

        /**
         * Creates a new MouseEvent in a given context
         * @param event
         * @param context
         */
        constructor(event: D3.D3Event, context: any) {
            this.event = event;
            var rawPoint = d3.mouse(context);
            this.point = new Point.ImmutablePoint(rawPoint[0], rawPoint[1]);
        }
    }
}