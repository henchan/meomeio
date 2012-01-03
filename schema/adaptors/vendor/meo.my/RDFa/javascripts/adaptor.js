var adaptor = $.extend(adaptor || {}, {

	"meo.my/RDFa" : {
		"namespace" 	: "meo.my", 
		"name"			: "RDFa",
		"description"	: "RDFa adaptor for Me☸my",
		"updates"		: "http://meo.my/adaptor/RDFa/updates",
		"version"		: "0.1.1",
		"dataObj"		: "{valuesArr : []}", 
		"errorObj" 		: "{code : null, message : null}",
		
		"initialize" : function (options)  {
			console.log('RDFa adaptor initialized');
		}
	}
});

