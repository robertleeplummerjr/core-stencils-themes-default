// Base view
include('/core/stencils/themes/default/content-view.js');

// Medium.js: for content editable
// rangy and undo are included first to ensure "domesticated mode"
include('/core/stencils/themes/default/requires/rangy-official/rangy-core.js',function(){
	include('/core/stencils/themes/default/requires/rangy-official/rangy-classapplier.js');
	include('/core/stencils/themes/default/requires/rangy-official/rangy-highlighter.js');
	include('/core/stencils/themes/default/requires/rangy-official/rangy-selectionsaverestore.js');
	include('/core/stencils/themes/default/requires/rangy-official/rangy-serializer.js');
	include('/core/stencils/themes/default/requires/rangy-official/rangy-textrange.js');
	include('/core/stencils/themes/default/requires/undo/undo.js',function(){
		include('/core/stencils/themes/default/requires/medium.js/medium.js');
	});	
});

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A view which reveals stencil directives and allows for WYSIWYG editing
	 */
	var RevealView = Stencils.RevealView = function(stencil){
		var self = this;
		Stencils.ContentView.call(self,stencil);

		var content = self.content = $('main#content');
		// Add class
		content.addClass('reveal');
		// Apply Medium.js for WYSIWYG editing
		self.wysiwig = new Medium({
            element: content.get(0),
            // Define the allowed tags. 
            // This overrides defaults with null = everything allowed.
            // Should probably be refined in the future
            tags:{
				'break': 'br',
				'horizontalRule': 'hr',
				'paragraph': 'p',
            	'outerLevel':null,
            	'innerLevel':null
            },
            // Defines which attributes should be removed. 
            // null = don't remove any
            attributes: null
        });
		// Setup tools
		toolsSetup(content);
		// Setup editing
		editingSetup(content);
		// Setup insertion commands
		insertsSetup(content);
		// Show it (because some other views hide it)
		content.show();

		self.bind();
	};

	init(function(){
		Stencila.extend(
			RevealView,
			Stencils.ContentView
		);
	});

	/**
	 * Close the view
	 */
	RevealView.prototype.close = function(){
		var self = this;
		var content = self.content;
		// Remove class
		content.removeClass('reveal');
		// Disable editing
		self.wysiwig.destroy();
		// Remove all event handlers
		content.off();
		// Remove any elements added to the document
		$('[class*="reveal-"]').remove();
		// Unbind events
		self.unbind();
	};

	/**
	 * Refresh the view
	 */
	RevealView.prototype.refresh = function(){
		var self = this;
		// Do NormalView `refresh()` for MathJax typesetting etc
		Stencils.NormalView.prototype.refresh.call(self);
		// Refresh code directives
		self._refreshCode();
	};

	/**
	 * Restore the stencil from the view
	 */
	RevealView.prototype.restore = function(){
		var self = this;
		// Restore code directives
		self._restoreCode();
		// Remove all element styles that have been added
		// by Javascript (e.g. by element.show())
		self.content.find('[style]').each(function(){
			$(this).removeAttr('style');
		});
		// Remove all `reveal-show` classes and ensure that
		// class attribute is not empty
		self.content.find('.reveal-show').each(function(){
			var element = $(this);
			element.removeClass('reveal-show');
			if(element.attr('class')=='') element.removeAttr('class');
		});
		// Remove all decorator elements that have been added to the content
		self.content.find('[class*="reveal-"]').remove();
		// Do NormalView `restore()` for MathJax un-typesetting etc
		Stencils.NormalView.prototype.restore.call(self);
	};

	/**
	 * Refresh code directives
	 */
	RevealView.prototype._refreshCode = function(){
		var self = this;
		self.codeDirectives = [];
		self.content.find('[data-code]').each(function(){
			var element = $(this);
			// Get attributes of element for use below
			var language = element.attr('data-code');
			var text = element.text();
			// Create an editor <pre> and insert it
			var editorId = Stencila.uniqueId();
			var tool = $('<pre class="reveal-code-editor" id="' + editorId + '"></pre>').insertAfter(element);
			// Create an editor attached to the <pre>
			var editor = ace.edit(editorId);
			editor.setFontSize(16);
			editor.setTheme("ace/theme/monokai");
			// Allow for editor to auto-adjust height based on content
			editor.setOptions({
				minLines : 1,
				maxLines : 100
			});
			// Turn of vertical line
			editor.setShowPrintMargin(false);
			// Add padding before first and after last lines
			editor.renderer.setScrollMargin(5,5,0,0);
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
			// Add to list of code editors which can be restored
			// from and destroyed later
			self.codeDirectives.push({
				element : element,
				tool : tool,
				editor : editor
			});
		});
	}

	/**
	 * Restore code directives
	 */
	RevealView.prototype._restoreCode = function(){
		var self = this;
		$.each(self.codeDirectives,function(index,directive){
			directive.element.text(
				directive.editor.getValue()
			);
			directive.editor.destroy();
			directive.tool.remove();
		});
		self.codeDirectives = [];
	}

	/**
	 * Definitions for the opening and closing of tools for
	 * stencil directives. These are used in `toolsSetup()`.
	 * May be object with `open` and `close` functions or a closure
	 * that returns such an object
	 */
	var tools = {
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

		'[data-if]' : toolConditional('if'),
		'[data-elif]' : toolConditional('elif'),
		'[data-else]' : toolConditional('else'),

		'[data-switch]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-switch');
				tool.append(
					'switch <span class="reveal-tool-arg reveal-tool-arg-expr switch_" contenteditable="true">' + element.attr('data-switch') + '</span>'
				);
			},
			close : function(tool,element){
				element.attr('data-switch',tool.find('.switch_').text());
			}
		},
		'[data-case]' : toolConditional('case'),
		'[data-default]' : toolConditional('default'),

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
					'include <span class="reveal-tool-arg include_" contenteditable="true">' + element.attr('data-include') + '</span>' + 
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
				});
			}
		},

		'[data-macro]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-macro');
				tool.append(
					'macro <span class="reveal-tool-arg macro_" contenteditable="true">' + (element.attr('data-macro')||'') + '</span>'
				);
				// `desc` child is description
				var desc = element.find('[data-desc]');
				if(desc){
					tool.append(
						'<div class="reveal-tool-arg reveal-tool-macro-desc desc_" contenteditable="true">' + desc.html() + '</div>'
					);
				}
				// `param` children are parameters with syntax name[:expression] (ie. expression is optional)
				var params = element.find('[data-param]');
				if(params.length>0){
					var ul = $('<ul class="reveal-tool-macro-params" />').appendTo(tool);
					params.each(function(){
						var param = $(this);
						ul.append('<li class="reveal-tool-arg reveal-tool-macro-param param_" contenteditable="true">' + param.attr('data-param') + '</li>');
					});
				}
			},
			close : function(tool,element){
				var name = tool.find('.macro_').text();
				element.attr('data-macro',name);
				element.attr('id',name);
				// Set `desc` child
				var desc = tool.find('.desc_').html();
				if(desc.length){
					element.find('[data-desc]').remove();
					element.prepend('<div data-desc="">'+desc+'</div>');
				}
				// Remove existing `params`s and replace with those in tool
				// Add `param`s at the top of the element in order
				element.find('[data-param]').remove();
				var after;
				tool.find('.param_').each(function(){
					var param = $(this);
					var div = $('<div data-param="' + param.text() + '"></div>');
					if(after) div.insertAfter(after);
					else {
						div.prependTo(element);
						after = div;
					}
				});
			}
		},

	};

	/**
	 * Function to generate tool options for "conditional" directives i.e. if, elif, else
	 * 
	 * @param  {String} type The type of directive: 'if', 'elif', 'else', 'case' or 'default'
	 */
	function toolConditional(type){
		return {
			open : function(tool,element){
				// Add class and expression box
				tool.addClass('reveal-tool-'+type);
				tool.append(type);
				if(type!='else' && type!='default'){
					tool.append(
						' <span class="reveal-tool-arg reveal-tool-arg-expr condition_" contenteditable="true">' + element.attr('data-'+type) + '</span>'
					);
				}
				if(element.attr('data-off')=='true'){
					tool.append(' <span class="reveal-tool-off">off</span>');
				} else {
					tool.append(' <span class="reveal-tool-on">on</span>');
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
				if(type!='else' && type!='default') element.attr('data-'+type,tool.find('.condition_').text());
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

	/**
	 * Content editing related functions
	 *
	 * Dealing with `contenteditable` is somewhat of a quagmire.
	 * These functions do some normalisation across browsers.
	 */
	var selected = {
		/**
		 * Get the node that is currently selected
		 */
		node : function(){
			if(document.selection) return document.selection.createRange().parentElement();
			else {
				var selection = window.getSelection();
				if(selection.rangeCount>0) return selection.getRangeAt(0).startContainer.parentNode;
			}
		}
	}

	function editingSetup(content){
		// Mark any node which gets edited by the user so that it is locked for furture renderings
		// 
		// The `input` event is fired on the contentediable element, so need
		// to use `selected.node` to get the actual element (binding `input` to a child event of `#content`
		// will not work)
		content.on('input',function(event){
	    	var element = $(selected.node());
			element.attr('data-lock','true');
		});
	};

	/**
	 * Directive insertion commands. 
	 * 
	 * Key bindings for inserting directives into a stencil.
	 */
	var inserts = {
		'ctrl+shift+c' : function(id) { return '<pre id="'+id+'" data-code="">\n</pre>'; },
		'ctrl+shift+t' : function(id) { return '<span id="'+id+'" data-text=""></span>'; },

		'ctrl+shift+w' : function(id) { return '<div id="'+id+'" data-with=""></div>'; },

		'ctrl+shift+8' : function(id) { return '<div id="'+id+'" data-if=""></div>'; },
		'ctrl+shift+9' : function(id) { return '<div id="'+id+'" data-elif=""></div>'; },
		'ctrl+shift+0' : function(id) { return '<div id="'+id+'" data-else=""></div>'; },

		'ctrl+shift+s' : function(id) { return '<div id="'+id+'" data-switch=""></div>'; },
		'ctrl+shift+c' : function(id) { return '<div id="'+id+'" data-case=""></div>'; },
		'ctrl+shift+d' : function(id) { return '<div id="'+id+'" data-default=""></div>'; },

		'ctrl+shift+f' : function(id) {
			return '<div id="'+id+'" data-for=""><div data-each="">...</div></div>';
		},

		'ctrl+shift+i' : function(id) { return '<div id="'+id+'" data-include=""></div>'; },

		'ctrl+shift+m' : function(id) { return '<div id="'+id+'" data-macro=""></div>'; },
		'ctrl+shift+p' : function(id) { return '<div id="'+id+'" data-param=""></div>'; },
	};

	function insertsSetup(content){
		$.each(inserts,function(keys,html){
			content.bind('keydown',keys,function(event){
				event.preventDefault();
				// Create a new id so that the element inserted with
				// excCommand can be retrieved
				var id = Stencila.uniqueId();
				// Insert html for directive with the id
				document.execCommand('insertHTML',false,html(id));
				// Get the newly inserted element and remove its id
				var directive = content.find('#'+id).removeAttr('id');
				// Trigger a moseover to bring up tool for the directive
				directive.trigger('mouseover');
			});
		});
	};



	return Stencila;
})(Stencila||{});