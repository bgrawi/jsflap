module jsflap.Transition {
    
    export interface EditableTransitionPartUpdateFn {
        (newContent: string, transition: ITransition): void;
    }

    /**
     * An editable transition part
     */
    export class EditableTransitionPart implements ITransitionPart {
        
        public onEdit: EditableTransitionPartUpdateFn;
        
        constructor(content: string, onEdit: EditableTransitionPartUpdateFn) {
            this.content = content;
            this.onEdit = onEdit;
        }
        
        public content: string;
    }

}