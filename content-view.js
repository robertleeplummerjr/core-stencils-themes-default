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

		// Save the stencil with Ctrl+S
		$('body').bind('keydown','ctrl+s',function(event){
			event.preventDefault();
			self.restore();
			self.stencil.save(self.format);
		});

		// Render the stencil with Ctrl+R
		$('body').bind('keydown','ctrl+r',function(event){
			event.preventDefault();
			self.restore();
			self.stencil.render(self.format);
		});

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
