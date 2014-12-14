describe("Node", () => {

    it("should exist", () => {
        var node = new jsflap.Node('N1');
        expect(typeof node !== 'undefined').toBe(true);
    });

    it("should be able to add edges", () => {
        var N1 = new jsflap.Node('N1'),
            N2 = new jsflap.Node('N2'),
            T1 = new jsflap.Transition.CharacterTransition('a'),
            E1 = new jsflap.Edge(N1, N2, T1);
        expect(N1.toEdges.has(E1)).toBe(true);
        expect(N2.fromEdges.has(E1)).toBe(true);
    });

    it("should be able to have options", () => {
        var N1 = new jsflap.Node('N1', {
            initial: true,
            final: true
        });
        expect(N1.initial).toBe(true);
        expect(N1.final).toBe(true);
    });
});