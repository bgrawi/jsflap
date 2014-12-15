describe("EdgeList", () => {
    var N1, N2, N3, T1, T2, E1, E1copy, E2;

    beforeEach(() => {
        N1 = new jsflap.Node('N1');
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3');
        T1 = new jsflap.Transition.CharacterTransition('a');
        T2 = new jsflap.Transition.CharacterTransition('b');
        E1 = new jsflap.Edge(N1, N2, T1);
        E1copy = new jsflap.Edge(N1, N2, T1);
        E2 = new jsflap.Edge(N2, N3, T2);
    });

    it("should exist", () => {
        var edgeList = new jsflap.EdgeList();
        expect(typeof edgeList !== 'undefined').toBe(true);
    });

    it("should be able to add edges", () => {
        var edgeList = new jsflap.EdgeList([E1, E2]);
        expect(edgeList.has(E1)).toBe(true);
        expect(edgeList.has(E2)).toBe(true);
        expect(edgeList.size).toBe(2);
    });

    it("should be able to get an edge by reference", () => {
        var edgeList = new jsflap.EdgeList();
        edgeList.add(E1);
        var E1get = edgeList.get(E1);
        expect(E1).toBe(E1get);
    });

    it("should be able to get an edge by string", () => {
        var edgeList = new jsflap.EdgeList();
        edgeList.add(E1);
        var E1get = edgeList.get(E1.toString());
        expect(E1).toBe(E1get);
    });

    it('should not add duplicate edges', () => {
        var edgeList = new jsflap.EdgeList([E1, E2]);
        expect(edgeList.has(E1)).toBe(true);

        expect(edgeList.has(E1copy)).toBe(true);

        // Try adding a copy edge
        var beforeSize = edgeList.size;
        expect(beforeSize).toBe(2);
        var edgeAdded = edgeList.add(E1copy);

        // Check to make sure it wasn't added and that the original copy is returned
        expect(edgeList.size).toBe(2);
        expect(edgeAdded).toBe(E1);
    });


});