module jsflap.Visualization {

    export enum EdgeVisualizationPathMode {
        DEFAULT,
        SELF,
        OPPOSING_A,
        OPPOSING_B
    };

    export class EdgeVisualization {

        /**
         * The start point
         */
        public start: Point.MPoint;

        /**
         * The end point
         */
        public end: Point.MPoint;

        /**
         * The control point
         */
        private _control: Point.MPoint;

        /**
         * The actual model that this is representing
         */
        public models: EdgeList;

        /**
         * The start node model
         */
        public fromModel: Node;

        /**
         * The end node model
         */
        public toModel: Node;

        /**
         * The path value for the visualization
         */
        public path;

        /**
         * If the user has moved the control point yet
         * @type {boolean}
         */
        private _hasMovedControlPoint: boolean = false;

        /**
         * The type of path this edge visualization is representing
         */
        public pathMode: EdgeVisualizationPathMode = null;

        /**
         * Creates the node
         * @param control
         * @param models
         */
        constructor(models: any, control?: Point.MPoint) {
            var edgeListModels: Array<Edge>;
            if(typeof models === 'array') {
                edgeListModels = models;
            } else if(models instanceof Edge) {
                edgeListModels = [models];
            }
            this.models = new EdgeList();
            edgeListModels.forEach((edge: Edge) => this.addEdgeModel(edge));
            this.pathMode = (this.fromModel !== this.toModel)?
                EdgeVisualizationPathMode.DEFAULT:
                EdgeVisualizationPathMode.SELF;
            this.recalculatePath(control);
        }

        /**
         * Adds an edge model to this visualization
         * @param edge
         * @param index
         */
        public addEdgeModel(edge: Edge, index?: number): Edge {
            if(!this.fromModel || !this.toModel) {
                this.fromModel = edge.from;
                this.toModel = edge.to;
                edge.setVisualization(this, typeof index === 'number'? index: this.models.items.length);
                return this.models.add(edge, index);
            } else if(edge.from === this.fromModel && edge.to === this.toModel) {
                edge.setVisualization(this, typeof index === 'number'? index: this.models.items.length);
                return this.models.add(edge);
            } else {
                return null;
            }
        }

        /**
         * Reindexs the visualization numbers of the edges
         */
        public reindexEdgeModels() {
            this.models.items.forEach((edge: Edge, index: number) => {
                edge.visualizationNumber = index;
            });
        }

        /**
         * Recalculates the path between nodes and a possibly already given control point
         * @param control
         */
        public recalculatePath(control?: Point.MPoint) {
            if(this.pathMode !== EdgeVisualizationPathMode.SELF) {
                var tempControlPoint = this.getInitialControlPoint(
                    this.fromModel.visualization.position,
                    this.toModel.visualization.position
                );
                this.start = this.fromModel.visualization.getAnchorPointFrom(control? control: tempControlPoint);
                this.end = this.toModel.visualization.getAnchorPointFrom(control? control: tempControlPoint);
                this._control = control? control: this.getInitialControlPoint();
            } else {
                var anchorPoints = this.fromModel.visualization.getSelfAnchorPoints(control);
                this.start = anchorPoints[0];
                this.end = anchorPoints[1];
                this._control = control? control: this.getInitialControlPoint();
            }
        }

        /**
         * Gets the initial control point with a given offset
         * @returns {jsflap.Point.MPoint}
         */
        public getInitialControlPoint(startPoint?: Point.IPoint, endPoint?: Point.IPoint) {
            startPoint = startPoint? startPoint: this.start;
            endPoint = endPoint? endPoint: this.end;
            var controlPoint =  Point.MPoint.getMidpoint(startPoint, endPoint);
            switch (this.pathMode) {
                case EdgeVisualizationPathMode.SELF:
                    controlPoint.y -= 80;
                    break;
                case EdgeVisualizationPathMode.OPPOSING_A:
                case EdgeVisualizationPathMode.OPPOSING_B:
                    controlPoint.add(Point.MPoint.getNormalOffset(startPoint, endPoint,
                        // The separation should be 1/15  the distance or 15px, what ever is greater
                        Math.max(startPoint.getDistanceTo(endPoint) / 15, 20)));
                    break;
            }
            return controlPoint;
        }

        /**
         * Determines if the control point has been moved from the start
         * @returns {boolean}
         */
        public hasMovedControlPoint(): boolean {
            return this._hasMovedControlPoint;
        }

        /**
         * Resets the control points position
         */
        public resetControlPoint() {
            this._hasMovedControlPoint = false;
            this._control = this.getInitialControlPoint();
        }

        /**
         * Sets the control point
         * @param point
         */
        set control(point: Point.MPoint) {
            this._hasMovedControlPoint = true;
            this._control = point;
        }

        public setControlDirectly(point: Point.MPoint) {
            this._control = point;
        }

        public setHasMovedControlPointDirectly(val: boolean) {
            this._hasMovedControlPoint = val;
        }

        /**
         * Gets the control point
         * @returns {Point.MPoint}
         */
        get control(): Point.MPoint {
            return this._control;
        }


        /**
         * Gets the path string
         */
        public getPath(): string {
            return 'M' + this.start + ' Q' + this.control + ' ' + this.end;
        }

        /**
         * Gets the position of where the transition text should be
         */
        public getTransitionPoint(modelNumber?: number): Point.MPoint {
            // Quadratic Bezier Curve formula evaluated halfway
            var t = 0.5,
                x = (1 - t) * (1 - t) * this.start.x + 2 * (1 - t) * t * this.control.x + t * t * this.end.x,
                y = (1 - t) * (1 - t) * this.start.y + 2 * (1 - t) * t * this.control.y + t * t * this.end.y;
            return new Point.MPoint(x, y).add(Point.MPoint.getNormalOffset(this.start, this.end,
                (this.pathMode !== EdgeVisualizationPathMode.SELF? 1: -1) * ((modelNumber? modelNumber: 0) * 20)));
        }

        /**
         * Gets the direction of the edge
         * @returns {number} 1: right, -1: left
         */
        public getDirection() {
            return this.start.x < this.end.x? 1: -1;
        }
    }
}