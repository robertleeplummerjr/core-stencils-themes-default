
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
		// Setup tools
		toolsSetup(content);
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
		// Remove any elements added to the document
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
	};

	/**
	 * Get stencil's HTML content from the view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	RevealView.prototype.from = function(){
		// Remove all element styles that have been added
		// by Javascript (e.g. by elemnt.show())
		this.content.find('[style]').each(function(){
			$(this).removeAttr('style');
		});
		// Remove all `reveal-show` classes and ensure that
		// class attribute is not empty
		this.content.find('.reveal-show').each(function(){
			var element = $(this);
			element.removeClass('reveal-show');
			if(element.attr('class')=='') element.removeAttr('class');
		});
		// Remove all decorator elements that have been added to the content
		this.content.find('[class*="reveal-"]').remove();
		// Do NormalView `from()` for MathJax un-typesetting etc
		return Stencils.NormalView.prototype.from.call(this);
	};

	/**
	 * Definitions for the opening and closing of tools for
	 * stencil directives. These are used in `toolsSetup()`.
	 * May be object with `open` and `close` functions or a closure
	 * that returns such an object
	 */
	var tools = {
		'[data-code]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-code');
				tool.append(
					'code <span class="reveal-tool-arg language_" contenteditable="true">' + element.attr('data-code') + '</span>' + 
					' <span class="reveal-tool-code-expand">...</span>'
				);
				var button = tool.find('.reveal-tool-code-expand');
				// The tool's Ace editor which needs to be retained to get its
				// value to put back into the element
				var editorContainer;
				var editor;
				button.click('click',function(){
					if(! button.hasClass('reveal-tool-button-on')){
						// Get attributes of element for use below
						var language = element.attr('data-code');
						var text = element.text();
						// Create an editor <pre> and insert it
						var editorId = Stencila.uniqueId();
						editorContainer = $('<pre class="reveal-code-editor" id="' + editorId + '"></pre>').insertAfter(element);
						// Create an editor attached to the <pre>
						editor = ace.edit(editorId);
						editor.setFontSize(14);
						// Set the language mode
						switch(language){
							case 'r':
								mode = 'r';
								break;
							case 'py':
								mode = 'python';
								break;
							case 'js':
								mode = 'javascipt';
								break;
							default:
								mode = 'text';
								break;
						}
						editor.getSession().setMode('ace/mode/'+mode);
						editor.setValue(text);
						editor.focus();
						editor.gotoLine(0);

						var height = editorContainer.css('height');
						editorContainer
							.css('height','0px')
							.animate({
								'height':height
							});

						button.addClass('reveal-tool-button-on');
					} else {
						element.text(editor.getValue());
						editor.destroy();
						editorContainer.animate({
							'height':'0px'
						},function(){
							editorContainer.remove();
						});

						button.removeClass('reveal-tool-button-on');
					}
				});
			},
			close : function(tool,element){
				element.attr('data-code',tool.find('.language_').text());
			}
		},
		'[data-text]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-text');
				tool.append(
					'text <span class="reveal-tool-arg reveal-tool-arg-expr text_" contenteditable="true">' + element.attr('data-text') + '</span>'
				);
			},
			close : function(tool,element){
				element.attr('data-text',tool.find('.text_').text());
			}
		},
		'[data-with]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-with');
				tool.append(
					'text <span class="reveal-tool-arg reveal-tool-arg-expr with_" contenteditable="true">' + element.attr('data-with') + '</span>'
				);
			},
			close : function(tool,element){
				element.attr('data-text',tool.find('.with_').text());
			}
		},

		'[data-if]' : toolIffy('if'),
		'[data-elif]' : toolIffy('elif'),
		'[data-else]' : toolIffy('else'),

		'[data-for]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-for');
				tool.append(
					'for <span class="reveal-tool-arg reveal-tool-arg-expr for_" contenteditable="true">' + element.attr('data-for') + '</span>' + 
					' <span class="reveal-tool-for-each">each</span>'
				);
				// A `for` directive's `each` child contains content, so we use a button to toggle it's display
				var each = element.find('[data-each]');
				var button = tool.find('.reveal-tool-for-each');
				button.click('click',function(){
					if(! button.hasClass('reveal-tool-button-on')){
						each.show();
						button.addClass('reveal-tool-button-on');
					} else {
						each.hide();
						button.removeClass('reveal-tool-button-on');
					}
				});
			},
			close : function(tool,element){
				element.attr('data-for',tool.find('.for_').text());
			}
		},
		'[data-include]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-include');
				tool.append(
					'for <span class="reveal-tool-arg include_" contenteditable="true">' + element.attr('data-include') + '</span>' + 
					' version <span class="reveal-tool-arg version_" contenteditable="true">' + (element.attr('data-version')||'') + '</span>' + 
					' select <span class="reveal-tool-arg select_" contenteditable="true">' + (element.attr('data-select')||'') + '</span>'
				);
				// A `include` directive's `set` children are simply expressions so they are represented in the tool
				var sets = element.find('[data-set]');
				if(sets.length>0){
					var ul = $('<ul class="reveal-tool-include-sets" />').appendTo(tool);
					sets.each(function(){
						var set = $(this);
						ul.append('<li class="reveal-tool-arg reveal-tool-include-set set_" contenteditable="true">' + set.attr('data-set') + '</li>');
					});
				}
			},
			close : function(tool,element){
				element.attr('data-include',tool.find('.include_').text());
				element.attr('data-version',tool.find('.version_').text());
				element.attr('data-select',tool.find('.select_').text());
				// Remove existing `set`s and replace with those in tool
				element.find('[data-set]').remove();
				// Add `set`s at the top of the element in order
				var after;
				tool.find('.set_').each(function(){
					var set = $(this);
					var div = $('<div data-set="' + set.text() + '"></div>');
					if(after) div.insertAfter(after);
					else {
						div.prependTo(element);
						after = div;
					}
				})
			}
		}
	};

	/**
	 * Function to generate tool options for "iffy" type directives i.e. if, elif, else
	 * @param  {String} type if, elif or else
	 */
	function toolIffy(type){
		return {
			open : function(tool,element){
				// Add class and expression box
				tool.addClass('reveal-tool-'+type);
				tool.append(type);
				if(type!='else'){
					tool.append(
						' <span class="reveal-tool-arg reveal-tool-arg-expr condition_" contenteditable="true">' + element.attr('data-'+type) + '</span>'
					);
				}
				if(element.attr('data-off')=='true'){
					tool.append(' <span class="reveal-tool-off">off</span>')
				} else {
					tool.append(' <span class="reveal-tool-on">on</span>')
				}
				tool.append(' <span class="reveal-tool-show">...</span>');
				// Any of these directives may be off if the condition is false, so allow for them to be shown
				var button = tool.find('.reveal-tool-show');
				button.click('click',function(){
					if(! button.hasClass('reveal-tool-button-on')){
						element.addClass('reveal-show');
						button.addClass('reveal-tool-button-on');
					} else {
						element.removeClass('reveal-show');
						button.removeClass('reveal-tool-button-on');
					}
				});
			},
			close : function(tool,element){
				if(type!='else') element.attr('data-'+type,tool.find('.condition_').text());
			}
		};
	}

	/**
	 * Bind tools to stencil directives
	 */
	function toolsSetup(content){
		$.each(tools,function(selector,options){
			// On mouseover delegation.
			// This is bound to content (rather than document) because we use
			// `content.off()` when closing this view to unbind all events.
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
					// Options can be a closure so check for that
					// and call if needed
					if(options instanceof Function) options = options();
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