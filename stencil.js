// Base class
include('/core/components/themes/default/component.js');
include('/core/components/themes/default/menu.js');

// View classes
include('/core/stencils/themes/default/normal-view.js');
include('/core/stencils/themes/default/reveal-view.js');
include('/core/stencils/themes/default/cila-view.js');
include('/core/stencils/themes/default/html-view.js');

// Window classes
include('/core/stencils/themes/default/console-window.js');

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

		if(self.dynamic()){
			// Console window always created (so a comand history
			// is recorded) but not always shown
			self.console = new Stencils.ConsoleWindow(self);
		}
		
		// Add menu;
		self.menu = new Stencila.Components.Menu(self);
		//	... views
		self.menu.section();

		self.menu.item('Normal',function(){
			self.viewChange(Stencils.NormalView);
		},{
			icon: 'file-text-o',
			keys: 'F6'
		});

		self.menu.item('Reveal',function(){
			self.viewChange(Stencils.RevealView);
		},{
			icon:'eye',
			keys:'F7'
		});

		self.menu.item('Print',function(){
			window.print();
		},{
			icon:'print'
		});

		if(self.dynamic()){
			self.menu.item('Cila',function(){
				self.viewChange(Stencils.CilaView);
			},{
				icon:'circle-thin',
				keys:'F8'
			});
			self.menu.item('HTML',function(){
				self.viewChange(Stencils.HtmlView);
			},{
				icon:'code',
				keys:'F9'
			});
			//'f10': Stencila.Components.BrowseView,
			//'f11': Stencila.Components.RepoView,
			//	... actions
			self.menu.section();
			self.menu.item('Save',function(){
				self.view.restore();
				self.save(self.view.format);
			},{
				icon:'upload',
				keys:'Ctrl+S'
			});
			self.menu.item('Refresh',function(){
				self.refresh();
			},{
				icon:'refresh',
				keys:'Ctrl+R'
			});

			self.menu.item('Console',function(){
				self.console.show();
			},{
				icon:'terminal'
			});
		}
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

	Stencil.prototype.refresh = function(){
		var self = this;
		self.view.restore();
		self.render(self.view.format);
	}

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
