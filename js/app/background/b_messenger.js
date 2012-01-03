/* Handles message passing. Runs in scope of background.
 * Extends object in messenger.js
 */
messenger = $.extend(messenger, {

	initialize : function(options) {
		options = options || {};
	},

	messageContentScript : function(tab, message) {
		console.log('initiating request on content_script '
				+ JSON.stringify(tab));
		chrome.tabs.sendRequest(tab.id, message, function(response) {
		});
	},

	listener : (function() {  // listens for incoming messages
		console.log("background listener started");
		chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
			console.log(sender.tab ? "message from a content script:"
					+ sender.tab.url : "from the extension");
			messenger.messageRouter(request, sendResponse);			
		});
	})(),

	messageRouter : function(request, sendResponse) {
		/*
		 * Routes requests according to request's source --> target :
		 * 	context script --> background 
		 * 	admin page --> background 
		 * 	background --> meo.my extension
		 */
		
		request = request || {};
//		console.log("messageRouter "+JSON.stringify(request));	
		if (request.source == 'content') {
			if (request.target == 'background') {
				if (request.action  == 'requestLists' && request.listType ) {
					background.getLists(request, request.listType , request.module || null, sendResponse);
				}
				else if (request.action  == 'putTags') {
					background.putTags(request, sendResponse);
				}
				else if (request.module) {
					background.applyAdaptors(request, sendResponse);
				}
				else if (request.action  == 'pageAction') {
					background.pageAction(request, sendResponse);
				}
				else if (request.action  == 'tryAdaptors') {
					background.tryAdaptors(request, sendResponse);
				}
				else if (request.action  == 'htmlAdaptor') {
					background.htmlAdaptor(request, sendResponse);
				}
			}
			else if (request.target == 'crx') {
				// pass the message to meo.my extension
				
			}
			else return false;
		}
		else if (request.source == 'admin') {
			if (request.target == 'background') {
				if (request.module  === 'modules') {
					background.setMenus();
				}
			}
			else return false;

		}
		else if (request.source == 'background') {
			if (request.target == 'crx') {
				
			}
			else return false;
		}
	}
});


