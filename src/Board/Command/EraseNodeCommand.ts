module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import IGraph = Graph.IGraph;

    export class EraseNodeCommand implements ICommand{

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;


        /**
         * The node being visualized
         */
        private nodeV: NodeV;

        private fromEdges: Edge[];

        private toEdges: Edge[];

        /**
         * The actual node model
         */
        private node: Node;

        constructor(board: Board, nodeV: NodeV) {
            this.board = board;
            this.graph = board.graph;
            this.nodeV = nodeV;
            this.node = nodeV.model;
        }

        execute(): void {
            this.fromEdges = this.node.fromEdges.items.slice(0);
            this.toEdges = this.node.toEdges.items.slice(0);
            this.board.removeNode(this.nodeV);
        }

        undo(): void {
            this.board.visualizations.shouldAutoUpdateOnModify = false;
            this.graph.addNode(this.node);
            this.board.visualizations.addNode(this.nodeV);

            var updateFn = (edge: Edge) => {
                this.board.addEdge(edge.visualization, edge.from.visualization, edge.to.visualization, edge.transition, edge.visualizationNumber);
                edge.visualization.reindexEdgeModels();
            };

            this.fromEdges.forEach(updateFn);
            this.toEdges.forEach(updateFn);
            this.nodeV.model = this.node;

            this.board.visualizations.update();

            this.board.visualizations.shouldAutoUpdateOnModify = true;
        }

        getNode() {
            return this.node;
        }

    }
}