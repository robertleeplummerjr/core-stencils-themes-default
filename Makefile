# Makefile for required Javascript (and potentially other language) libraries

all: Medium.js

##################################################################################################
# Medium.js (http://jakiestfu.github.io/Medium.js/docs/) : for controlling contenteditable

Medium.js:
	bower install medium.js
