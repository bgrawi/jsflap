module jsflap {

    export interface NodeOptions {
        initial?: boolean;
        final?: boolean;
        fromEdges?: EdgeList;
        toEdges?: EdgeList;
    }

    export class Node implements IHashable {

        private _hashCode: string = Utils.getUUID();

        /**
         * The label of this node/state
         */
        public label: string;

        /**
         * If the node is an initial node
         */
        public initial: boolean;

        /**
         * If the node is a final node
         */
        public final: boolean;

        /**
         * The edges that this node comes from
         */
        public fromEdges: EdgeList;

        /**
         * The edges that this label goes to
         */
        public toEdges: EdgeList;

        /**
         * The visualization of the node
         */
        public visualization: Visualization.NodeVisualization;

        /**
         * Creates a new node
         * @param label
         * @param options
         */
        constructor(label: string, options?: NodeOptions) {

            this.label = label;

            if(options) {
                this.initial = (options.initial)? options.initial: false;
                this.final = (options.final)? options.final: false;
                this.fromEdges = (options.fromEdges)? options.fromEdges: new EdgeList();
                this.toEdges = (options.toEdges)? options.toEdges: new EdgeList();
            } else {
                this.initial = false;
                this.final = false;
                this.fromEdges = new EdgeList();
                this.toEdges = new EdgeList();
            }
        }

        /**
         * Adds an edge to the from list
         * @param edge
         */
        addFromEdge(edge: Edge): Edge {
            if(edge.to.toString() === this.toString()) {
                return this.fromEdges.add(edge);
            } else {
                return null;
            }
        }

        /**
         * Adds an edge to the to list
         * @param edge
         */
        addToEdge(edge: Edge): Edge {
            if(edge.from.toString() === this.toString()) {
                return this.toEdges.add(edge);
            } else {
                return null;
            }
        }

        /**
         * Removes a from edge from this node
         * @param edge
         * @returns {boolean}
         */
        removeFromEdge(edge: Edge): boolean {
            if(edge.to.toString() === this.toString()) {
                return this.fromEdges.remove(edge);
            } else {
                return false;
            }
        }

        /**
         * Removes a to edge to this node
         * @param edge
         * @returns {boolean}
         */
        removeToEdge(edge: Edge): boolean {
            if(edge.from.toString() === this.toString()) {
                return this.toEdges.remove(edge);
            } else {
                return false;
            }
        }

        /**
         * Set the visualization
         * @param visualization
         */
        setVisualization(visualization: Visualization.NodeVisualization) {
            this.visualization = visualization;
        }

        /**
         * Gets the label of this current node
         * @returns {string}
         */
        toString() {
            return this.label;
        }

        public hashCode(): string {
            return this._hashCode;
        }
    }
}