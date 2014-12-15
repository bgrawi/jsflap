module jsflap.Machine {

    export class FAMachineState implements IMachineState {

        /**
         * The current input string of the machine
         */
        public currentInput: string;

        public currentState: Node;

        /**
         * Create a new NFA Machine state
         * @param currentInput
         * @param currentState
         */
        constructor(currentInput: string, currentState: Node) {
            this.currentInput = currentInput;
            this.currentState = currentState;
        }
    }
}