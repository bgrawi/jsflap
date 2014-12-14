describe("Graph", () => {
    var N1, N2, N3, T1, T2, E1, E1copy, E2;

    beforeEach(() => {
        N1 = new jsflap.Node('N1');
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3');
    });

    describe('NFAGraph', () => {

        beforeEach(() => {
            T1 = new jsflap.Transition.CharacterTransition('a');
            T2 = new jsflap.Transition.CharacterTransition('b');
            E1 = new jsflap.Edge(N1, N2, T1);
            E1copy = new jsflap.Edge(N1, N2, T1);
            E2 = new jsflap.Edge(N2, N3, T2);
        });

        it("should exist", () => {
            var graph = new jsflap.Graph.NFAGraph();
            expect(graph).not.toBe(null);
            expect(typeof graph !== 'undefined').toBe(true);
        });

        it("should be able to add edges and nodes at creation", () => {
            var graph = new jsflap.Graph.NFAGraph([N1, N2, N3], [E1, E2]);
            expect(graph.getNodes().size).toBe(3);
            expect(graph.getEdges().size).toBe(2);
        });

        it("should be able to add nodes after creation", () => {
            var graph = new jsflap.Graph.NFAGraph(),
                N1 = new jsflap.Node('N1');
            graph.addNode(N1);
        });
    });

});