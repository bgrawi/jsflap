module jsflap.Storage {
    
    /**
     * Defines how the app is serialized in the jsflap json format
     */
    export class JsflapJsonSerializationAdapter implements ISerializationFormatAdapter {
        
        /**
         * Saved the state of the app in a string form
         */
        serialize(app: jsflapAppController): string {
            // TODO: Impliment this
            return '';
        }
        
        /**
         * Load the input string into the app
         */
        unserialize(app: jsflapAppController, input: string) {
            // TODO: Impliment this
        }
    }
}