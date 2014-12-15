module jsflap.Machine {

    export interface IMachine<T extends IMachineState> {
        run(input: string): boolean;
    }
}