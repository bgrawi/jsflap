describe("FA Machine", () => {
    var graph, machine, machineTests;

    beforeEach(() => {
        machineTests = loadConfigurations('FAMachine');

        jasmine.addMatchers({
            toAcceptString: function (util, customEqualityTesters) {

                return {
                    compare: function(machine: jsflap.Machine.FAMachine, input: string) {
                        var result = {
                            pass: false,
                            message: ''
                        };
                        result.pass = machine.run(input);

                        if(result.pass) {
                            result.message = "Expected machine \"" + machine.graph.toString() + "\" to reject the string \"" + input + "\"";
                        } else {
                            result.message = "Expected machine \"" + machine.graph.toString() + "\" to accept the string \"" + input + "\"";
                        }
                        return result;
                    }
                };
            }
        });
    });

    it("should exist", () => {
        graph = new jsflap.Graph.FAGraph(false);
        machine = new jsflap.Machine.FAMachine(graph);
        expect(typeof machine !== 'undefined').toBe(true);
    });

    it('should match all configurations', () => {
        graph = new jsflap.Graph.FAGraph(false);
        machine = new jsflap.Machine.FAMachine();
        machineTests.forEach((configuration: MachineConfiguration, index: number) => {

            // Try to load the configuration, then set the it as the machine's graph
            expect(graph.fromString(configuration.config)).toBe(true);
            machine.setGraph(graph);

            // Try each string that the machine should accept
            configuration.accept.forEach((input: string) => {
                    expect(machine).toAcceptString(input);
            });

            // Try each string that the machine should reject
            configuration.reject.forEach((input: string) => {
                    expect(machine).not.toAcceptString(input);
            });
        });
    });
});