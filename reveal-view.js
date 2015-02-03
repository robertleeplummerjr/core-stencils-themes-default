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

		if(self.stencil.writeable()){
			// Apply Medium.js for WYSIWYG editing
			self.wysiwyg = new Medium({
				element: content.get(0),
				placeholder: 'In the beginning...',
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

			// Mark any node which gets edited by the user so that it is locked for future renderings
			// 
			// The `input` event is fired on the contentediable element, so need
			// to use `selected.node` to get the actual element (binding `input` to a child event of `#content`
			// will not work)
			//
			// This is currently turned off pending further analysis of requirements in this area of user
			// overriding of directives
			// 
			//content.on('input',function(event){
			//	var element = $(selected.node());
			//	element.attr('data-lock','true');
			//});
		}

		// Setup tools
		self._setupTools();

		// Create an invoke tool
		var tool = $(
			'<div class="reveal-invoke-container">' +
				'<div class="reveal-invoke">' +
					'<ul></ul>' +
				'</div>' +
			'</div>'
		);
		var ul = tool.find("ul");
		// Add each directive to tool and setup key bindings		
		$.each([{
				name:'strong',
				icon:'bold',
				help:'Bold the selection'
			},{
				name:'em',
				icon:'italic',
				help:'Italicize the selection'
			},{
				name:'u',
				icon:'underline',
				help:'Underline the selection'
			},{
				name:'strike',
				icon:'strikethrough',
				help:'Strike the selection'
			},{
				name:'code',
				icon:'code',
				help:'Format the selection as code'
			}
		],function(index,element){
			var invoke = function(event){
				event.preventDefault();
				self.wysiwyg.focus();
				self.wysiwyg.invokeElement(element.name);
			};
			$(
				'<li>' +
					'<a href="" title="' + element.help + '">'+
						'<i class="fa fa-' + element.icon + '"></i>' +
					'</a>' +
				'</li>'
			).appendTo(ul).find('a').click(invoke);
		});
		tool.appendTo(document.body);

		// Setup insertion commands
		self._setupInserts();
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
	 * Set up an array of directive objects to be used below
	 *
	 * html: html to insert
	 * key: insert key shortcut
	 * 		Under Chrome not all ctrl+shift+<key> combinations seem to work
	 * 		These were arrived at after some experimentation
	 */
	RevealView.prototype.directives = [{
			name: 'exec',
			selector: '[data-exec]',
			html: '<pre data-exec="r">\n</pre>',
			icon: 'chevron-circle-left',
			help: 'Execute code in the stencil\'s context',
			keys: 'ctrl+shift+e'
		},{
			name: 'write',
			selector: '[data-write]',
			html: '<span data-write=""></span>',
			icon: 'chevron-circle-left',
			help: 'Write a variable to the stencil',
			keys: 'ctrl+shift+y'
		},{
			name: 'with',
			selector: '[data-with]',
			html: '<span data-with=""></span>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+u'
		},{
			name: 'if',
			selector: '[data-if]',
			html: '<div data-if=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+8'
		},{
			name: 'elif',
			selector: '[data-elif]',
			html: '<div data-elif=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+9'
		},{
			name: 'else',
			selector: '[data-else]',
			html: '<div data-else=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+0'
		},{
			name: 'switch',
			selector: '[data-switch]',
			html: '<div data-switch=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+s'
		},{
			name: 'case',
			selector: '[data-case]',
			html: '<div data-case=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+a'
		},{
			name: 'default',
			selector: '[data-default]',
			html: '<div data-default=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+d'
		},{
			name: 'for',
			selector: '[data-for]',
			html: '<div data-for=""><div data-each="">...</div></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+f'
		},{
			name: 'include',
			selector: '[data-include]',
			html: '<div data-include=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+i'
		},{
			name: 'set',
			selector: '[data-set]',
			html: '<div data-set=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+o'
		},{
			name: 'macro',
			selector: '[data-macro]',
			html: '<div data-macro=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+m'
		},{
			name: 'par',
			selector: '[data-par]',
			html: '<div data-par=""></div>',
			icon: 'chevron-circle-left',
			help: '',
			keys: 'ctrl+shift+p'
		}
	];

	/**
	 * A selector expression to capture all directives
	 */
	RevealView.prototype.directivesSelector = null;
	var selectors = [];
	for(var i=0;i<RevealView.prototype.directives.length;i++){
		selectors.push(RevealView.prototype.directives[i].selector);
	}
	RevealView.prototype.directivesSelector = selectors.join();

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
	};

	/**
	 * Close the view
	 */
	RevealView.prototype.close = function(){
		var self = this;
		var content = self.content;
		// Remove class
		content.removeClass('reveal');
		// Disable editing
		if(self.wysiwyg) self.wysiwyg.destroy();
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
		self.renderExec();
		// Refresh console
		self.renderConsole();
		// Add contenteditable="false" to elements which should not be edited directly
		self.content.find(
			// Write directives should be edited through tool
			'[data-write],'+
			// Math elements and their MathJax renderings should be edited using tool
			'script[type^="math"], .MathJax,'+
			// Exec directives should be edited using Ace editor
			// If the .ace_editor is not locked then strange things can happen to that
			// editor element when pressing delete in front of it
			'[data-exec], .ace_editor'
		).attr('contenteditable','false');
	};

	/**
	 * Restore the stencil from the view
	 */
	RevealView.prototype.restore = function(){
		var self = this;
		// Restore code directives
		self._restoreExec();
		// Remove all element styles that have been added
		// by Javascript (e.g. by element.show()). But not for
		// `img [data-output]` directives which need style to define their size
		self.content.find('[style]').each(function(){
			var element = $(this);
			if(!(element.prop("tagName").toLowerCase()=="img" & element.attr("data-output")=="true")){
				element.removeAttr('style');
			}
		});
		// Remove all `reveal-show` classes and ensure that
		// class attribute is not empty
		self.content.find('.reveal-show').each(function(){
			var element = $(this);
			element.removeClass('reveal-show');
			if(element.attr('class')==='') element.removeAttr('class');
		});
		// Remove all `contenteditable` atrtributes
		self.content.find('[contenteditable]').each(function(){
			$(this).removeAttr('contenteditable');
		});
		// Remove all decorator elements that have been added to the content
		self.content.find('[class*="reveal-"]').remove();
		// Get all MathJax "jax" elements (e.g. 
		//    <script type="math/asciimath" id="MathJax-Element-2">e=m^2</script>
		// ) and remove the id if it starts with MathJax
		self.content.find('script[type^="math/asciimath"],script[type^="math/tex"]').each(function(){
			var element = $(this);
			if(/^MathJax/.exec(element.attr('id'))) element.removeAttr('id');
		});
		// Remove all MathJax elements which have been added
		self.content.find('.MathJax_Preview, .MathJax').remove();
		// Now update the stencil's HTML
		self.stencil.set('html',self.content.html());
	};

	/**
	 * Directive insertion commands. 
	 * 
	 * Key bindings for inserting directives into a stencil.
	 */
	RevealView.prototype._setupInserts = function(){
		var self = this;
		// Create an insert tool
		var tool = $(
			'<div class="reveal-insert-container">' +
				'<div class="reveal-insert">' +
					'<ul></ul>' +
				'</div>' +
			'</div>'
		);
		var ul = tool.find(".reveal-insert ul");
		// Add each directive to tool and setup key bindings		
		$.each(self.directives,function(index,directive){
			var insert = function(event){
				console.log('insert:'+directive.name);
				event.preventDefault();
				var elem = $(directive.html);
				// Create a new id so that the element inserted with
				// excCommand can be retrieved to trigger mouseove below
				var id = Stencila.uniqueId();
				elem.attr("id",id);
				// Insert elem
				self.wysiwyg.focus();
				self.wysiwyg.insertHtml(elem[0]);
				// Get the newly inserted element and remove its id
				elem = self.content.find('#'+id).removeAttr('id');
				// Trigger a moseover to bring up tool for the directive
				elem.trigger('mouseover');
				if(directive.name=='exec'){
					self.renderExec();
				}
			};
			$(
				'<li>' +
					'<a href="" title="' + directive.help + '">'+
						'<i class="fa fa-' + directive.icon + '"></i>' +
						directive.name +
						'<span class="keys">' + directive.keys + '</span>' +
					'</a>' +
				'</li>'
			).appendTo(ul).find('a').click(insert);
			self.content.bind('keydown',directive.keys,insert);
		});
		tool.appendTo(document.body);
	};

	/**
	 * Refresh `exec` directives
	 */
	RevealView.prototype.renderExec = function(){
		var self = this;
		self.execDirectives = [];
		self.content.find('[data-exec]').each(function(){
			var element = $(this);
			// Get attributes of element for use below
			var language = element.attr('data-exec');
			var format = element.attr('data-format');
			var text = element.text();
			// Create an editor <pre> and insert it
			var editorId = Stencila.uniqueId();
			var tool = $('<pre class="reveal-exec-editor" id="' + editorId + '"></pre>').insertAfter(element);
			if(format) tool.addClass('reveal-exec-editor-out');
			var editor = editorCreate(editorId,language,self.stencil.writeable());
			editor.setValue(text);
			editor.gotoLine(0);
			// Add to list of code editors which can be restored
			// from and destroyed later
			self.execDirectives.push({
				element : element,
				tool : tool,
				editor : editor
			});
		});
	};

	/**
	 * Restore code directives
	 */
	RevealView.prototype._restoreExec = function(){
		var self = this;
		$.each(self.execDirectives,function(index,directive){
			directive.element.text(
				directive.editor.getValue()
			);
			directive.editor.destroy();
			directive.tool.remove();
		});
		self.execDirectives = [];
	};

	/**
	 * Refresh console element
	 */
	RevealView.prototype.renderConsole = function(){
		var self = this;
		var console = self.content.find('#console');
		if(console.size()>0) self.console = new ConsoleTool(self.stencil,self,console);
	};

	RevealView.prototype.ensureConsole = function(){
		var self = this;
		var console = self.content.find('#console');
		if(console.size()==0) self.content.append('<div id="console"></div>');
		self.renderConsole();
	};

	/**
	 * Definitions for the opening and closing of tools for
	 * stencil directives. These are used in `toolsSetup()`.
	 * May be object with `open` and `close` functions or a closure
	 * that returns such an object
	 */
	var tools = {
		'[data-when]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-when');
				tool.append(
					'when <span class="reveal-tool-arg reveal-tool-arg-expr when_" contenteditable="true">' + element.attr('data-when') + '</span>'
				);
			},
			close : function(tool,element){
				element.attr('data-when',tool.find('.when_').text());
			}
		},
		'[data-write]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-write');
				tool.append(
					'write <span class="reveal-tool-arg reveal-tool-arg-expr write_" contenteditable="true">' + element.attr('data-write') + '</span>'
				);
				tool.append(
					'<a class="reveal-tool-action reveal-crush" title="Remove the write directive from this element"><i class="fa fa-eraser"></i></a>'+
					'<a class="reveal-tool-action reveal-delete" title="Delete this element"><i class="fa fa-trash"></i></a>'
				);
				tool.find('.reveal-crush').click(function(event){
					event.preventDefault();
					// Remove attributes from element
					element.removeAttr('data-write');
					element.removeAttr('contenteditable');
					// Remove write_ class as an indicator that when this tool closes
					// a `data-write` attribute should not be added
					tool.find('.write_').removeClass('write_');
				});
				tool.find('.reveal-delete').click(function(event){
					event.preventDefault();
					element.remove();
				});
			},
			close : function(tool,element){
				var write = tool.find('.write_');
				if(write.length) element.attr('data-write',tool.find('.write_').text());
			}
		},
		'.MathJax' : {
			open : function(tool,element){
				var frame_id = element.attr('id');
				var script_id = frame_id.replace('-Frame','');
				var script = $('#'+script_id);
				var type = script.attr('type');
				var label;
				if(type.indexOf("asciimath")>-1) label = 'ASCIIMath';
				else label = 'LaTeX';
				var source = script.text();
				tool.addClass('reveal-tool-math');
				tool.append(
					label+' <span class="reveal-tool-arg reveal-tool-arg-expr source_" contenteditable="true">' + source + '</span>'
				);
			},
			close : function(tool,element){
				var frame_id = element.attr('id');
				var script_id = frame_id.replace('-Frame','');
				var script = $('#'+script_id);
				// Set the script text
				script.text(tool.find('.source_').text());
				// Update the script element so it gets rerenderd
				MathJax.Hub.Queue(["Update",MathJax.Hub,script[0]]);
			}
		},
		'[data-with]' : {
			open : function(tool,element){
				tool.addClass('reveal-tool-with');
				tool.append(
					'with <span class="reveal-tool-arg reveal-tool-arg-expr with_" contenteditable="true">' + element.attr('data-with') + '</span>'
				);
			},
			close : function(tool,element){
				element.attr('data-with',tool.find('.with_').text());
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
	RevealView.prototype._setupTools = function(){
		var self = this;
		$.each(tools,function(selector,options){
			// On mouseover delegation.
			// This is bound to content (rather than document) because we use
			// `content.off()` when closing this view to unbind all events.
			self.content.on('mouseover',selector,function(){
				var element = $(this);
				if(!element.data('tooled')){
					// Create the tool
					var tool = $(
						'<div class="reveal-tool-container">' +
							'<div class="reveal-tool">' +
								'<i></i>' +
								'<div class="reveal-tool-info"></div>' +
								'<div class="reveal-tool-error"></div>' +
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
					var info = tool.find('.reveal-tool-info');
					options.open(info,element);
					// Add errors
					var error = element.attr("data-error");
					if(error){
						tool.find('.reveal-tool-error').text(error);
					}
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
					// Function inside this closure
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
	};

	var ConsoleTool = Stencils.ConsoleTool = function(stencil,view,element){
		var self = this;
		self.stencil = stencil;
		self.view = view;
		self.element = element;
		self.language = 'r';

		self.history = element.find('.history li');
		self.position = null;

		// Create tool
		var tool = $(
			'<div class="reveal-console" contenteditable="false">' +
				'<div class="reveal-console-header">' +
					'<span class="reveal-console-label"><i class="fa fa-terminal"></i>Console</span>' +
					'<div class="reveal-console-actions">' +
						'<a href="" class="reveal-console-insert">Code</a>' +
						'<a href="" class="reveal-console-insert">Text</a>' +
						'<a href="" class="reveal-console-insert">Table</a>' +
						'<a href="" class="reveal-console-insert">Figure</a>' +
					'</div>' +
				'</div>' +
				'<pre class="reveal-console-editor" id="reveal-console-editor"></pre>' +
				'<pre class="reveal-console-result"></pre>' +
			'</div>'
		).insertAfter(self.element);

		// Create an editor and override key bindings 
		var editor = self.editor = editorCreate('reveal-console-editor',self.language,true);
		editor.keyBinding.originalOnCommandKey = editor.keyBinding.onCommandKey;
		editor.keyBinding.onCommandKey = function(event, hashId, keyCode) {
			if(keyCode==13){
				event.preventDefault();
				self.execute();
			}
			else if(event.keyCode==38){
				event.preventDefault();
				self.up();
			}
			else if(event.keyCode==40){
				event.preventDefault();
				self.down();
			}
			else {
				return this.originalOnCommandKey(event, hashId, keyCode);
			}
		};

		// Create a result element
		self.result = tool.find('.reveal-console-result');

		// Bind insert link
		tool.find('.reveal-console-insert').click(function(event){
			event.preventDefault();
			self.insert();
		});
	};

	ConsoleTool.prototype.execute = function(){
		var self = this;
		// Clear result
		self.result.removeClass('error');
		self.result.html("");
		// Get and execute source code
		var source = self.editor.getValue();
		self.stencil.call('interact(string):string',[source],function(returned){
			var code = returned.substring(0,1);
			var output = returned.substring(1);
			if(code=='E'){
				self.result.addClass('error');
				self.result.text(output);
			}
			else if(code=='I') self.result.append('<img src="'+output+'">');
			else{
				self.result.text(output);
			}
			self.result.attr('data-type',code);
			// Add an item to the history
			var hist = self.element.find('.history');
			if(hist.size()===0) hist = $('<ul class="history"></ul>').appendTo(self.element);
			hist.prepend(
				'<li>' +
					'<pre class="source">' + source + '</pre>' +
					'<pre class="result">' + self.result.html() + '</pre>' +
				'</li>'
			);
			// Update the history and position
			self.history = self.element.find('.history li');
			if(self.history.size()>100) self.history.last().remove();
			self.position = null;
		});
	};

	ConsoleTool.prototype.restore = function(){
		var self = this;
		var entry = $(self.history[self.position]);
		self.editor.setValue(entry.find('.source').text());
		self.result.html(entry.find('.result').html());
	};

	ConsoleTool.prototype.up = function(){
		var self = this;
		if(self.position>=0){
			self.position += 1;
			if(self.position>self.history.size()-1) self.position = self.history.size()-1;
		}
		else self.position = 0;
		self.restore();
	};

	ConsoleTool.prototype.down = function(){
		var self = this;
		self.position -= 1;
		if(self.position<0) self.position = 0;
		self.restore();
	};

	ConsoleTool.prototype.insert = function(event){
		var self = this;
		// Hack to get Medium to insert. You need to have cursor in 
		// content when this is clicked
		Medium.activeElement = self.view.wysiwyg.element;
		// Insert code and result
		var insert;
		var code = $('<pre data-code="'+self.language+'"></pre>');
		code.text(self.editor.getValue());
		var type = self.result.attr('data-type');
		if(type==='I'){
			insert = $('<figure></figure>');
			code.attr("data-format","png");
			insert.append(code);
			var img = self.result.find('img');
			img.attr("data-out","true");
			insert.append(img);
		}
		else {
			insert = code;
		}
		self.view.wysiwyg.insertHtml(insert.get(0));
		// Refresh the view now content has been added
		self.view.renderExec();
	};

	/**
	 * Create a code editor for this view
	 *
	 * A private function to ensure consistency across applications
	 * within this view
	 */
	editorCreate = function(id,language,writeable){
		var editor = ace.edit(id);
		editor.setFontSize(16);
		editor.setTheme("ace/theme/monokai");
		// Set read/write
		editor.setReadOnly(!writeable);
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
		return editor;
	};

	return Stencila;
})(Stencila||{});