// ACE editor : HTML and Cila editing
include('/core/themes/base/requires/ace/ace.js',function(){
	// Emmet extension : HTML editing shortcuts
	include('/core/themes/base/requires/ace/ext-emmet.js',function(){
		ace.require("ace/ext/emmet");
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
		var indicator;
		if(which=='start'){
			indicator = $(
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
			indicator = $('body .updating');
			indicator.animate({
				opacity: 0
			});
			$('#content').animate({
				opacity: 1
			},function(){
				indicator.remove();
			});
		}
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
