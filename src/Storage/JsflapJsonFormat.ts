module jsflap.Storage {
    
    /**
     * The Base json format for storage
     */
    export interface JsflapJsonBaseFormat {
        /**
         * The version of the format stored
         */
        version: number;
    }
    
    ///////////// VERSION 1 /////////////
      
    /**
     * The Reprentation of 
     */
    export interface JsflapJsonFormatV1BoardNode {
        
        /**
         * The label that this node visualization is representing 
         */
        model: string;
        
        /**
         * The position of the node
         */
        position: {
            x: number;
            y: number;
        }
    }
    
    /**
     * The representation of a Jsflap session, version 1
     */
    export interface JsflapJsonFormatV1 extends JsflapJsonBaseFormat {
        
        /**
         * The title of the graph
         */
        title: string;
        
        /**
         * The graph's toString() serialization
         */
        graph: string;
        
        /**
         * The board serialization
         */
        board: {
            
            /**
             * The list of node positions on the board
             */
            nodes: {
        
                /**
                 * The label that this node visualization is representing 
                 */
                model: string;
                
                /**
                 * The position of the node in x/y offsets
                 */
                position: {
                    x: number;
                    y: number;
                }
            }[],
            
            /**
             * The list of modified control points
             */
            controlPoints: {
                
                /**
                 * The node that edge starts from
                 */
                from: string;
                
                /**
                 * The node that the edge goes to
                 */
                to: string;
                
                /**
                 * The position of the node in x/y offsets
                 */
                position: {
                    x: number;
                    y: number;
                }
            }[],
            
            /**
             * Stored board settings
             */
            boardSettings: {
                
                /**
                 * The selected theme
                 */
                theme: string;
                
                /**
                 * The style of the transitions
                 */
                transitionStyle: number; // Board.TransitionStyle
            }
        }   
    }
}