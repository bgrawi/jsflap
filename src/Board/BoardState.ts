module jsflap.Board {

    export enum BoardMode {
        DRAW,
        MOVE,
        ERASE
    }

    export class BoardState {
        public mode: BoardMode = BoardMode.DRAW;
        public futureEdge: Visualization.FutureEdgeVisualization = null;
        public futureEdgeFrom: Visualization.NodeVisualization = null;
        public futureEdgeSnapping: boolean = false;
    }
}