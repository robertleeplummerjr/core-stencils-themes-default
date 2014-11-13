// Base view
include('/core/stencils/themes/default/content-view.js');

// MathJax : maths formatting
include('/core/themes/base/externals/MathJax/MathJax.js',function(){
	include('/core/themes/base/externals/MathJax/config/TeX-MML-AM_HTMLorMML.js');
	MathJax.Hub.Config({
		showProcessingMessages: false,
		showMathMenu: false,
		"HTML-CSS": {
			webFont: "STIX-Web"
		}
	});
});

var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * The default ("normal") view for a Stencil
	 */
	var NormalView = Stencils.NormalView = function(stencil){
		var self = this;
		Stencils.ContentView.call(self,stencil);

		// Get content
		var content = this.content = $('main#content');
		// Show it (because some other views hide it)
		content.show();

		self.bind();
	};

	init(function(){
		Stencila.extend(
			NormalView,
			Stencils.ContentView
		);
	});

	/**
	 * Close the view
	 */
	NormalView.prototype.close = function(){
		// Unbind events
		var self = this;
		self.unbind();
	};

	/**
	 * Refresh the view
	 */
	NormalView.prototype.refresh = function(){
		var self = this;
		self.stencil.get('html',function(html){
			self.content.html(html);
			// Do MathJax rendering of math using 'Rerender' instead of 'Typeset'
			// because math is already in <script type="math/..."> elements
			MathJax.Hub.Queue(["Rerender",MathJax.Hub,"content"]);
			// Hide math script elements which should now be getting rendered into 
			// separate display elements by MathJax
			self.content.find('script[type="math/tex"],script[type="math/asciimath"]').each(function(){
				$(this).css('display','none');
			});
			// Make the value attribute of input elements get updated when user makes a change
			// so that the DOM value is in the HTML that is saved and rendered (without having
			// to have a POST)
			self.content.find('input').on('input',function(event){
				var input = $(this);
				input.attr('value',input.val());
			})
		});
	};

	/**
	 * Restore the stencil from the view
	 */
	NormalView.prototype.restore = function(){
		var self = this;
		// Get all MathJax "jax" elements (e.g. 
		//    <script type="math/asciimath" id="MathJax-Element-2">e=m^2</script>
		// ) and remove the id
		$.each(['math/tex','math/asciimath'],function(type){
			$.each(MathJax.Hub.getJaxByInputType(type,'content'),function(){
				var element = $(this.SourceElement());
				if(/^MathJax/.exec(element.attr('id'))) element.removeAttr('id');
			});
		});
		// Remove all MathJax elements which have been added
		self.content.find('.MathJax_Preview, .MathJax').remove();
		// Now update the stencil's HTML
		self.stencil.set('html',self.content.html());
	};

	return Stencila;
})(Stencila||{});