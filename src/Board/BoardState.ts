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
        public futureEdgeFromValid: boolean = false;
        public futureEdgeFromCreated: boolean = false;
        public shiftKeyPressed: boolean = false;
        
        public ctrlKeyPressed: boolean = false;
        public metaKeyPressed: boolean = false;

        public draggingNode: Visualization.NodeVisualization = null;
        public isErasing: boolean = false;
        public hoveringEdge: Visualization.EdgeVisualization = null;
        public hoveringTransition: Edge = null;
        public isDraggingBoard: boolean = false;

        public quickMoveFrom: BoardMode = null;

        public editableTextInputField: HTMLInputElement = null;
        public modifyEdgeControl: Visualization.EdgeVisualization = null;

        public contextMenuOptions: ContextMenuOption[] = null;

        public lastMousePoint: Point.IPoint = null;

        public draggingCommand: Command.ICommand  = null;
    }
}