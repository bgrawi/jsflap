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
         * Shows an error on the input for 1.5 seconds
         */
        private showError(inp: D3.Selection) {
            inp.style('color', "#C3272B");
            setTimeout(function() {
                inp.style('color', "inherit");
            }, 1500);
        }
        
        /**
         * Renders the editable text box on the screen and sets up listeners
         */
        render() {
            window.a = this.textNode;
            
            // Setup params
            var position = this.textNode.getClientRects()[0];
            var bbox = this.textNode.getBBox();
            var boundingClientRect = this.textNode.getBoundingClientRect();
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
            
            var x = position.left - (this.padding),
                y = position.top - (45 - this.padding);
                
            //x = boundingClientRect.left - this.padding;
            //y = boundingClientRect.top - this.padding;
            
            var textContainer = (<SVGTextElement> this.textNode.parentNode);
            var angle = 0;
            if((<any>textContainer.transform.baseVal).length > 0 && textContainer.transform.baseVal[0].angle != null) {
                angle = textContainer.transform.baseVal[0].angle;
                // TODO: Make the position point transformed based on the rotation
                // var positionPoint = (<any> this.board.getSvg().node()).createSVGPoint();
                // positionPoint.x = x;
                // positionPoint.y = y;
                // positionPoint = positionPoint.matrixTransform(this.textNode.getCTM());
                // x = positionPoint.x;
                // y = positionPoint.y;
            }
            
            //transform:rotate("+ angle +"deg);
            var styleString = "width: " + width + "px; text-align: center; border: none; padding: " + this.padding +"px; outline: none; background-color: #fff; border-radius: 3px; font-size:" + fontSize +"; font-weight:" + fontWeight + "; line-height:" + lineHeight + ";";

            var inp = frm
                .attr("x", x)
                .attr("y", y)
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
                .attr("style", styleString)
                .attr("maxlength", this.maxLength);

            inp.transition()
            .style('background-color', this.backgroundColor);
            
            var completed = false;

            inp
                .on("blur", function(event) {
                    _this.value = this.value;
                    if(completed || _this.onComplete(false)) {
                        completed = true;
                    
                        // TODO: Look into why the forigen object is removed here but not in the keyup function
                        frm.remove();
                        _this.board.state.editableTextInputField = null;
                    } else {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                })
                .on("keydown", function() {
                    var e = d3.event;
                    if (e.keyCode == 13 || e.keyCode == 27) {
                        e.preventDefault();
                    }
                })
                .on("keyup", function() {
                    var e = d3.event;
                    
                    // Skip shift/ctrl/meta keys
                    switch(e.keyCode) {
                        case 16:
                        case 17:
                        case 91:
                        case 93:
                        case 224:
                            return;
                        default:
                    }
                    
                    // Enter/ Escape/ reached end of field
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length === _this.maxLength) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        inp.on("blur", null);
                        
                        // Set the object's model from the dom object's one.
                        _this.value = this.value;
                        if(completed || _this.onComplete(true)) {
                            completed = true;
                            // Leave the field up if the completion was invalid
                            this.remove();
                            _this.board.state.editableTextInputField = null;
                        } else {
                            // TODO: Show more error feedback
                            _this.showError(inp);
                        }
                    }
                });
        }
	}
}