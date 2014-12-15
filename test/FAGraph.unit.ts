describe('FAGraph', () => {
    var N1, N2, N3, T1, T2, E1, E1copy, E2;

    beforeEach(() => {
        N1 = new jsflap.Node('N1', {initial: true});
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3', {final: true});
        T1 = new jsflap.Transition.CharacterTransition('a');
        T2 = new jsflap.Transition.CharacterTransition('b');
        E1 = new jsflap.Edge(N1, N2, T1);
        E1copy = new jsflap.Edge(N1, N2, T1);
        E2 = new jsflap.Edge(N2, N3, T2);
    });

    it("should exist", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph).not.toBe(null);
        expect(typeof graph !== 'undefined').toBe(true);
    });

    it("should be able to add edges and nodes at creation", () => {
        var graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3], [E1, E2]);
        expect(graph.getNodes().size).toBe(3);
        expect(graph.getEdges().size).toBe(2);
    });

    it("should be able to add nodes after creation", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode(N1);
        expect(graph.getNode('N1')).toBe(N1);
    });

    it("should be able to add edges after creation", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode(N1);
        graph.addNode(N2);
        graph.addEdge(E1);
        expect(graph.hasEdge(E1)).toBe(true);
    });

    it("should be able to add edges after creation with string transitions", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode('N1');
        graph.addNode('N2');
        graph.addEdge('N1', 'N2', 'a');
        expect(graph.hasEdge(E1)).toBe(true);
    });

    it("should not be able to add edges with nodes that are not already in the graph", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(() => {
            graph.addEdge(E1);
        }).toThrowError();
    });

    it("should be able to get the initial node", () => {
        var graph = new jsflap.Graph.FAGraph(false, [N2, N1]);
        expect(graph.getInitialNode()).toBe(N1);
    });

    it("should overwrite the initial node if a new one is added", () => {
        var graph = new jsflap.Graph.FAGraph(false, [N1]);
        expect(graph.getInitialNode()).toBe(N1);

        var N4 = new jsflap.Node('N4', {initial: true});
        graph.addNode(N4);
        expect(graph.getInitialNode()).toBe(N4);
        expect(N1.initial).toBe(false);
    });

    it("should be able to get the final nodes", () => {
        var N4 = new jsflap.Node('N4', {final: true}),
            graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3, N4]),
            finalNodes = graph.getFinalNodes();

        expect(finalNodes.has(N3)).toBe(true);
        expect(finalNodes.has(N4)).toBe(true)
    });
});