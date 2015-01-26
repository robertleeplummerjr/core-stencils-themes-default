// Base view
include('/core/stencils/themes/default/content-view.js');

// MathJax : maths formatting
include('/core/stencils/themes/default/requires/MathJax/MathJax.js',function(){
	include('/core/stencils/themes/default/requires/MathJax/config/TeX-MML-AM_HTMLorMML.js');
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
			// Remove wrapping CDATA elements that may be in <script type="math/..."> elements
			// prior to rendering them with MathJax. ^= is necessary due to mode=display being added to some type 
			// attributes
			self.content.find('script[type^="math/tex"],script[type^="math/asciimath"]').each(function(){
				var elem = $(this);
				var text = elem.text().trim();
				if(text.substr(0,9)=='<![CDATA[') text = text.substr(9);
				if(text.substr(text.length-3)==']]>') text = text.substr(0,text.length-3);
				elem.text(text);
			});
			// Do MathJax rendering of math using 'Rerender' instead of 'Typeset'
			// because math is already in <script type="math/..."> elements
			MathJax.Hub.Queue(
				["Rerender",MathJax.Hub,"content"],
				// Hide math script elements which should now have been rendered into 
				// separate display elements by MathJax
				function(){
					self.content.find('script[type^="math/tex"],script[type^="math/asciimath"]').each(function(){
						$(this).css('display','none');
					});
				}
			);
			// Handle inputs differently based on dynamic or not
			var inputs = self.content.find('input');
			if(self.stencil.dynamic()){
				// Add labels for each input
				inputs.each(function(){
					var input = $(this);
					var name = input.attr('name');
					var id = Stencila.uniqueId();
					var label = $('<label class="decor">'+name+'</label>');
					input.before(label);
				});
				// Make the value attribute of input elements get updated when user makes a change
				// so that the DOM value is in the HTML that is saved and rendered (without having
				// to have a POST)
				var update = function(event){
					var input = $(this);
					var type = input.attr('type');
					var value = input.val();
					// For files, extract the filename from the path (which can include "c:/fakepath/")
					if(type=='file') value = value.split(/(\\|\/)/g).pop();
					input.attr('value',value);
				};
				inputs.on('input',update);
				inputs.on('change',update);
				// Add a button if any inputs
				if(inputs.length>0){
					if(self.content.find('button').length===0){
						inputs.last().after('<button class="decor refresh">Refresh</button>');
					}
				}
				// Click on a refresh button sends inputs to stencil
				self.content.find('button.refresh').click(function(event){
					event.preventDefault();
					var values = {};
					inputs.each(function(){
						var input = $(this);
						values[input.attr('name')] = input.attr('value');
					});
					self.stencil.inputs(values);
				});
			} else {
				inputs.each(function(elem){
					$(elem).attr('readonly');
				});
				self.content.find('button').remove();
			}
		});
	};

	/**
	 * Restore the stencil from the view
	 */
	NormalView.prototype.restore = function(){
		// This is a read only view so don't set the stencil's
		// content
	};

	return Stencila;
})(Stencila||{});