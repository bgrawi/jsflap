module jsflap.Board {

    export enum BoardMode {
        DRAW,
        MOVE,
        ERASE
    }

    export interface ContextMenuOption {
        display: string;
        callback: Function;
    }

    export class BoardState {
        public mode: BoardMode = BoardMode.DRAW;

        public futureEdge: Visualization.FutureEdgeVisualization = null;
        public futureEdgeFrom: Visualization.NodeVisualization = null;
        public futureEdgeSnapping: boolean = false;

        public draggingNode: Visualization.NodeVisualization = null;

        public modifyEdgeTransition: HTMLInputElement = null;
        public modifyEdgeControl: Visualization.EdgeVisualization = null;

        public contextMenuOptions: ContextMenuOption[] = null;
    }
}