describe("Board", () => {
    var board, svgElm, graph;

    beforeEach(() => {
        svgElm = document.createElement('svg');
        graph = new jsflap.Graph.FAGraph(false);
        board = new jsflap.Board.Board(svgElm, graph, jasmine.createSpyObj('$rootScope', ['$broadcast']));
    });

    it("should exist", () => {
        expect(board).not.toBe(null);
        expect(typeof board !== 'undefined').toBe(true);
    });

});