module jsflap.Visualization {
    
    import Board = jsflap.Board.Board;
	
	/**
	 * Represents an editable text node in an SVG
     * Adapted from http://bl.ocks.org/GerHobbelt/2653660
	 */
	export class EditableTextNode {
		
		private board: Board;
		
		private textNode: SVGTextElement;
        
        public maxLength: number = 1;
        
        public value: string;
        
        public onComplete: Function = function() {};
        
        public inputField: HTMLInputElement;
        
        public padding: number = 3;
        
        public backgroundColor: string = "#EEE";
        
		
		constructor(board: Board, textNode: SVGTextElement) {
			this.board = board;
            this.textNode = textNode;
		}
        
        /**
         * Renders the editable text box on the screen and sets up listeners
         */
        render() {
            
            // Setup params
            var position = this.textNode.getClientRects()[0];
            var bbox = this.textNode.getBBox();
            console.log(position, bbox);
            var el = d3.select(this.textNode);
            var frm = this.board.getSvg().append("foreignObject");
            var _this = this;
            
            // Initalize styles
            var fontSize = this.textNode.style.fontSize;
            var fontWeight = this.textNode.style.fontWeight;
            var lineHeight = this.textNode.style.lineHeight;
            var width = (position.width + (2 * this.padding));
            
            // Force a minimum width of 20
            if(width < 20) {
                width = 20;
            }

            var inp = frm
                .attr("x", position.left - this.padding)
                .attr("y", bbox.y - this.padding)
                .attr("width", width)
                .attr("height", bbox.height + (2 * this.padding))
                .append("xhtml:form")
                .append("input")
                .attr("value", function() {
                    _this.inputField = this;
                    setTimeout(function() {
                        _this.inputField.focus();
                        _this.inputField.select();
                    }, 5);
                    _this.board.state.editableTextInputField = this;
                    return _this.value;
                })
                .attr("style", "width: " + width + "px; border: none; padding: " + this.padding +"px; outline: none; background-color: #fff; border-radius: 3px; font-size:" + fontSize +"; font-weight:" + fontWeight + "; line-height:" + lineHeight)
                .attr("maxlength", this.maxLength);

            inp.transition()
            .style('background-color', this.backgroundColor);

            inp
                .on("blur", function() {
                    _this.value = this.value;
                    _this.onComplete();
                    
                    // TODO: Look into why the forigen object is removed here but not in the keyup function
                    frm.remove();
                    _this.board.state.editableTextInputField = null;
                })
                .on("keydown", function() {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        e.preventDefault();
                    }
                })
                .on("keyup", function() {
                    var e = d3.event;
                    
                    // Enter/ Escape/ reached end of field
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length === _this.maxLength) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        
                        // Set the object's model from the dom object's one.
                        _this.value = this.value;
                        if(_this.onComplete()) {
                            // Leave the field up if the completion was invalid
                            this.remove();
                            _this.board.state.editableTextInputField = null;
                        } else {
                            // TODO: Show error feedback
                        }
                    }
                });
        }
	}
}