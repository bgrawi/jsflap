describe("Node", () => {

    it("should exist", () => {
        var node = new jsflap.Node('N1');
        expect(typeof node !== 'undefined').toBe(true);
    });
});