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
        graph.addNode('N2', {final: true});
        graph.addEdge('N1', 'N2', 'a');
        machine.run('a');
    });
});