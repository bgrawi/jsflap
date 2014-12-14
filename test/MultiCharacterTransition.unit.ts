describe("MultiCharacter Transition", () => {

    it("should exist", () => {
        var transition = new jsflap.Transition.MultiCharacterTransition('a');
        expect(typeof transition !== 'undefined').toBe(true);
    });

    it("should allow an empty string", () => {
        expect(() => {
            new jsflap.Transition.MultiCharacterTransition('');
        }).not.toThrowError();
    });

    it("should not allow strings greater than 1", () => {
        expect(() => {
            new jsflap.Transition.MultiCharacterTransition('ab');
        }).not.toThrowError();
    });
});
