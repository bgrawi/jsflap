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
        public shiftKeyPressed: boolean = false;

        public ctrlKeyPressed: boolean = false;

        public draggingNode: Visualization.NodeVisualization = null;
        public isErasing: boolean = false;
        public hoveringEdge: Visualization.EdgeVisualization = null;
        public hoveringTransition: Edge = null;
        public isDraggingBoard: boolean = false;

        public quickMoveFrom: BoardMode = null;

        public modifyEdgeTransition: HTMLInputElement = null;
        public modifyEdgeControl: Visualization.EdgeVisualization = null;

        public contextMenuOptions: ContextMenuOption[] = null;

        public lastMousePoint: Point.IPoint = null;
    }
}