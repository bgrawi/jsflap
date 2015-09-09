module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;
    import ITransition = Transition.ITransition;

    export class EditEdgeTransitionCommand implements ICommand {

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

        private transitionTo: ITransition;

        private transitionFrom: ITransition;

        constructor(board: Board, edge: Edge, transitionTo: ITransition, transitionFrom: ITransition) {
            this.board = board;
            this.graph = board.graph;
            this.edge = edge;
            this.transitionTo = transitionTo;
            this.transitionFrom = transitionFrom;
        }

        execute(): void {
            var results = this.edge.visualization.models.items.filter((edge: Edge) => edge.transition === this.transitionFrom);
            results[0].transition = this.transitionTo;
            this.board.state.editableTextInputField = null;
            this.board.visualizations.update();
            if (typeof this.board.onBoardUpdateFn === 'function') {
                this.board.onBoardUpdateFn();
            }
        }

        undo(): void {
            var results = this.edge.visualization.models.items.filter((edge: Edge) => edge.transition === this.transitionTo);
                results[0].transition = this.transitionFrom;
            this.board.state.editableTextInputField = null;
            this.board.visualizations.update();
            if (typeof this.board.onBoardUpdateFn === 'function') {
                this.board.onBoardUpdateFn();
            }
        }
    }
}