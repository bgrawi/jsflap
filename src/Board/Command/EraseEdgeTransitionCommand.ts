module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;

    export class EraseEdgeTransitionCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        /**
         * The edge model being erased
         */
        private edge: Edge;

        private edgeV: EdgeV;

        private edgeT: Transition.ITransition;

        private fromNodeV: NodeV;

        private toNodeV: NodeV;

        private edgeIndex: number;

        constructor(board: Board, edge: Edge) {
            this.board = board;
            this.graph = board.graph;
            this.edge = edge;
        }

        execute(): void {

            this.edgeV = this.edge.visualization;
            this.edgeT = this.edge.transition;
            this.fromNodeV = this.edgeV.fromModel.visualization;
            this.toNodeV = this.edgeV.toModel.visualization;
            this.edgeIndex = this.edgeV.models.items.indexOf(this.edge);

            this.board.removeEdgeTransistion(this.edge.visualization, this.edge);
        }

        undo(): void {
            this.edgeV = this.edge.visualization;
            this.edgeT = this.edge.transition;
            this.fromNodeV = this.edgeV.fromModel.visualization;
            this.toNodeV = this.edgeV.toModel.visualization;
            this.edgeIndex = this.edgeV.models.items.indexOf(this.edge);

            this.board.addEdge(this.edgeV, this.fromNodeV, this.toNodeV, this.edgeT, this.edgeIndex);
        }


    }
}