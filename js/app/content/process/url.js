// [url.js](/modules/core/process/url.js) holds synchronous url processing logic for meo.my adaptors.  
// The adaptor.url() function is called asynchronously from the Chrome context page and executed in Chrome's background process.
// It gets called by any active adaptor whose spec includes at least one active url item.  
// The function of this code is to extract meta data from a given URL and return an array of tag strings  

// requires the library module [uri.js](https://github.com/garycourt/JSV/tree/master/lib/uri)  
//TODO evaluate and replace Crockford's regexp
var URI = require("/libs/JSV/lib/uri/uri").URI;

//adaptor.url ()
//==============
var adaptor = adaptor || {};
adaptor = $.extend(adaptor, {
	"url" :  function (specs, url)
	{
// Parameters
// ----------
// **schema** is an object in the environment which gives a 'url' adaptor its logical structure and default values. 
// For url schema's source, download [adaptor.json](/modules/core/admin/generic/schema/adaptor.json) and search for 
//	> "id": "http://meo.my/versions/0.1.7/json-schema/adaptor/url"  

// **specs** is a vendor-supplied or user-defined adaptor array of objects. It is valid against the JSON Schema 'schema' parameter.  
// **url** is the url upon which the function is to operate. Typically, it is the url of the window active in the Chrome browser's context page.   
// initialise output array
		var tagArr = [],
		baseSchema = schema.env.findSchema("http://meo.my/versions/0.1.7/json-schema/adaptor/url")
			._attributes.properties;

// step through the specs object	
console.log('url baseSchema',baseSchema);
		for (h in specs) {
// process one spec at a time
			var spec = specs[h];
//content is a json object, stored as a string in localStorage.
// Consequently it needs to escape some characters
				var cont = JSON.parse(URI.unescapeComponent(spec.content));				
// Stop if this spec does not contain a directive to process a url
				if (cont && cont.url)
				{
					cont = cont.url;
// Validate that the input url conforms to standard.				
// Break it into non-empty components.
					var components = common.parseURL(url);					
					for (component in components) 
					{
						var comp = components[component];
//this component is in both the spec and the url, so we'll process it			
						if (cont[component]) {
//set the spec's default values for schema properties which are not explicitly mentioned in the adaptor spec
							cont[component] = 
								common.schemaDefaults (
										baseSchema[component], cont[component]);
							console.log('spec after defaults: ', component, cont[component]);
//For some component types, simply append url component to output array
							if (component === 'full') {
								tagArr.push(comp); 
							}
							else if (component === 'scheme') {
								tagArr.push(comp);	
							}
							else if (component === 'host') {
// TODO add some sub-domain logic here
								tagArr.push(comp);
							}
							else if (component === 'path') {
// TODO add some path splitting logic here
								tagArr.push(comp);
							}
//Query parameters are processed before output
							else if (component === 'query') {
//Parameters specifies which logic to use below
								var params = cont.query.parameters;
								if (cont.query.full) { 
//Entire query string
									tagArr.push(comp); 
								}
								var keys = params.keys,
//false means no restriction by query key name
								regexp = keys.matching ? new RegExp(keys.matching === true ? '/^*$/' : keys.matching) : false,
//split up the url query string into key/value pairs  
//TODO review semi-colon query syntax
								queryPairs = comp.split('&'),
//A single query value may have more than one tag in it.
// + is used by most search engines to separate search terms in the url  
// e.g. http://www.google.com/search?q=json+query+default  
// gives [json,query,default] as a result									
								splitter = params.splitter,
								splitQv = splitter === true ? [] : 
									typeof splitter == 'string' ? [splitter] : splitter,
								max = params.max, j, k, l;
								for (j=0; j<queryPairs.length && (!max || j < max); j++) 
								{
									var keyVal = queryPairs[j].split('='),
										key = keyVal[0], val = keyVal[1];
// Either no key matching restriction is specified. Or the key matches a specified regular expression.
									if (!regexp || (regexp && regexp.test(key))) 
										{
											if (keys.use) { tagArr.push(key); }
// convert url encoded values to their normal ascii values
											val =
												params.decode ? 
													decodeURIComponent(val) : val;												
// strip leading and trailing whitespaces
											val =
												params.strip_ws ? 
														val.replace(/^\s+|\s+$/g,"") : val;	
// convert to all lower case, where supported by the character set
											val = 
												params.lower_case ?
													val.toLowerCase() : val;
// TODO chain the previous 3 tests												
											tagArr.push(val);
											if (splitQv) {
												for (k=0; k<splitQv.length; k++) {
// an array of splitters is specified
													var valueSplit = value.split(splitQv[k]);
													if (valueSplit.length >1) {
														for (l=0; l<valueSplit.length; l++) {
															tagArr.push(valueSplit[l]); 
														}
// at most, one effective splitter per value
														break; 
													}
												}
											}
										}
									}
// TODO completion logic
									var completion = params.completion;
									if (completion === true) {
// random completion tags
									}
									else if (completion && completion.length >0) {
// specified completion tag array
									}
									
								}
								else if (component === 'hash') {
									tagArr.push(comp);
								}
							}	 			
						}	 				
					}
				
	}
// adaptor.url () returns
// ----------------------
// returns an array of tags that were discovered in the url parameter.
		console.log('tagArr at the end', tagArr)	;
		return  tagArr ;
	}
});



//Document status and license
//---------------------------
//Published under a [MIT license](/couchapps/profile/_attachments/licenses/meo.my.mit.txt),
// this is a source code fragment of a work-in-progress web application.
//This file has been created for the purpose of a demonstration.
// It is incomplete and not intended to be used as-is.  
//Documentation created with [docco](http://jashkenas.github.com/docco/).  
