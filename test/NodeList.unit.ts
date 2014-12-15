describe("NodeList", () => {

    var N1, N1copy, N2, N3;

    beforeEach(() => {
        N1 = new jsflap.Node('N1');
        N1copy = new jsflap.Node('N1');
        N2 = new jsflap.Node('N2');
        N3 = new jsflap.Node('N3');
    });

    it("should exist", () => {
        var nodeList = new jsflap.NodeList();
        expect(typeof nodeList !== 'undefined').toBe(true);
    });

    it("should be able to add nodes", () => {
        var nodeList = new jsflap.NodeList([N1, N2]);
        expect(nodeList.has(N1)).toBe(true);
        expect(nodeList.has(N2)).toBe(true);
        expect(nodeList.size).toBe(2);
    });

    it("should be able to get an node by reference", () => {
        var nodeList = new jsflap.NodeList();
        nodeList.add(N1);
        var N1get = nodeList.get(N1);
        expect(N1).toBe(N1get);
    });

    it("should be able to get an node by string", () => {
        var nodeList = new jsflap.NodeList();
        nodeList.add(N1);
        var N1get = nodeList.get(N1.toString());
        expect(N1).toBe(N1get);
    });

    it("should not be able to add duplicate nodes", () => {
        var nodeList = new jsflap.NodeList([N1]);
        expect(nodeList.has(N1)).toBe(true);
        expect(nodeList.has(N1copy)).toBe(true);

        // Try adding a copy node
        var beforeSize = nodeList.size;
        expect(beforeSize).toBe(1);
        var nodeAdded = nodeList.add(N1copy);

        // Check to make sure it wasn't added and that the original copy is returned
        expect(nodeList.size).toBe(1);
        expect(nodeAdded).toBe(N1);
    });


});