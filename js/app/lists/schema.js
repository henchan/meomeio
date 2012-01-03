var schema = schema || {};
schema.env = schema.env || JSV.createEnvironment("json-schema-draft-03"); // latest draft
	
if (!schema.lists) {
	file = '/schema/lists/listsschema.json';
	common.getJSONFile({
		file : file,
		success : function(jsonScript) {					
			schema = $.extend(schema, {
				lists : JSON.parse(jsonScript)
			});	
		},
		error : function() {
		}
	});
}