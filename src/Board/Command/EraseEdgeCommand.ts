module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import IGraph = Graph.IGraph;

    export class EraseEdgeCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        private edgeV: EdgeV;

        private edgeModels: Edge[];

        constructor(board: Board, edgeV: EdgeV) {
            this.board = board;
            this.graph = board.graph;
            this.edgeV = edgeV;
        }

        execute(): void {
            //this.edgeModels = this.edgeV.models.items.slice(0);
            this.board.removeEdge(this.edgeV);
        }

        undo(): void {
            this.edgeV.models.items.forEach((edge: Edge) => {
                this.graph.addEdge(edge);
                //this.edgeV.addEdgeModel(edge);
            });
            this.edgeV.reindexEdgeModels();
            this.board.handleOppositeEdgeExpanding(this.edgeV);
            this.board.visualizations.addEdge(this.edgeV);

        }


    }
}