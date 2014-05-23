
var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A view which reveals stecnil directives and allows for editing
	 */
	var RevealView = Stencils.RevealView = function(write){
		var content = this.content = $('main#content');
		// Add class and contenteditable
		content.addClass('reveal');
		content.attr('contenteditable','true');
		// Bind events
		toolBindings(content);
	};

	/**
	 * Close the view
	 */
	RevealView.prototype.close = function(){
		var content = this.content;
		// Remove class and contenteditable
		content.removeClass('reveal');
		content.removeAttr('contenteditable');
		// Remove all event handlers
		content.off();
		// Remove all decorator elements that have been added
		$('[class*="reveal-"]').remove();
	};

	/**
	 * Send stencil's HTML content to the view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	RevealView.prototype.to = function(html){
		// Do NormalView `to()` for MathJax typesetting etc
		Stencils.NormalView.prototype.to.call(this,html)
		// Remove any existing tools
		$('.reveal-tool').remove();
	};

	/**
	 * Get stencil's HTML content from the view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	RevealView.prototype.from = function(){
		// Do NormalView `from()` for MathJax un-typesetting etc
		return Stencils.NormalView.prototype.from.call(this);
	};

	/**
	 * Definitions for the opening and closing of tools for
	 * stencil directives. These are used in `toolBindings()`
	 */
	var tools = {
		'[data-text]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-text');
				tool.append('text <span class="reveal-tool-arg reveal-tool-arg-expr text_" contenteditable="true">' + element.attr('data-text') + '</span>');
			},
			close : function(tool,element){
				element.attr('data-text',tool.find('.text_').text());
			}
		},
	};

	/**
	 * Bind tools to stencil directives
	 */
	function toolBindings(content){
		$.each(tools,function(selector,options){
			// Options can be a closure so check for than
			// and call if needed
			if(options instanceof Function){
				options = options();
			}
			// On mouseover delegation.
			content.on('mouseover',selector,function(){
				var element = $(this);
				if(!element.data('tooled')){
					// Create the tool
					var tool = $(
						'<div class="reveal-tool-container">' +
							'<div class="reveal-tool">' +
								'<i></i>' +
							'</div>' +
							'<div class="reveal-tool-pointer"></div>' +
						'</div>'
					);
					tool.css("position","absolute");
					tool.css("z-index","100");
					tool.appendTo(document.body);
					// Open the tool
					options.open(tool.find('.reveal-tool'),element);
					// Position the tool
					var position = element.offset();
					position.top = Math.max(10,position.top - tool.outerHeight() - 1);
					position.left = Math.max(10,position.left + element.outerWidth()*0.5 - tool.outerWidth()*0.5);
					tool.offset(position);
					// Indicate this element already has a tool
					// so another mouseover does not create another tool
					element.data('tooled',true);
					// Variable to indicate if the tool is activated
					// by a click and so should not disappear on a mouseout
					var activated = false;
					// Function inside this closure used 
					// that is used a couple of times below
					var toolDestroy = function(){
						options.close(tool,element);
						tool.remove();
						element.data('tooled',false);
						element.off();
					};
					// Bind mouseout on element
					element.on('mouseout',function(){
						// Remove the tool?
						if(!activated){
							// Give some time to mouseover tool
							setTimeout(function(){
								if(!activated) toolDestroy();
							},10);
						}
					});
					// Bind click on element
					element.on('click',function(){
						if(!activated) activated = true;
						else toolDestroy();
						// Prevent event propogating to the main
						// document so this is not considered an outside click
						event.stopPropagation();
					});
					// Bind click on tool
					tool.on('click',function(event){
						if(!activated) activated = true;
						// Prevent event propogating to the main
						// document so this is not considered an outside click
						event.stopPropagation();
					});
					// An event handler that can be referred to in both `on` and `off` below.
					// A click anywhere else in the document...
					var outside = function(event){
						//... removes this tool
						toolDestroy();
						//... unbinds this event
						$(document).off('click',outside);
					};
					$(document).on('click',outside);
				}
			});
		});
	}

	return Stencila;
})(Stencila||{});