// code shared by background, content script and admin pages

var common = {
	getJSONFile : function(options) {
		options = options || {};
		if (options.file)
			jQuery
					.ajax(
							options.file,
							{
								success : function(data, textStatus, jqXHR) {
									if (options.type) {
										options.success
												&& options
														.success(JSON
																.parse(data)[options.type]);
									} else {
										options.success
												&& options.success(data);
									}
								},
								error : function(jqXHR, textStatus, errorThrown) {
									options.error
											&& options.error(jqXHR, textStatus,
													errorThrown);
								}
							});
	},

	isUrl : function(s) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		return regexp.test(s);
	},
	
	parseURL : function (url, strip_undefined) {
		
		strip_undefined = strip_undefined || true;
	// thanks to [Crockford](http://www.shwartz.eu/list2011/js-quick-reference/an_example.html) for regular expression
	 	var regexp = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;	 		 
		// separate the url into predefined components
	 	var components = regexp.exec(url), retObj = {};
		
	 	for (i in components) {
	 	// url components lacking content are removed
	 		if (strip_undefined && !components[i]) {
	 			delete components[i];
	 		}
	 		else {
	 			retObj[common.urlComponents[i]] = components[i];
	 		}
	 	}
	 // return an object whose property names are a subset of urlComponents
		console.log('parseURL retObj', retObj)
	 	return retObj;
	},
	
	
	// Names for the components of a URL in the order recovered by Crockford's regexp
	urlComponents : [ 
		//entire URL
		'full', 
		// e.g. https
		'scheme', 
		//[useless filler](http://www.bcs.org/content/conWebDoc/3337)
		'slash', 
		//e.g. www.example.com
		'host', 
		//e.g. 80
		'port', 
		//entire path
		'path', 
		//entire query string
		'query', 
		//e.g. #page1
		'hash' 
	]
};
