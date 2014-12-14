describe("Edge", () => {

    var NodeA, NodeB, NodeC, Transition1;

    beforeEach(() => {
        NodeA = new jsflap.Node('A');
        NodeB = new jsflap.Node('B');
        NodeC = new jsflap.Node('C');
        Transition1 = new jsflap.Transition.CharacterTransition('a');
    });

    it("should exist", () => {
        var edge = new jsflap.Edge(NodeA, NodeB, Transition1);
        expect(typeof edge !== 'undefined').toBe(true);
    });

    it("should add the edge to the nodes", () => {
        var edge = new jsflap.Edge(NodeA, NodeB, Transition1);
        expect(NodeA.toEdges.has(edge)).toBe(true);
        expect(NodeB.fromEdges.has(edge)).toBe(true);
    });
});