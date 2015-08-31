module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;

    interface EdgeVisualizationPositionState {
        visualization: EdgeV;
        start: Point.MPoint;
        end: Point.MPoint;
        control: Point.MPoint;
    }

    export class MoveNodeCommand implements ICommand {

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
        private nodeV: NodeV;

        private nodeStartPosition: Point.MPoint;

        private nodeEndPosition: Point.MPoint;

        private firstTime: boolean = true;

        private edgeVisualizationStartPositions: EdgeVisualizationPositionState[];

        private edgeVisualizationEndPositions: EdgeVisualizationPositionState[];

        private relatedEdges: EdgeV[];

        constructor(board: Board, nodeV: NodeV) {
            this.board = board;
            this.graph = board.graph;
            this.nodeV = nodeV;

            this.nodeStartPosition = nodeV.position.getMPoint();
            this.relatedEdges = this.getRelatedEdges();
            this.edgeVisualizationStartPositions = this.makeEdgeVisualizationPositionStates(this.relatedEdges);

        }

        private getRelatedEdges(): EdgeV[] {
            return this.board.visualizations.edges.filter((edgeV: EdgeV) => {
                return edgeV.fromModel.visualization === this.nodeV ||
                    edgeV.toModel.visualization === this.nodeV;
            });
        }

        private makeEdgeVisualizationPositionStates(edgeVisualizations: EdgeV[]): EdgeVisualizationPositionState[] {
            var edgeVisualizationPositionStates: EdgeVisualizationPositionState[] = [];
            edgeVisualizations.forEach((edgeV: EdgeV) => {
                edgeVisualizationPositionStates.push({
                    visualization: edgeV,
                    start: edgeV.start.getMPoint(),
                    end: edgeV.end.getMPoint(),
                    control: edgeV.control.getMPoint()
                });
            });

            return edgeVisualizationPositionStates;
        }

        private applyEdgeVisualizationPositionStates(edgeVisualizationPositionState: EdgeVisualizationPositionState[]) {
            edgeVisualizationPositionState.forEach((eps: EdgeVisualizationPositionState) => {
                var vis = eps.visualization;
                vis.start = eps.start;
                vis.end = eps.end;
                vis.setControlDirectly(eps.control);
            });
        }

        execute(): void {
            if(this.firstTime) {
                this.nodeEndPosition = this.nodeV.position.getMPoint();
                this.edgeVisualizationEndPositions = this.makeEdgeVisualizationPositionStates(this.relatedEdges);
                this.firstTime = false;
                return;
            }

            this.nodeV.position = this.nodeEndPosition;
            this.applyEdgeVisualizationPositionStates(this.edgeVisualizationEndPositions);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }

        undo(): void {
            this.nodeV.position = this.nodeStartPosition;
            this.applyEdgeVisualizationPositionStates(this.edgeVisualizationStartPositions);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }


    }
}