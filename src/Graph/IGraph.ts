
module jsflap.Graph {

    export interface IGraph {
        shortName: string;
        getNodes(): NodeList;
        getEdges(): EdgeList;

        getNode(node: Node): Node;
        getNode(node: string): Node;

        removeNode(node: Node): boolean;
        removeNode(node: string): boolean;

        getEdge(edge: Edge): Edge;
        getEdge(edge: string): Edge;

        removeEdge(edge: Edge): boolean;
        removeEdge(edge: string): boolean;

        hasNode(node: Node): boolean;
        hasNode(node: string): boolean;

        hasEdge(edge: Edge): boolean;
        hasEdge(edge: string): boolean;

        addNode(node: Node): Node;
        addNode(label: string): Node;

        addEdge(from: any, to: any, transition: any, pending?: boolean): Edge;
        addEdge(edge: Edge): Edge;

        getInitialNode(): Node;
        setInitialNode(node: Node): Node;
        getFinalNodes(): NodeList;

        markFinalNode(node: Node): Node;
        unmarkFinalNode(node: Node): Node;

        getAlphabet(): Object;
        updateAlphabetForEgde(edge: Edge);
        updateAlphabet();

        toString(): string;
        fromString(input: string): boolean;

        isValid(): boolean;
        
        getEmptyTransitionCharacter(): string;
    }
}