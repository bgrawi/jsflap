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

    interface NodeVisualizationPositionState {
        visualization: NodeV;
        position: Point.MPoint;
    }

    export class MoveBoardCommand implements ICommand {

        /**
         * The current board
         */
        private board: Board;

        /**
         * The current graph
         */
        private graph: IGraph;

        private nodeStartPositions: NodeVisualizationPositionState[];

        private nodeEndPositions:  NodeVisualizationPositionState[];

        private firstTime: boolean = true;

        private edgeVisualizationStartPositions: EdgeVisualizationPositionState[];

        private edgeVisualizationEndPositions: EdgeVisualizationPositionState[];

        private nodes: NodeV[];

        private edges: EdgeV[];
        

        constructor(board: Board) {
            this.board = board;
            this.graph = board.graph;

            this.nodes = this.board.visualizations.nodes;
            this.edges = this.board.visualizations.edges;

            this.nodeStartPositions = this.makeNodeVisualizationPositionStates(this.nodes);
            this.edgeVisualizationStartPositions = this.makeEdgeVisualizationPositionStates(this.edges);

        }

        private makeNodeVisualizationPositionStates(nodeVisualizations: NodeV[]): NodeVisualizationPositionState[] {
            var nodeVisualizationPositionStates: NodeVisualizationPositionState[] = [];
            nodeVisualizations.forEach((nodeV: NodeV) => {
                nodeVisualizationPositionStates.push({
                    visualization: nodeV,
                    position: nodeV.position.getMPoint()
                });
            });

            return nodeVisualizationPositionStates;
        }

        private applyNodeVisualizationPositionStates(nodeVisualizationPositionState: NodeVisualizationPositionState[]) {
            nodeVisualizationPositionState.forEach((eps: NodeVisualizationPositionState) => {
                var vis = eps.visualization;
                vis.position = eps.position.getMPoint();
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
                vis.start = eps.start.getMPoint();
                vis.end = eps.end.getMPoint();
                vis.setControlDirectly(eps.control.getMPoint());
            });
        }

        execute(): void {
            if(this.firstTime) {
                this.nodeEndPositions = this.makeNodeVisualizationPositionStates(this.nodes);
                this.edgeVisualizationEndPositions = this.makeEdgeVisualizationPositionStates(this.edges);
                this.firstTime = false;
                return;
            }

            this.applyNodeVisualizationPositionStates(this.nodeEndPositions);
            this.applyEdgeVisualizationPositionStates(this.edgeVisualizationEndPositions);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }

        undo(): void {
            this.applyNodeVisualizationPositionStates(this.nodeStartPositions);
            this.applyEdgeVisualizationPositionStates(this.edgeVisualizationStartPositions);
            this.board.visualizations.shouldForceUpdateAnimation = true;
            this.board.visualizations.update();
            this.board.visualizations.shouldForceUpdateAnimation = false;
        }


    }
}