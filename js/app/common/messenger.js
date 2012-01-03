/* Handles message passing. Runs in the scope of either content page or any admin page
 */
var messenger = function () {
	return {
		initialize : function(options) {
			options = options || {};
		},
		
		Message :  function (options) { 
			options = options || {};		
			var message = {};
			for (key in options) {
				message[key] = options[key];
			}
			
			// mandatory or defaults
			message['source'] = message['source'] || null;
			message['target'] = message['target'] || 'background';
			message['inactive'] = message['inactive'] || false;
			message.send  = function (options) {
				options = options || {};
				chrome.extension.sendRequest(this, function(response) {
					options.success && 	options.success(response);
				});			
			};
			return message;
			
/*			return {
				source : options.source || null,
				target : options.target || 'background', // bg is the default target
				module : options.module || null, 
				action : options.action || null, 
				inactive : options.inactive || false, 
				send : function (options) {
					options = options || {};
					chrome.extension.sendRequest(this, function(response) {
						options.success && 	options.success(response);
					});			
				}
			};
*/		}
	}
	
}();