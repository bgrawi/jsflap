describe("Character Transition", () => {

    it("should exist", () => {
        var transition = new jsflap.Transition.CharacterTransition('a');
        expect(typeof transition !== 'undefined').toBe(true);
    });

    it("should allow an empty string", () => {
        expect(() => {
            new jsflap.Transition.CharacterTransition('');
        }).not.toThrowError();
    });

    it("should not allow a string greater than 1", () => {
        expect(() => {
            new jsflap.Transition.CharacterTransition('ab');
        }).toThrowError();
    });
});
