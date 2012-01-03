// [html.js](/modules/core/process/html.js) holds synchronous html processing logic for meo.my adaptors.  
// The adaptor.html() function is called asynchronously from the Chrome context page and executed in Chrome's background process.
// It gets called by any active adaptor whose spec includes at least one active html item.  
// The function of this code is to extract meta data from a given page of HTML and return an array of tag strings  


//adaptor.html ()
//==============
var adaptor = adaptor || {};
adaptor = $.extend(adaptor, {

// sanitise a user-specified string for use as a CSS selector
// TODO move this sanitisation step to the input form
	"sanCSS" : function () {
		var escChars = {'!':'\\!',  '"':'\\"',  '#':'\\#',  '$':'\\$',  '%':'\\%',  '&':'\\&',  '\'':'\\\'',  '(':'\\(',  ')':'\\)',  '*':'\\*',  '+':'\\+',  ',':'\\,',  '.':'\\.',  '/':'\\/',  ':':'\\:',  ';':'\\;',  '<':'\\<',  '=':'\\=',  '>':'\\>',  '?':'\\?',  '@':'\\@',  '[':'\\[',  '\\':'\\\\',  ']':'\\]',  '^':'\\^',  '`':'\\`',  '{':'\\{',  '|':'\\|',  '}':'\\}',  '~':'\\~' };		
		return function (unsanitised) {
			return unsanitised.replace(/[!"#$%&'()*+,.\/:;<=>?@[\]^`{|}~]/g, function(c) {
				return escChars [c];
			});
		};
	}(),

	"html" :  function (specs, sendResponse)
	{
// Parameters
// ----------
// **schema** is an object in the environment which gives a 'html' adaptor its logical structure and default values. 
// For html schema's source, download [adaptor.json](/modules/core/admin/generic/schema/adaptor.json) and search for 
//	> "id": "http://meo.my/versions/0.1.7/json-schema/adaptor/html"  
// **specs** is an array of objects for a vendor-supplied or user-defined adaptor. It is valid against the JSON Schema 'schema' parameter.  
//  **sendResponse** is a function connecting us back to the caller (content page) which will, in its own context, execute the jquery srtring and notify results back here.
 
// initialise output array
		var tagArr = [], spec, selArr,
		baseSchema = schema.env.findSchema("http://meo.my/versions/0.1.7/json-schema/adaptor/html")
			._attributes.properties,
		hTag = {}, selOptions, i, j, name, key, value;
console.log('html baseSchema',baseSchema);
// step through the specs object
		for (h in specs) {
// process one spec at a time
			spec = specs[h];
//content is a json object, stored as a string in localStorage. Consequently it needs to escape some characters
				var cont = JSON.parse(URI.unescapeComponent(spec.content));
// Stop if this spec does not contain a directive to process a html page
				if (cont && cont.html) {
//set the spec's default values for schema properties which are not explicitly mentioned in the adaptor spec
					selArr = common.schemaDefaults (baseSchema.selectors, cont.html.selectors);
					extractor = common.schemaDefaults (baseSchema.extractor, cont.html.extractor);
	//				cont = common.schemaDefaults (baseSchema, selArr, extractor);
					console.log('html spec after defaults: ', selArr, extractor);
// selectors http://meo.my/versions/0.1.7/json-schema/adaptor/html/selector
	//				selArr = cont.selectors, 
					selector = {}; 
// construct a jQuery selector string
					for (i=0; i<selArr.length; i++) {
						selector = selArr[i];
						selOptions = selector.options || {};
						for (j=0; j<selector.tags.length; j++) {
							hTag = selector.tags[j];
// name is mandatory 
							name = adaptor.sanCSS (hTag.name);
							if (hTag.attribute) 
							{
// in the schema, key is mandatory for an attribute
								key = adaptor.sanCSS (hTag.attribute.key);
								if (hTag.attribute.value) {
									value = adaptor.sanCSS (hTag.attribute.value);
// although tag name is required it is ignored in the special cases of key == 'id' or 'class'
									if (key.toLowerCase === 'id') {
										jQstring = '$("#'+value+'")';							
									}
									else if (key.toLowerCase === 'class') {
										jQstring = '$(".'+value+'")';							
									}
									else {
// attribute key must have specified value
										jQstring = '$(\''+name+'['+key+'="'+ value+'"]\')';													
									}
								}
								else {
									jQstring = '$('+name+'['+key+'])';							
								}
							}
							else {
								jQstring = '$("'+name+'")';						
							}
							console.log(jQstring);		
// append executor to selector string. 
// extArr is a results array defined in the content_page function, where this jquery string will execute
 
// TODO handle empty and multi extractor.attribute 
// TODO handle case where key name is to be extracted
 							jQstring = jQstring + 
 								'.each( function (i) { extArr.push($(this).attr('+ 
 									JSON.stringify(extractor.attribute.key)+
 								'));})';								
// ("meta").each( function (i) { extArr.push(this.attr("keywords"))})							
							console.log('jQstring', jQstring);
// message the selector/extrator string back to the content_page
							sendResponse && sendResponse(
								{ adaptor : "html", jQstring : jQstring, extractor : extractor }
							);
						}
					}
				}
		}
// adaptor.html () returns
// ----------------------
// returns an array of tags that were discovered in the html.
		console.log('html tagArr at the end', tagArr)	;
		return  tagArr ;
	},

// finish processing the array of tags extracted by content_page. 
// This is a separate function reached by messaging, beause callbacks from content_page don't work.
	"html_finish" :  function (params, sendResponse)
	{
		if (params && (extArr = params.extArr)) {
// Content page has successfully executed the selector/extractor and replied back with extracted array of tags for us to store.		
			var extractor = params.extractor,
			separators = extractor.options.separators, tagArr;
			console.log('extArr', extArr[0]);

			
		 	for (i in separators) {
		 		tagArr = extArr[0].split(separators[i]);
				for (j=0; j< tagArr.length;j++) { // strip leading and trailing white space(s)
					tagArr[j]= tagArr[j].replace(/^\s+/, '').replace(/\s+$/, ''); 
				}
		 	}
		}
		console.log('html tagArr at the end', tagArr)	;
	}
});



//Document status and license
//---------------------------
//Published under a [MIT license](/couchapps/profile/_attachments/licenses/meo.my.mit.txt),
// this is a source code fragment of a work-in-progress web application.
//This file has been created for the purpose of a demonstration.
// It is incomplete and not intended to be used as-is.  
//Documentation created with [docco](http://jashkenas.github.com/docco/).  
