(function(){

var define = ace.define;
var require = ace.require;

define('ace/mode/cila', function(require, exports, module) {
	var oop = require("ace/lib/oop");
	var TextMode = require("ace/mode/text").Mode;
	var CilaHighlightRules = require("ace/mode/cila_highlight_rules").CilaHighlightRules;

	var Mode = function() {
		this.HighlightRules = CilaHighlightRules;
	};
	oop.inherits(Mode, TextMode);

	(function() {
		//this.$id = "ace/mode/cila";
	}).call(Mode.prototype);

	exports.Mode = Mode;
});

define('ace/mode/cila_highlight_rules', function(require, exports, module) {
	var oop = require("ace/lib/oop");
	var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
	//var RHighlightRules = require("ace/mode/r_highlight_rules").RHighlightRules;
	//var PythonHighlightRules = require("ace/mode/python_highlight_rules").PythonHighlightRules;

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
						'constant.language'
					],
					regex:
						'\\b('+
							'section|nav|article|aside|address|h1|h2|h3|h4|h5|h6|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|' +
							'figure|figcaption|div|a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|' +
							'rt|rp|bdi|bdo|span|br|wbr|ins|del|table|caption|colgroup|col|tbody|thead|tfoot|tr|td|th' +
						')\\b'
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

})();