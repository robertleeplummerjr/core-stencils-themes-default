// Base class
include('/core/components/themes/default/component.js');

// View classes
include('/core/stencils/themes/default/normal-view.js');
include('/core/stencils/themes/default/reveal-view.js');
include('/core/stencils/themes/default/cila-view.js');
include('/core/stencils/themes/default/html-view.js');

// Utilities
include('/core/themes/base/externals/js-beautify.js');

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A Stencil
	 */
	var Stencil  = Stencils.Stencil =  function(){		
		var self = this;
		Stencila.Components.Component.call(self);
		
		// Get the initial Stencil HTML content from the page
		self.html = $('main#content').html();

		// Start with NormalView.
		self.view = new Stencils.NormalView(self);
		self.view.refresh();

		// Change views using F6, F7 etc
		$.each({
			'f6': Stencils.NormalView,
			'f7': Stencils.RevealView,
			'f8': Stencils.CilaView,
			'f9': Stencils.HtmlView,
			'f10': Stencila.Components.BrowseView,
			'f11': Stencila.Components.RepoView,
		},function(key,viewClass){
			$(document).bind('keydown',key,function(event){
				event.preventDefault();
				self.viewChange(viewClass);
			});
		});
	};

	// Deferred inheritance
	init(function(){
		Stencila.extend(
			Stencil,
			Stencila.Components.Component
		);
	});

	Stencil.prototype.html_pull = function(callback){
		var self = this;
		self.call("html():string",[],callback);
	};

	Stencil.prototype.html_set = function(value){
		var self = this;
		self.html = value;
		self.cila = null;
	};

	Stencil.prototype.cila_pull = function(callback){
		var self = this;
		self.call("cila():string",[],callback);
	};

	Stencil.prototype.cila_set = function(value){
		var self = this;
		self.cila = value;
		self.html = null;
	};

	Stencil.prototype.save = function(what,content){
		var self = this;
		if(what=="html"){
			content = content || self.html;
			self.call("html(string)",[content]);
		}
		else if(what=="cila"){
			content = content || self.cila;
			self.call("cila(string)",[content]);
		}
	};

	Stencil.prototype.render = function(what,content){
		var self = this;
		if(what=="html"){
			content = content || self.html;
			self.call("html(string).render().html():string",[content],function(html){
				self.update('html',html);
			});
		}
		else if(what=="cila"){
			content = content || self.cila;
			self.call("cila(string).render().cila():string",[content],function(cila){
				self.update('cila',cila);
			});
		}
	};

	/**
	 * Prettify stencil HTML
	 *
	 * Since a stencil's HML can be modified in many ways other than manual
	 * editing (e.g. by rendering, by conetenteditable) we often prettify it.
	 * This method simply defines standard prettifying options so that it should
	 * always appear the same.
	 */
	Stencil.prototype.htmlBeautify = function(){
		// See https://github.com/einars/js-beautify#css--html
		// for more details on these options
		this.html = html_beautify(this.html,{
			"indent-inner-html":false,//Indent <head> and <body> sections [Should never exist in `html`]
			"indent_size": 4,
			"indent_char": " ",
			"brace_style": "collapse",
			"indent_scripts": "normal",
			"wrap_line_length": 80, //Maximum characters per line
			"preserve_newlines": false, //Preserve existing line-breaks
			"max_preserve_newlines": 0,
			// List of tags (defaults to inline) that should not be reformatted
			"unformatted": [
				// Must not format inline elements because then spaces between e.g. <span>s and following text can be lost
				// This list from https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elemente
				'b', 'big', 'i', 'small', 'tt',
				'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var',
				'a', 'bdo', 'br', 'img', 'map', 'object', 'q', 'script', 'span', 'sub', 'sup',
				'button', 'input', 'label', 'select', 'textarea',
				// Must not format programming code that may be in these tags
				'pre','code','script'
			] 
		});
	};

	return Stencila;
})(Stencila||{});
