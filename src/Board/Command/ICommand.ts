module jsflap.Board.Command {
    export interface ICommand {
        execute(): void;
        undo(): void;
    }
}