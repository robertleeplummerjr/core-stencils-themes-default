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

	// Istantiate the singleton instance
	Stencils.Stencil = new Stencil();

	return Stencila;
})(Stencila||{});
