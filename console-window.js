var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A window for interacting with a stencil's rendering context
	 */
	var ConsoleWindow = Stencils.ConsoleWindow = function(stencil){
		var self = this;
		self.stencil = stencil;

		var content = self.content = $(
			'<div class="console-window">' +
				'<div class="close"><i class="fa fa-close"></i></div>' +
				'<textarea class="command" type="textbox" rows="3"></textarea>' +
				'<textarea class="result" type="textbox" rows="10"></textarea>' +
			'</div>'
		).appendTo('body');

		var command = content.find('.command');
		var result = content.find(".result");
		command.keypress(function(event){
			// Ctrl+Enter
			if(event.ctrlKey & event.keyCode==10){
				var value = command.val();
				self.stencil.call('context.interact(string):string',[value],function(returned){
					var code = returned.substring(0,1);
					var output = returned.substring(1);
					if(code=='E') result.addClass('error');
					else {
						result.removeClass('error');
						command.val("");
					}
					result.val(output);
				});
			}
		});

		content.find('.close').click(function(){
			content.remove();
		});
	};

	return Stencila;
})(Stencila||{});