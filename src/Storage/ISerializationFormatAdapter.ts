module jsflap.Storage {
    
    import IGraph = Graph.IGraph;
    
    export interface jsflapAppController {
        board: Board.Board;
        graph: IGraph;
        machine: Machine.IMachine;
        setGraph(graph: IGraph): void;
    }
    
    /**
     * Specifies the format for serailization and unserialization
     */
    export interface ISerializationFormatAdapter {
        
        /**
         * Saved the state of the app in a string form
         */
        serialize(app: jsflapAppController): string;
        
        /**
         * Load the input string into the app
         */
        unserialize(app: jsflapAppController, input: string): void;
    }
}