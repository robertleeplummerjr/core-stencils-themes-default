// ACE editor : HTML and Cila editing
include('/core/themes/base/externals/ace/ace.js',function(){
	// Emmet extension : HTML editing shortcuts
	include('/core/themes/base/externals/ace/ext-emmet.js',function(){
		ace.require("ace/ext/emmet");
	});

	ace.define('ace/mode/cila_highlight_rules', function(require, exports, module) {
		var oop = ace.require("ace/lib/oop");
		var TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;
		//var RHighlightRules = ace.require("ace/mode/r_highlight_rules").RHighlightRules;
		//var PythonHighlightRules = ace.require("ace/mode/python_highlight_rules").PythonHighlightRules;

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
						token: 'constant.language',
						regex: '^\\s*('+
									'section|nav|article|aside|address|h1|h2|h3|h4|h5|h6|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|' +
									'figure|figcaption|div|a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|' +
									'rt|rp|bdi|bdo|span|br|wbr|ins|del|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th' +
								')((\\s+)|(\\!)|$)'
					},
					{
						token: 'keyword',
						regex: '((^\\s*)|(\\!))(if|switch|text)(\\s+)(.*)'
					},
					{
						token: ['text','keyword','text','string','text','keyword','text','string'],
						regex: '((?:\\s*)|(?:\\!))(for)(\\s+)(.*)(\\s+)(in)(\\s+)(.*)'
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
include('/core/themes/base/externals/emmet.js');

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
