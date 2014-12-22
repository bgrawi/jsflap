
module jsflap.Graph {

    export interface IGraph {
        getNodes(): NodeList;
        getEdges(): EdgeList;

        getNode(node: Node): Node;
        getNode(node: string): Node;

        getEdge(edge: Edge): Edge;
        getEdge(edge: string): Edge;

        hasNode(node: Node): boolean;
        hasNode(node: string): boolean;

        hasEdge(edge: Edge): boolean;
        hasEdge(edge: string): boolean;

        addNode(node: Node): Node;
        addNode(label: string): Node;

        addEdge(from: any, to: any, transition: any): Edge;
        addEdge(edge: Edge): Edge;

        getInitialNode(): Node;
        setInitialNode(node: Node): Node;
        getFinalNodes(): NodeList;

        getAlphabet(): Object;

        toString(): string;
        fromString(input: string): boolean;

        isValid(): boolean;
    }
}