// code shared by content script

common = $.extend(common, {

	matchURLtoList : function (url, listComps) {
		console.log('matchURLtoList'); 
		var urlComps = this.parseURL(url, true),
		listCompCount=0, compMatchCount = 0, keysMatchValue;
		console.log('urlComps '+JSON.stringify(urlComps)); 
		
 		for(var listComp in listComps) 
		{	listCompCount++;
			keysMatchValue = urlComps[listComp]; // try turning this listComp key in the urlComps lock
			if (keysMatchValue) {
				listCompArr = listComps[listComp];
				for (i in listCompArr) { // match any one array item
					if ((keysMatchValue === listCompArr[i] ||
							(listComp === 'host' || listComp === 'path') 
								&& wildCardURL(keysMatchValue, listCompArr[i])) 
						) {
						compMatchCount++;
						break;
					}
				}
			}
		}
 		// must match every component in any one json list item.
 		if (compMatchCount === listCompCount) {
 			return true;
 		} 
 		return false;
 		
 		function wildCardURL (urlCompValue, listPattern) {
			console.log('wildCard URL');
			// match a value to a pattern possibly containing wild cards
				var regexp = new RegExp(listPattern.replace(/\*/g, "[^ ]*"));				
 				if (regexp.test(urlCompValue)) {
 		 			return true;
 		 		}
 	 			else { return false; }		
 		}
	},
	
	adaptor : {
		
		"initialize" : function (options)  {
			adaptor = this;
			console.log(adaptor.name+ ' adaptor initiated');
			adaptor.error = options.error;
			adaptor.success = options.success;
			adaptor.parameters	= options.parameters || [];
//			console.log(adaptor.parameters);
			if (! (options.error && (typeof options.error === 'function'))) {
				console.error ('error function not supplied to adaptor: ' + adaptor.namespace + '/' + adaptor.name);
				return;
			}
			if (! (options.success && (typeof options.success === 'function'))) {
				options.error ('success function not supplied to adaptor: ' + adaptor.namespace + '/' + adaptor.name);
				return;
			}		
//			if (options.logging) console.log ('meo.my adaptor '+ adaptor.namespace + '/' + adaptor.name + '/' + 'content.js is logging');			

			options.type = adaptor.type;
			var names = adaptor.validateParameters (options); 
			adaptor.success (adaptor.main(names));
		},
		
		"validateParameters" : function (options) 
	 	{
//			console.log('validateParameters');
			parameters = options.parameters;
			var parameter;
			try {			
				if (options.type  == 'array') {
					var parameter = {};
					for (key in parameters) {
						parameter = parameters[key];
						if (parameter.inactive) {
							throw ('unexpected inactive parameter(s)');
						}
						if (!(parameter.content)) {
							throw ('missing parameter attribute(s)');
						}
					}
					return options.parameters;
				}
				else if (options.type == 'object') {
					var parameter = {}, names = {};
					for (key in parameters) {
						parameter = parameters[key];
						if (parameter.inactive) {
							throw ('unexpected inactive parameter(s)');
						}
						if (parameter.content) {
							names[parameter.content] = {}; 	
							}
						else {
							throw ('missing parameter attribute(s)'); }
					}
					return  names;
				} else
					throw ('unexpected parameters structure');
			} catch (e) {
				options.error(e);
			}
	 	}
	 			
	}
});
