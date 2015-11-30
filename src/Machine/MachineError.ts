module jsflap.Machine {

    export class MachineError {
        
        private message: string;
        
        constructor(message: string) {
            this.message = message;
        }
        
        toString() {
            return this.message;
        }
    }
}