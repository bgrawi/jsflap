describe("Board", () => {
    var board, svgElm, graph;

    beforeEach(() => {
        svgElm = document.createElement('svg');
        graph = new jsflap.Graph.NFAGraph();
        board = new jsflap.Board(svgElm, graph);
    });

    it("should exist", () => {
        expect(board).not.toBe(null);
        expect(typeof board !== 'undefined').toBe(true);
    });

});