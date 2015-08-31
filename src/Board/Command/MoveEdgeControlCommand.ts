module jsflap.Board.Command {

    import IPoint = Point.IPoint;
    import NodeV = Visualization.NodeVisualization;
    import EdgeV = Visualization.EdgeVisualization;
    import IGraph = Graph.IGraph;

    interface EdgeVisualizationControlPositionState {
        visualization: EdgeV;
        hasMovedControl: boolean;
        control: Point.MPoint;
        start: Point.MPoint;
        end: Point.MPoint;
    }

    export class MoveEdgeControlCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        /**
         * The edge
         */
        private edgeV: EdgeV;


        private firstTime: boolean = true;

        private edgeVisualizationControlStartPosition: EdgeVisualizationControlPositionState;

        private edgeVisualizationControlEndPosition: EdgeVisualizationControlPositionState;


        constructor(board: Board, edgeV: EdgeV) {
            this.board = board;
            this.graph = board.graph;
            this.edgeV = edgeV;
            this.edgeVisualizationControlStartPosition = this.makeEdgeVisualizationControlPositionStates(this.edgeV);

        }

        private makeEdgeVisualizationControlPositionStates(edgeV: EdgeV): EdgeVisualizationControlPositionState {
            return {
                visualization: edgeV,
                hasMovedControl: edgeV.hasMovedControlPoint(),
                control: edgeV.control.getMPoint(),
                start: edgeV.start.getMPoint(),
                end: edgeV.end.getMPoint()
            };
        }

        private applyEdgeVisualizationControlPositionStates(eps: EdgeVisualizationControlPositionState) {
            var vis = eps.visualization;
            vis.setHasMovedControlPointDirectly(eps.hasMovedControl);
            vis.start = eps.start.getMPoint();
            vis.end = eps.end.getMPoint();
            vis.setControlDirectly(eps.control.getMPoint());
        }

        execute(): void {
            if (this.firstTime) {
                this.edgeVisualizationControlEndPosition = this.makeEdgeVisualizationControlPositionStates(this.edgeV);
                this.firstTime = false;
                return;
            }

            this.applyEdgeVisualizationControlPositionStates(this.edgeVisualizationControlEndPosition);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }

        undo(): void {
            this.applyEdgeVisualizationControlPositionStates(this.edgeVisualizationControlStartPosition);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }


    }
}