// ACE editor : HTML and Cila editing
include('/core/themes/base/externals/ace/ace.js',function(){
	// Emmet extension : HTML editing shortcuts
	include('/core/themes/base/externals/ace/ext-emmet.js',function(){
		ace.require("ace/ext/emmet");
	});
});
// Emmet tookit : HTML editing shortcuts
include('/core/themes/base/externals/emmet.js');

// Beautify JS : HTML prettyfying
include('/core/themes/base/externals/js-beautify.js');

// MathJax : maths formatting
include('/core/themes/base/externals/MathJax/MathJax.js',function(){
	include('/core/themes/base/externals/MathJax/config/TeX-MML-AM_HTMLorMML.js');
});

// Base theme : connection etc
include('/core/themes/base/theme.js');

// Stencil views
include('/core/stencils/themes/default/normal-view.js');
include('/core/stencils/themes/default/reveal-view.js');
include('/core/stencils/themes/default/html-view.js');

//Stencil instance
include('/core/stencils/themes/default/stencil.js');

main(function(){
	Stencila.Component.Connection.connect();
	Stencila.Stencils.Stencil.init();
});
