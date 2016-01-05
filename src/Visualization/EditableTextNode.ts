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
        
        public offset: number[] = [3, 6];
        
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
            //window.a = this.textNode;
            //this.textNode.setAttribute("fill", "red");
            
            // Setup params
            var position = this.textNode.getClientRects()[0];
            var bbox = this.textNode.getBBox();
            var boundingClientRect = this.textNode.getBoundingClientRect();
            var el = d3.select(this.textNode);
            var containerElm = document.createElement("div");
            this.board.getContainer().appendChild(containerElm);
            var container = d3.select(containerElm);
            var self = this;
            
            // Initalize styles
            var fontSize = this.textNode.style.fontSize;
            var fontWeight = this.textNode.style.fontWeight;
            var lineHeight = this.textNode.style.lineHeight;
            var width = (position.width + (2 * this.padding));
            
            // Force a minimum width of 20
            if(width < 20) {
                width = 20;
            }
            
            var height = bbox.height + (2 * this.padding);
            
            var x = position.left - this.padding + this.offset[0],
                y = position.top - this.padding - 45 + this.offset[1];
                // 45 is the top padding the 'position: absolute' is off by and the offset is use for line-height issues
                
            //x = boundingClientRect.left - this.padding;
            //y = boundingClientRect.top - this.padding - 45; 
            
            var textContainer = (<SVGTextElement> this.textNode.parentNode);
            var angle = 0;
            if((<any>textContainer.transform.baseVal).length > 0 && textContainer.transform.baseVal[0].angle != null) {
                angle = textContainer.transform.baseVal[0].angle;
                
                // Adjust the offsets based on the angle from 0
                var xOffsetAdjust =  this.offset[0] * Math.sin((angle * Math.PI) / 180);
                var yOffsetAdjust =  this.offset[1] * Math.sin((angle * Math.PI) / 180);
                x += xOffsetAdjust;
                y += yOffsetAdjust;
            }
            
            //transform:rotate("+ angle +"deg);
            var styleString = "transform:rotate("+ angle +"deg); width: " + width + "px; height: " + height + "; text-align: center; border: none; padding: " + this.padding +"px; outline: none; background-color: #fff; border-radius: 3px; font-size:" + fontSize +"; font-weight:" + fontWeight + "; line-height:" + lineHeight + "; position: absolute; left:" + x + "px; top: " + y + "px;";

            var inp = container
                .append("form")
                .append("input")
                .attr("value", function() {
                    self.inputField = this;
                    setTimeout(function() {
                        self.inputField.focus();
                        self.inputField.select();
                    }, 5);
                    self.board.state.editableTextInputField = this;
                    return self.value;
                })
                .attr("style", styleString)
                .attr("maxlength", this.maxLength);

            inp.transition()
            .style('background-color', this.backgroundColor);
            
            var completed = false;

            inp
                .on("blur", function(event) {
                    self.value = this.value;
                    if(!completed) self.onComplete(false);
                    completed = true;
                    //debugger;
                    // TODO: Look into why the forigen object is removed here but not in the keyup function
                    container.remove();
                    self.board.state.editableTextInputField = null;
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
                    if (e.keyCode == 13 || e.keyCode == 27 || this.value.length === self.maxLength) {
                        if (e.stopPropagation)
                            e.stopPropagation();
                        e.preventDefault();
                        //inp.on("blur", null);
                        
                        // Set the object's model from the dom object's one.
                        self.value = this.value;
                        if(completed || self.onComplete(true)) {
                            completed = true;
                            // Leave the field up if the completion was invalid
                            this.remove();
                            self.board.state.editableTextInputField = null;
                        } else {
                            // TODO: Show more error feedback
                            self.showError(inp);
                        }
                    }
                });
        }
	}
}