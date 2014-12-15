describe('FAGraph', () => {
    var N1, N2, N3, T1, T2, E1, E1copy, E2,
        graphString = 'NFA:({a, b}, {N1, N2}, {(N1, N1, a), (N1, N2, b)}, N1, {N2})';

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

    it("should update the alphabet accordingly", () => {
        var graph = new jsflap.Graph.FAGraph(false, [N1, N2, N3]),
            alphabet = graph.getAlphabet();

        graph.addEdge(E1); // Transition on a
        expect(alphabet.hasOwnProperty('a')).toBe(true);

        graph.addEdge(E2); // Transition on b
        expect(alphabet.hasOwnProperty('b')).toBe(true);
    });


    it("should be able to output a configuration file", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        graph.addNode('N1', {initial: true});
        graph.addNode('N2', {final: true});
        graph.addEdge('N1', 'N1', 'a');
        graph.addEdge('N1', 'N2', 'b');
        expect(graph.toString()).toBe(graphString);
    });

    it("should be able to load from configuration file", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph.fromString(graphString)).toBe(true);
        expect(graph.toString()).toBe(graphString);

        var graphString2 = 'NFA:({}, {}, {}, , {})';
        expect(graph.fromString(graphString2)).toBe(true);
        expect(graph.toString()).toBe(graphString2);

        var graphString3 = 'DFA:({a}, {q0}, {(q0, q0, a)}, q0, {q0})';
        expect(graph.fromString(graphString3)).toBe(true);
        expect(graph.toString()).toBe(graphString3);
    });

    it("should fail on an invalid configuration string", () => {
        var graph = new jsflap.Graph.FAGraph(false);
        expect(graph.fromString(graphString + 'a')).toBe(false);

        var graphString2 = 'DPDA:({}, {}, {}, , {})';
        expect(graph.fromString(graphString2)).toBe(false);

        var graphString3 = 'DFA:({a} {q0}, {(q0, q0, a)}, q0, {q0})';
        expect(graph.fromString(graphString3)).toBe(false);

        var graphString4 = 'NFA:({a}, {q0}, {(q0, q1, a}, q0, {q0})';
        expect(graph.fromString(graphString4)).toBe(false);
    });

});