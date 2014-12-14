describe("Base Structure", () => {
    var board, svgElm;

    beforeEach(() => {
        svgElm = document.createElement('svg');
        board = new jsflap.Board(svgElm);
    });

    it("should exist", () => {
        expect(board).not.toBe(null);
        expect(typeof board !== 'undefined').toBe(true);
    });

});