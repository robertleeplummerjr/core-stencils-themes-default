// Base view
include('/core/stencils/themes/default/content-view.js');

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A view which provides and edior for the Cila language
	 */
	var CilaView = Stencils.CilaView = function(stencil){
		var self = this;
		Stencils.ContentView.call(self,stencil,'cila');

		// Create a containter for the editor
		self.container = $('<div class="cila"><div id="cila-editor" /></div>').appendTo($('body'));
		// Create an Ace Editor instance in the container
		var editor = self.editor = ace.edit('cila-editor');
		editor.setFontSize(16);
		editor.setTheme("ace/theme/monokai");
		editor.getSession().setMode("ace/mode/cila");
		// Indentation characters are important:
		//editor.setShowInvisibles(true);
		editor.getSession().setUseSoftTabs(false);
		// Set the maximum number of lines for the code. When the number
		// of lines exceeds this number a vertical scroll bar appears on the right
		editor.setOption("maxLines",1000);
		// Set read/write mode
		if(!self.stencil.writeable) editor.setReadOnly(true);

		// It is tricky getting ACE editor to display correctly as an overlay
		// on top of the content
		// So, for the time being just hide the content
		$('main#content').hide();

		self.bind();
	};

	init(function(){
		Stencila.extend(
			CilaView,
			Stencils.ContentView
		);
	});

	/**
	 * Close the view
	 */
	CilaView.prototype.close = function(){
		var self =this;
		// Remove editor container and clean up
		this.container.remove();
		this.editor.destroy();
		// Unbind events
		self.unbind();
	};

	/**
	 * Refresh the view
	 */
	CilaView.prototype.refresh = function(){
		var self = this;
		self.stencil.get('cila',function(cila){
			// Set the editor value
			self.editor.setValue(cila);
			// Focus on first line
			self.editor.focus();
			self.editor.gotoLine(0);
		});
	};

	/**
	 * Restore the stencil from the view
	 */
	CilaView.prototype.restore = function(){
		var self = this;
		self.stencil.set('cila',self.editor.getValue());
	};

	return Stencila;
})(Stencila||{});
