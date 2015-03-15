module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;

    export class AddNodeAtPointCommand implements ICommand{

        /**
         * The current board
         */
        private board: Board;

        /**
         * The point that the node will be created at
         */
        private point: IPoint;

        /**
         * The node being visualized
         */
        private nodeV: NodeV;

        constructor(board: Board, point: IPoint) {
            this.board = board;
            this.point = point;
        }

        execute(): void {
            this.nodeV = this.board.addNode(this.point);
        }

        undo(): void {
            this.board.removeNodeAndSaveSettings(this.nodeV);
        }

    }
}