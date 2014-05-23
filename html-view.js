var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * The HtmlView is a HTML editor
	 *
	 * It's mainly going to be used by developers whoneed to drop down to HTML to fix
	 * something up or debug stencil modifications by other views.
	 */
	var HtmlView = Stencils.HtmlView = function(){
		// Create a containter for the editor
		this.container = $('<div class="html"><div id="html-editor" /></div>').appendTo($('body'));
		// Create an Ace Editor instance in the container
		var editor = this.editor = ace.edit('html-editor');
		editor.setFontSize(14);
		editor.getSession().setMode("ace/mode/html");
		// Add Emmet support
		editor.setOption("enableEmmet", true);
		// Set the maximum number of lines for the code. When the number
		// of lines exceeds this number a vertical scroll bar appears on the right
		editor.setOption("maxLines",1000);
		// It is tricky getting ACE editor to display correctly as an overlay
		// on top of the content
		// So, for the time being just hide the content
		$('main#content').hide();
	};

	/**
	 * Close the view
	 */
	HtmlView.prototype.close = function(){
		// Remove editor container and clean up
		this.container.remove();
		this.editor.destroy();
		// Show content
		$('main#content').show();
	};

	/**
	 * Send stencil's HTML content to the view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	HtmlView.prototype.to = function(html){
		// Prettify HTML
		var pretty = Stencils.Stencil.prettifyHtml(html);
		// Set the editor value
		this.editor.setValue(pretty);
		// Focus on first line
		this.editor.focus();
		this.editor.gotoLine(0);
		return this;
	};

	/**
	 * Get stencil's HTML content from the view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	HtmlView.prototype.from = function(){
		return this.editor.getValue();
	};

	return Stencila;
})(Stencila||{});
