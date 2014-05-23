var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * Singleton class which represents the current stencil
	 *
	 * Manages communication with server and alternative views
	 */
	var Stencil = function(){
		this.view = null;
	};

	/**
	 * Initialise the stencil
	 */
	Stencil.prototype.init = function(){
		var self = this;
		var connection = Stencila.Component.Connection;

		// Start with NormalView
		self.view = new Stencils.NormalView();
		self.view.init();

		// Change views using F6 etc
		$.each({
			'f6':  Stencils.NormalView,
			'f7':  Stencils.RevealView,
			//'f8': Stencils.CilaView,
			'f9': Stencils.HtmlView
		},function(key,viewClass){
			$(document).bind('keydown',key,function(event){
				event.preventDefault();
				self.change(viewClass);
			});
		});

		// Save the stencil with Ctrl+S
		$(document).bind('keydown','ctrl+s',function(event){
			event.preventDefault();
			connection.call('html',[self.from()],function(results){
				console.log('saved');
			});
		});

		// Commit the stencil with Ctrl+D
		$(document).bind('keydown','ctrl+d',function(event){
			event.preventDefault();
			connection.call('commit',['Updated'],function(results){
				console.log('commited');
			});
		});

		// Render the stencil with Ctrl+R
		$(document).bind('keydown','ctrl+r',function(event){
			event.preventDefault();
			connection.call('render',[self.from()],function(results){
				// First result is the stencil's rendered HTML so send it 
				// to the current view
				var html = results[0];
				self.to(html);
			});
		});
	};

	/**
	 * Change the view
	 * 
	 * @param  {Class} viewClass A view Class
	 */
	Stencil.prototype.change = function(viewClass){
		if(!(this.view instanceof viewClass)){
			var html = this.view.from();
			this.view.close();
			this.view = new viewClass();
			this.view.to(html);
		}
	};

	/**
	 * Send stencil HTML content to current view
	 * 
	 * @param  {String} html HTML content
	 */
	Stencil.prototype.to = function(html){
		this.view.to(html);
	};

	/**
	 * Get stencil HTML content from current view
	 * 
	 * @return  {String} html HTML content
	 */
	Stencil.prototype.from = function(){
		return this.view.from();
	};

	/**
	 * Prettify stencil HTML
	 *
	 * Since a stencil's HML can be modified in many ways other than manual
	 * editing (e.g. by rendering, by conetenteditable) we often prettify it.
	 * This method simply defines standard prettifying options so that it should
	 * always appear the same.
	 */
	Stencil.prototype.prettifyHtml = function(html){
		// See https://github.com/einars/js-beautify#css--html
		// for more details on these options
		return html_beautify(html,{
			"indent-inner-html":false,//Indent <head> and <body> sections [Should never exist in `html`]
			"indent_size": 4,
			"indent_char": " ",
			"brace_style": "collapse",
			"indent_scripts": "normal",
			"wrap_line_length": 80, //Maximum characters per line
			"preserve_newlines": false, //Preserve existing line-breaks
			"max_preserve_newlines": 0,
			// Must not format code that may be in pre or code tags
			"unformatted": ['pre','code'] //List of tags (defaults to inline) that should not be reformatted
		});
	};

	// Istantiate the singleton instance
	Stencils.Stencil = new Stencil();

	return Stencila;
})(Stencila||{});
