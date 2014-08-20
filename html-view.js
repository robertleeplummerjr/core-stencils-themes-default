// Base view
include('/core/stencils/themes/default/content-view.js');

// ACE editor : HTML and Cila editing
include('/core/themes/base/externals/ace/ace.js',function(){
	// Emmet extension : HTML editing shortcuts
	include('/core/themes/base/externals/ace/ext-emmet.js',function(){
		ace.require("ace/ext/emmet");
	});
});
// Emmet tookit : HTML editing shortcuts
include('/core/themes/base/externals/emmet.js');

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * The HtmlView provides a HTML editor
	 *
	 * It's mainly going to be used by developers who need to drop down to HTML to fix
	 * something up or debug stencil modifications by other views.
	 */
	var HtmlView = Stencils.HtmlView = function(stencil){
		var self = this;
		Stencils.ContentView.call(self,stencil);

		// Create a containter for the editor
		this.container = $('<div class="html"><div id="html-editor" /></div>').appendTo($('body'));
		// Create an Ace Editor instance in the container
		var editor = this.editor = ace.edit('html-editor');
		editor.setFontSize(16);
		editor.setTheme("ace/theme/monokai");
		editor.getSession().setMode("ace/mode/html");
		// Add Emmet support
		editor.setOption("enableEmmet", true);
		// Set the maximum number of lines for the code. When the number
		// of lines exceeds this number a vertical scroll bar appears on the right
		editor.setOption("maxLines",1000);
		// Set read/write mode
		if(!stencil.writeable) editor.setReadOnly(true);

		// It is tricky getting ACE editor to display correctly as an overlay
		// on top of the content
		// So, for the time being just hide the content
		$('main#content').hide();

		self.bind();
	};

	init(function(){
		Stencila.extend(
			HtmlView,
			Stencils.ContentView
		);
	});

	/**
	 * Close the view
	 */
	HtmlView.prototype.close = function(){
		var self = this;
		// Remove editor container and clean up
		self.container.remove();
		self.editor.destroy();
		// Unbind events
		self.unbind();
	};

	/**
	 * Refresh the view
	 */
	HtmlView.prototype.refresh = function(){
		var self = this;
		self.stencil.get('html',function(html){
			// Beautify HTML
			// Currently don't do this as it mucks up whitespace formatting in <pre> tags
			// containing code
			// self.stencil.htmlBeautify();
			// Set the editor value
			self.editor.setValue(html);
			// Focus on first line
			self.editor.focus();
			self.editor.gotoLine(0);
		});
	};

	/**
	 * Restore the stencil from the view
	 */
	HtmlView.prototype.restore = function(){
		var self = this;
		self.stencil.set('html',this.editor.getValue());
	};

	return Stencila;
})(Stencila||{});
