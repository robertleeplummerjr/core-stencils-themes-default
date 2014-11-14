var Stencila = (function(Stencila){
	var Stencils = Stencila.Stencils = Stencila.Stencils||{};

	/**
	 * A window for interacting with a stencil's rendering context
	 */
	var ConsoleWindow = Stencils.ConsoleWindow = function(stencil){
		var self = this;
		self.stencil = stencil;
		self.history = [];
		self.history_at = null;

		var content = self.content = $(
			'<div class="console-window" style="display:none">' +
				'<div class="close"><i class="fa fa-close"></i></div>' +
				'<textarea class="command" type="textbox" rows="3"></textarea>' +
				'<textarea class="result" type="textbox" readonly="readonly" rows="10"></textarea>' +
			'</div>'
		).appendTo('body');

		var command = content.find('.command');
		var result = content.find(".result");
		// Key PRESSes
		command.keypress(function(event){
			// Enter
			if(event.keyCode==13){
				event.preventDefault();
				var source = command.val();
				self.stencil.call('context.interact(string):string',[source],function(returned){
					var code = returned.substring(0,1);
					var output = returned.substring(1);
					if(code=='E') result.addClass('error');
					else result.removeClass('error');
					result.val(output);
					// Store in history
					// Pop first element if very long history
					if(self.history.length>1000) self.cach.shift();
					self.history.push([source,output]);
					self.history_at = null;
				});
			}
		});
		// Key DOWNs
		command.keydown(function(event){
			function history_apply(){
				var hist = self.history[self.history.length-1-self.history_at];
				command.val(hist[0]);
				result.val(hist[1]);
			}
			// Up arrow
			if(event.keyCode==38){
				// Get both the source and corresponding result from the history
				if(self.history_at>=0){
					self.history_at += 1;
					if(self.history_at>self.history.length-1) self.history_at = self.history.length-1;
				}
				else self.history_at = 0;
				history_apply();
			}
			// Down arrow
			else if(event.keyCode==40){
				if(self.history_at>0){
					self.history_at -= 1;
					history_apply();
				}
			}
		});

		content.find('.close').click(function(){
			content.hide();
		});
	};

	ConsoleWindow.prototype.show = function(callback){
		var self = this;
		self.content.show();
	};

	return Stencila;
})(Stencila||{});