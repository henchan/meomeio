var adaptor =
	{
		"namespace" 	: "example.com", 
		"name"			: "sampleAdaptor",
		"description"	: "sampleAdaptor adaptor for Me☸my",
		"updates"		: "http://example.com/sampleAdaptor/updates",
		"version"		: "0.1.1",

		"dataObj"		: "{valuesArr : []}", 
		"errorObj" 		: "{code : null, message : null}",
		
		"initialize" : function (options)  {	
			adaptor.parameters 	= options.parameters || {};
			if (! (options.error && (typeof options.error === 'function'))) {
				console.error ('error function not supplied to adaptor: ' + adaptor.namespace + '/' + adaptor.name);
				return;
			}
			if (! (options.success && (typeof options.success === 'function'))) {
				options.error ('success function not supplied to adaptor: ' + adaptor.namespace + '/' + adaptor.name);
				return;
			}		
			if (adaptor.parameters.logging) console.log ('meo.my adaptor '+ adaptor.namespace + '/' + adaptor.name + '/' + 'content.js is logging');
			
			// Add your custom function(s) calls in initialize. Alter myCustom and below as required. 		
			adaptor.myCustom (); 
		},
		
	 	"myCustom" : function () 
	 	{ 
			var dataArr = adaptor.dataObj.valuesArr;
			dataArr[dataArr.length] = "myComputedValue1";
			dataArr[dataArr.length] = "myComputedValue2";
			var mySuccessCondition = null;
	 		if (mySuccessCondition) { 
	 			success (adaptor.dataObj);
	 		}
	 		else {
	 			errorObj.message = "an error occured";
	 	 		errorObj.code = "1001";
	 			error(errorObj);
	 		}
		} 

	};