module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;

    export class AddEdgeFromNodeCommand implements ICommand{

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        /**
         * The starting node visualization
         */
        private startNodeV: NodeV;

        /**
         * The ending node being visualized
         */
        private endNodeV: NodeV;

        /**
         * The actual ending node model
         */
        private endNode: Node;

        /**
         * If a node needed to be created
         */
        private neededToCreateNode: boolean;

        /**
         * The edge created
         */
        private edge: Edge;

        /**
         * The edge index in the transition
         */
        private edgeIndex: number;

        /**
         * The edge visualization
         */
        private edgeV: EdgeV;
        
        private firstTime: boolean = true;

        constructor(board: Board, startNodeV: NodeV, endingPoint: Point.IPoint) {
            this.board = board;
            this.graph = board.graph;
            this.startNodeV = startNodeV;

            var nearestNode = board.visualizations.getNearestNode(endingPoint);

            if (nearestNode.node && nearestNode.distance < 40) {
                this.endNodeV = nearestNode.node;
                this.endNode = nearestNode.node.model;

                this.neededToCreateNode = false;
            } else {
                this.endNode = new Node(board.getNextNodeLabel());
                this.endNodeV = new NodeV(this.endNode, endingPoint.getMPoint());

                this.neededToCreateNode = true;
            }
        }

        execute(): void {
            if(this.neededToCreateNode) {
                this.graph.addNode(this.endNode);
                this.board.visualizations.addNode(this.endNodeV);
            }

            //if(!this.edgeV) {
                this.edgeV = this.board.addEdge(this.edgeV, this.startNodeV, this.endNodeV, this.edge ? this.edge.transition : null, null, true);
                this.firstTime = false;
            //} else {
            //    this.board.addEdgeVisualization(this.edgeV);
            //    this.board.handleOppositeEdgeExpanding(this.edgeV);
            //}
            if(!this.edgeIndex) {
                this.edgeIndex = this.edgeV.models.items.length - 1;
                this.edge = this.edgeV.models.items[this.edgeIndex];
            }
        }

        undo(): void {
            this.board.removeEdgeTransistion(this.edgeV, this.edge);

            if(this.neededToCreateNode) {
                this.board.removeNodeAndSaveSettings(this.endNodeV);
            }
        }

        getEndNodeV() {
            return this.endNodeV;
        }

        getEdge() {
            return this.edge;
        }

    }
}