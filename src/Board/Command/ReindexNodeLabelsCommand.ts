module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;

    interface NodeLabelState {
        model: Node;
        label: string;
    }

    export class ReindexNodeLabelsCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        private nodeLabelStateStart: NodeLabelState[];

        private nodeLabelStateEnd:  NodeLabelState[];

        private nodes: Node[];
        

        constructor(board: Board) {
            this.board = board;
            this.graph = board.graph;

            this.nodes = this.graph.getNodes().items;

            this.nodeLabelStateStart = this.makeNodeLabelStates(this.nodes);
        }

        private makeNodeLabelStates(nodes: Node[]): NodeLabelState[] {
            var nodeLabelStates: NodeLabelState[] = [];
            nodes.forEach((node: Node) => {
                nodeLabelStates.push({
                    model: node,
                    label: node.label
                });
            });

            return nodeLabelStates;
        }

        private applyNodeLabelStates(nodeVisualizationPositionState: NodeLabelState[]) {
            nodeVisualizationPositionState.forEach((eps: NodeLabelState) => {
                eps.model.label = eps.label;
            });
        }

        execute(): void {
            this.nodes.forEach((node: Node, index: number) => {
                node.label = "q" + index;
            });
            this.board.visualizations.update();
        }

        undo(): void {
            this.applyNodeLabelStates(this.nodeLabelStateStart);
            this.board.visualizations.update();
        }


    }
}