/* Handles message passing. Runs in the scope of any admin page
 * So far this listener is not used. 
 */

// TODO remove this script ?

messenger = $.extend(messenger, {



		
		listener : function ( ) {
			var start = function () {
				console.log("starting content listener");
				chrome.extension.onRequest.addListener(function(request, sender,
						sendResponse) {
					console.log('receiving message from background '+request.message);
					sendResponse({
						
					});
				});			
			};
			var stop = function () {
				console.log("stopping content listener");
				chrome.extension.onRequest.removeListener(function() {
					console.log('stopped content listener');
				});
			};
			
		    return {
		       	stop 	: stop,
		       	start 	: start
		    };
		}
	
});