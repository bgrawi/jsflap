module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import IGraph = Graph.IGraph;

    export class AddNodeAtPointCommand implements ICommand{

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        /**
         * The point that the node will be created at
         */
        private point: IPoint;

        /**
         * The node being visualized
         */
        private nodeV: NodeV;

        /**
         * The actual node model
         */
        private node: Node;

        constructor(board: Board, point: IPoint) {
            this.board = board;
            this.graph = board.graph;
            this.point = point;
            this.node = new Node(board.getNextNodeLabel());
            if(board.visualizations.nodes.length === 0) {
                this.node.initial = true;
            }
            this.nodeV = new NodeV(this.node, this.point.getMPoint());
        }

        execute(): void {
            this.graph.addNode(this.node);
            this.board.visualizations.addNode(this.nodeV);
        }

        undo(): void {
            this.graph.removeNode(this.node);
            this.board.visualizations.removeNode(this.nodeV);
        }

        getNodeV() {
            return this.nodeV;
        }

        getNode() {
            return this.node;
        }

    }
}