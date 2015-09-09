module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import IGraph = Graph.IGraph;

    export class RelabelNodeCommand implements ICommand {

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
        
        private newName: string;
        
        private oldName: string;

        constructor(board: Board, node: Node, newName: string) {
            this.board = board;
            this.graph = board.graph;
            this.node = node;
            this.oldName = node.label;
            this.newName = newName;
        }

        execute(): void {
            this.node.label = this.newName;
            this.board.visualizations.update();
        }

        undo(): void {
            this.node.label = this.oldName;
            this.board.visualizations.update();
        }


    }
}