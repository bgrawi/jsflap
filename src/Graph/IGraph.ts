
module jsflap.Graph {

    export interface IGraph<T extends Transition.ITransition> {
        getNodes(): NodeList;
        getEdges(): EdgeList;

        addNode(node: Node): Node;
        addNode(label: string): Node;

        addEdge(from: Node, to: Node, transition: T): Edge;
        addEdge(edge: Edge): Edge;
    }
}