module jsflap.Transition {

    /**
     * A non-editable transition part
     */
    export class StaticTransitionPart implements ITransitionPart {
        
        constructor(content: string) {
            this.content = content;
        }
        
        public content: string;
    }

}