// runs in the scope of the web page being browsed
var content = ( function() {

	// private variables
	logging = true; // TODO
	url = window.location.href,
	page_action_set = false;
//	console.log('content script '+url);

//	var adaptorSchema;
	function initialize (options) {
		options = options || {};
		console.log('requestAdaptors');
		requestAdaptors ({			
			"success" : function (adaptors) {
				async.series({
				     filter1 : function (callback) { filterlevel1(callback, adaptors, 'whitelists');},
				     filter2 : function (callback) { filterlevel1(callback, adaptors, 'blacklists');},
				     filters3_4 : function (callback) { filterlevel2(callback, adaptors);}
				},
				function(err, results) {
					if (err) {
						return err;
					} 
				});				
			}
		}) ;
	}
	
	filterlevel1 = function (callback, adaptors, listType) {
		// Filter1 and Filter2
		requestLists ({
			"success" : function (activeLists) {	
				if (listType == 'whitelists') {
					// Filter1. Stop if URL does not match any active white list
					matchLists (activeLists, 'whitelist', {
						"success" : function (isMatched) {
							if (isMatched) { 
								console.log('l1 white matched');
								callback(null);
							}
							else {callback("err1");}
						}
					}) ;
				}
				else if (listType == 'blacklists') {
					console.log('l1 black test');
					// Filter2. Stop if URL matches an active black list
					matchLists (activeLists, 'blacklist', {
						"success" : function (isnotMatched) {
							if (isnotMatched) { 
								callback(null);
							}
							else {callback("err2");}
						}
					}) ;
				}
			}
		}, listType);									
	};

	filterlevel2 = function (callback, adaptors) {
		
		adaptorList = function (callback, adaptor, listType) {		
			lists = adaptor.lists[listType] || [];
			console.log('adaptor.lists = ', lists);		
			if (listType == 'whitelists') {
				console.log('l2 white test');
				// Filter3. Stop if URL does not match any active white list
				matchLists (lists, 'whitelist', {
					"success" : function (isMatched) {
						if (isMatched) { callback(null); }
						else {callback("err3");} }
				});
			}
			else if (listType == 'blacklists') {
				console.log('l2 black test');
				// Filter4. Stop if URL matches an active black list
				matchLists (lists, 'blacklist', {
					"success" : function ( isnotMatched ) {
						if (isnotMatched) {  callback(null); }
						else {callback("err4");}
					}
				});
			}
		};
		
		for (key in adaptors) {
			adaptor = adaptors[key];
			if (!adaptor.inactive) {				
				async.series({
				     filter3 : function (callback) { adaptorList(callback, adaptor, 'whitelists');},
				     filter4 : function (callback) { adaptorList(callback, adaptor, 'blacklists');}
				},
				function(err) {
					if (err) {
						console.log('validation error');
						callback(err); } 
					else { 
						console.log('no validation error', adaptor);
						if (!page_action_set) {page_action();}
						
						if (adaptor.adaptor == 'meo.my/pageURL' || adaptor.adaptor == 'meo.my/metatags') {
							
							tryAdaptors(
							{
								spec : adaptor.parameters
							});
						}
	/*					else {
							executeAdaptor (adaptor);
						}
	*/				}
				});
			}
		}		
	};

	page_action = function (options) {
		options = options || {};
		request = new messenger.Message ({
			source 	: 'content',
			target 	: 'background',
			action 	: 'pageAction'
		});
		page_action_set = true; // prefer synchronous to timely
		request.send({
			success : function (tags) {
			}
		});
	};

	function requestLists (options, listType, module) {
		options = options || {};
		request = new messenger.Message ({
			source 	: 'content',
			target 	: 'background',
			inactive: options.inactive || false,
			listType : listType,
			module 	: module || null,
			action 	: 'requestLists'
		});
		request.send({
			success : function (lists) {
				options.success && options.success (lists);
			}
		});

		(function unescape (escapedStr) {
			return function () {
				var character = {
					'\\' : ''  };
				return escapedStr.replace(/[\\]/g, function (c) {
					return character[c];
				});
			};
		}());
	}

	function requestAdaptors (options) {
		options = options || {};
		request = new messenger.Message ({
			source : 'content',
			target : 'background',
			inactive: options.inactive || false,
			module : options.adaptors || {}
		});
		request.send({
			success : function (adaptors) {
				options.success && options.success (adaptors);
			}
		});
	}

	function tryAdaptors (options) {
		options = options || {};
		request = new messenger.Message ({
			source : 'content',
			target : 'background',
			action : 'tryAdaptors',
			parameters : {
				url : window.location.href,
				spec : options.spec
			}
			
		});
		request.send({
			success : function(options) {
				// to avoid sending a large message to background process
				// containing all the page's html, the html adaptor's selectors
				// and extractors are executed in situ; in the content_page.
				// This approach involves more message passing, but much less
				// data transmitted
				if (options && options.adaptor && options.adaptor === 'html') {
					var extArr = [], jQstring;
					if (jQstring = options.jQstring) {
						// execute the (jQuery) selector/extractor which was prepared by background
						console.log('jQstring', jQstring);					
						eval(jQstring);
						// send to background the array of extracted tags, so it may split and store them
						if (extArr.length > 0) {
							request = new messenger.Message ({
								source : 'content',
								target : 'background',
								action : 'htmlAdaptor',
								parameters : {
									extractor : options.extractor,
									extArr : extArr
								}
							});
							request.send();
					}
						
/*						options.success && options.success (extArr, {
							// all done
//							success : options.success
						});
*/					}
				} else {
					// other adaptors are executed entirely in the background
					// process, so they have already finished
					console.log('its not an html adaptor');
					options.success && options.success();
				}
			}
		});
				
	}

	function matchLists (lists, listType, options) {
		var activeLists = 0;
		for (i in lists) {
			var listObj = JSON.parse(unescape(lists[i][listType]));

			// match browser config to browser parameter(s) in level1 white and black lists
//	console.log('window', window);
				
			if (!lists[i].inactive) {
				console.log('listObj', listObj)
				if (listObj.url) {
					activeLists++;				
					// match current url to url parameter(s) in level1 white and black lists
					if (common.matchURLtoList (url, listObj.url)) {
						console.log('matched',listObj.url, listType)
						options.success && options.success (listType == 'blacklist' ? false : true); return;
					}
				}
			}
		}
		console.log('activeLists', activeLists)
		if (activeLists > 0) { options.success && options.success (listType == 'blacklist' ? true : false );}
		else { options.success && options.success (true);} // no active list so no restriction
	}		

/*	function executeAdaptor (adaptor) {	
		console.log('executeAdaptor', adaptor);

	//		console.log(adaptors);
			resultArr = [];
			eval(adaptor.script);	// eval an active adaptor script and kick it off in this page's scope
			adaptor[adaptor.adaptor].initialize(
			{ 
				"parameters" : adaptor.parameters,
				"success" 	: function (valueObjArr) { 
					// 
					console.log(valueObjArr); 
					resultArr = resultArr.concat(valueObjArr.contentArr);
		//				storeResults (resultArr);
				},
				"error" 	: function () {console.log('adaptor error'); }
			}); 		
		
	}
*/
	function storeResults (options) {
		options = options || {};
		request = new messenger.Message ({
			source 	: 'content',
			target 	: 'background',
			action 	: 'putTags'
		});
		request.send({
			success : function (tags) {

			}
		});
	}
		
	function start_listener () { // start to listen for message responses from background
		messenger.listener.start ();
	}

	function stop_listener () {
		messenger.listener.stop ();
	}

	// export the content module's API
	return {
		initialize		: initialize,
		stop_listener 	: stop_listener,
		start_listener 	: start_listener
	};

}());

jQuery(document).ready( function () {
	setTimeout( function() {
		// run the content module in the DOM of the calling page
		content.initialize({inactive : false});
	}, 1500 ); // let the processor rest a bit before kicking off the adaptors
});