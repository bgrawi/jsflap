
module jsflap.Board {
    export class MouseEvent {

        /**
         * The actual mouse event, treat as a MouseEvent from the browser
         */
        public event; //: MouseEvent; Namespace collision with actual dom MouseEvent

        /**
         * The relative point that the mouse action was performed
         */
        public point: Point.IMPoint;

        /**
         * Creates a new MouseEvent in a given context
         * @param event
         * @param context
         */
        constructor(event: D3.D3Event, context: any) {
            this.event = event;
            var rawPoint = d3.mouse(context);
            this.point = new Point.IMPoint(rawPoint[0], rawPoint[1]);
        }
    }
}