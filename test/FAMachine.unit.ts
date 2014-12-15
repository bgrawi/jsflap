describe("FA Machine", () => {

    var graph, machine;
    beforeEach(() => {
        graph = new jsflap.Graph.FAGraph(false);
        machine = new jsflap.Machine.FAMachine(graph);
    });

    it("should exist", () => {
        expect(typeof machine !== 'undefined').toBe(true);
    });

    it('should accept simple input', () => {
        graph.addNode('N1', {initial: true});
        graph.addNode('N2');
        graph.addNode('N3', {final: true});
        graph.addEdge('N1', 'N1', 'a');
        graph.addEdge('N1', 'N2', 'a');
        graph.addEdge('N2', 'N3', 'b');
        expect(machine.run('ab')).toBe(true);
    });
});