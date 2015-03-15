module jsflap.Board.Command {
    export class AbstractCommand implements ICommand {

        /**
         * The board instance
         */
        /* protected */ board: Board;

        constructor(board: Board) {
            this.board = board;
        }

        /* abstract */ execute() {}
        /* abstract */ undo() {}
    }
}