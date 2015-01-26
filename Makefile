# Makefile for required Javascript (and potentially other language) libraries

all: cila-mode MathJax Medium.js

# To add a Cila lanaguage mode to Ace editor it is necessary to symlink our definition into the ace
# editor directory.
cila-mode:
	ln -sf ../../../../stencils/themes/default/cila-mode.js ../../../themes/base/requires/ace/mode-cila.js

##################################################################################################
# MathJAX : for displaying math formula
# To reduce size, the following were removed from MathJax-2.3 based on
#  https://github.com/mathjax/MathJax-docs/wiki/Guide%3A-reducing-size-of-a-mathjax-installation
# 
# 	rm -rf docs test unpacked .gitignore README-branch.txt README.md bower.json
# 	rm `find config -name '*.js' ! -name 'TeX-MML-AM_HTMLorMML.js'`
# 	rm -rf fonts/HTML-CSS/TeX/png/
# 	rm -rf localization
# 	rm -rf `find fonts/HTML-CSS -mindepth 1 -maxdepth 1 ! -name 'STIX-Web'`
# 	rm -rf `find fonts/HTML-CSS/STIX-Web -mindepth 1 -maxdepth 1 ! -name 'woff' -type d`
# 	rm -rf `find jax/output/HTML-CSS/fonts -mindepth 1 -maxdepth 1 ! -name 'STIX-Web'`
# 	rm -rf jax/output/SVG

MathJax: MathJax-2.3.tar.gz
	tar xf MathJax-2.3.tar.gz
	mv MathJax-2.3 MathJax

MathJax-2.3.tar.gz:
	wget -O MathJax-2.3.tar.gz  https://github.com/mathjax/MathJax/archive/v2.3.tar.gz

##################################################################################################
# Medium.js (http://jakiestfu.github.io/Medium.js/docs/) : for controlling contenteditable

Medium.js:
	bower install medium.js
