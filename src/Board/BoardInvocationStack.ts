module jsflap.Board {
    import ICommand = Command.ICommand;

    /**
     * The invocation stack for the commands
     */
    export class BoardInvocationStack {

        /**
         * THe actual list of commands
         * @type {Array}
         */
        private commands: Array<ICommand> = [];

        /**
         * The current index we are at in the commands
         * @type {number}
         */
        private currentIndex = -1;

        /**
         * Stores and
         * @param command
         */
        public trackExecution(command: ICommand) {

            // Remove any commands ahead of this one, if at all
            this.commands.splice(this.currentIndex + 1, this.commands.length - this.currentIndex);
            this.commands.push(command);
            this.currentIndex++;
            command.execute();
        }

        /**
         * Undoes the latest command
         */
        public undo() {
            if(!this.hasUndo()) {
                return;
            }
            this.commands[this.currentIndex].undo();
            this.currentIndex -= 1;
        }

        /**
         * Redoes the latest command
         */
        public redo() {
            if(!this.hasRedo()) {
                return;
            }
            this.commands[this.currentIndex + 1].execute();
            this.currentIndex += 1;
        }

        /**
         * If we have commands to undo
         * @returns {boolean}
         */
        public hasUndo() {
            return this.currentIndex !== -1;
        }

        /**
         * If we have commands to redo
         * @returns {boolean}
         */
        public hasRedo() {
            return this.currentIndex < (this.commands.length - 1);
        }
    }
}