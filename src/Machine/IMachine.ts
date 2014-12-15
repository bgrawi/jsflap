module jsflap.Machine {

    export interface IMachine {
        run(input: string, graph?: Graph.IGraph): boolean;
        setGraph(graph: Graph.IGraph): void;
        graph: Graph.IGraph;
    }
}