var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * The default ("normal") view for a Stencil
	 */
	var NormalView = Stencils.NormalView = function(){
		this.content = $('main#content');
	};

	/**
	 * Initialise the view
	 *
	 * Since this is the first default do it is necesary to 
	 * call `this.to` to do MathJax typesetting etc
	 */
	NormalView.prototype.init = function(){
		this.to(this.content.html());
	};

	/**
	 * Close the view
	 */
	NormalView.prototype.close = function(){
	};

	/**
	 * Go to view
	 * 
	 * @param  {String} html Stencil HTML content
	 */
	NormalView.prototype.to = function(html){
		this.content.html(html);
		// Do MathJax typesetting
		MathJax.Hub.Queue(["Typeset",MathJax.Hub,"content"]);
	};

	/**
	 * Go from view
	 * 
	 * @return {String} Stencil HTML content
	 */
	NormalView.prototype.from = function(){
		// Get all MatthJax "jax" elements (e.g. 
		// 		<script type="math/asciimath" id="MathJax-Element-2">e=m^2</script>
		// ) and replace them with shorthand, original, unrendered, text equations
		// surrounded by corresponding delimiters for the type
		$.each({
			'math/tex' : ['\\(','\\)'],
			'math/asciimath' : ['`','`']
		},function(type,delimiters){
			$.each(MathJax.Hub.getJaxByInputType(type),function(){
				var element = $(this.SourceElement());
				element.replaceWith(delimiters[0]+element.text()+delimiters[1]);
			})
		});
		// Remove all MathJax elements
		this.content.find('.MathJax_Preview, .MathJax').remove();
		// Now return content
		return this.content.html();
	};

	return Stencila;
})(Stencila||{});