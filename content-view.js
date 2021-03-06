// ACE editor : HTML and Cila editing
include('/core/themes/base/requires/ace/ace.js',function(){
	// Emmet extension : HTML editing shortcuts
	include('/core/themes/base/requires/ace/ext-emmet.js',function(){
		ace.require("ace/ext/emmet");
	});

	var define = ace.define;
	var require = ace.require;
	
	define('ace/mode/cila_highlight_rules', function(require, exports, module) {
		var oop = require("ace/lib/oop");
		var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
		var RHighlightRules = require("ace/mode/r_highlight_rules").RHighlightRules;
		var PythonHighlightRules = require("ace/mode/python_highlight_rules").PythonHighlightRules;

		var CilaHighlightRules = function() {
			/*
			For each token/regex pair it is necessary to have an array of tokens that is the same
			length as the number of regex groups. 
			If you don't capture content in a group then it won't appear in the editor 
			i.e. capture everything!
			It is possible to use non-capturing groups ('(?:x)') within a group
			to reduce the total number of groups.
			For help on Javascript regexes...
				https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
			 */
			this.$rules = {
				'start': [
					{
						token: [
						    'constant.language',
						    'text'
						],
						regex: 
						    '^('+
						        'section|nav|article|aside|address|h1|h2|h3|h4|h5|h6|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|' +
								'figure|figcaption|div|a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|' +
								'rt|rp|bdi|bdo|span|br|wbr|ins|del|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th' + 
						    ')(?:( +)|$)'
					},

					// Directives with no argument
					// else,default
					{
						token: [
						    'keyword'
						],
						regex:
						    '(else|default)$'
					},
					
					// Directives with a single expression argument
					// text,with,if,elif,switch,case
					{
						token: [
						    'keyword','text','string'
						],
						regex:
						    '(text|ref|with|if|elif|switch|case)( +)(.+)$'
					},
					
					// Directive for
					{
						token: [
						    'keyword','text','string','text','keyword','text','string'
						],
						regex:
						    '(for)( +)(.+?)( +)(in)( +)(.+)$'
					},

					// Directive include
					{
						token: [
						    'keyword','text','string',
						    'text','keyword','text','string',
						    'text','keyword','text','string'
						],
						regex: 
						    '(include)( +)(.+?)' +
						    '(?:( +)(version)( +)(.+?))?' + 
						    '(?:( +)(select)( +)(.+?))?' + 
						    '$'
					},
					
					{
						// Declaration flags: const, edit
						token: 'keyword',
						regex: '\\s*(const|edit)'
					},
					{
						// Information flags: hash, index
						token: 'comment',
						regex: '\\s*((&[a-zA-Z0-9]+)|(@\\d+))'
					},
					
					
					/*
					{
						token: 'keyword',
						regex: '^r\\s*$',
						next: 'r-start'
					}
					*/
				]
			};
			/*
			this.embedRules(RHighlightRules, "r-", [{
				token : "text",
				regex: "^$",
				next  : "start"
			}]);
			*/
		};
		oop.inherits(CilaHighlightRules, TextHighlightRules);

		exports.CilaHighlightRules = CilaHighlightRules;
	});
	
	ace.define('ace/mode/cila', function(require, exports, module) {
		var oop = ace.require("ace/lib/oop");
		var TextMode = ace.require("ace/mode/text").Mode;
		var CilaHighlightRules = ace.require("ace/mode/cila_highlight_rules").CilaHighlightRules;

		var Mode = function() {
			this.HighlightRules = CilaHighlightRules;
		};
		oop.inherits(Mode, TextMode);

		(function() {
			this.$id = "ace/mode/cila";
		}).call(Mode.prototype);

		exports.Mode = Mode;
	});

});
// Emmet tookit : HTML editing shortcuts
include('/core/themes/base/requires/emmet.js');

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * Base view for stencil views that deal with stencil content
	 */
	var ContentView = Stencils.ContentView = function(stencil,format){
		var self = this;

		self.stencil = stencil;
		self.format = format || 'html';
	};

	/**
	 * Updating the view
	 */
	ContentView.prototype.updating = function(which){
		if(which=='start'){
			var indicator = $(
				'<div class="updating" title="Updating" style="opacity: 0;">' +
					'<i class="fa fa-spin fa-spinner"></i>' +
				'</div>'
			).appendTo('body');
			$('#content').animate({
				opacity: 0
			});
			indicator.animate({
				opacity: 1
			});
		} else {
			var indicator = $('body .updating')
			indicator.animate({
				opacity: 0
			});
			$('#content').animate({
				opacity: 1
			},function(){
				indicator.remove();
			});
		}
	}

	/**
	 * Bind events
	 */
	ContentView.prototype.bind = function(){
		var self = this;
		
		// Ace intercepts special "command" keys including the ones
		// that we use to change views so get around that here...
		var editor = self.editor;
		if(editor){
			editor.keyBinding.originalOnCommandKey = editor.keyBinding.onCommandKey;
			editor.keyBinding.onCommandKey = function(event, hashId, keyCode) {
				if(keyCode==117 || keyCode==118 || keyCode==119 || keyCode==120){
					if(keyCode==117) self.stencil.viewChange(Stencils.NormalView);
					else if(keyCode==118) self.stencil.viewChange(Stencils.RevealView);
				}
				else {
					return this.originalOnCommandKey(event, hashId, keyCode);
				}
			};
		}
	};

	/**
	 * Unbind events
	 */
	ContentView.prototype.unbind = function(){
		$('body').off();
	};

	return Stencila;
})(Stencila||{});
