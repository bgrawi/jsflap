module jsflap.Machine {

    export interface IMachineState {
        isFinal(): boolean;
        toString(): string;
    }
}