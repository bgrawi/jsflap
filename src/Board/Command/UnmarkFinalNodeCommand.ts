module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import IGraph = Graph.IGraph;

    export class UnmarkFinalNodeCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        /**
         * The node being set to initial
         */
        private node: Node;

        constructor(board: Board, node: Node) {
            this.board = board;
            this.graph = board.graph;
            this.node = node;
        }

        execute(): void {
            this.graph.unmarkFinalNode(this.node);
            this.board.visualizations.update();
        }

        undo(): void {
            this.graph.markFinalNode(this.node);
            this.board.visualizations.update();
        }


    }
}