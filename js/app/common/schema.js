var schema = schema || {};
schema.env = schema.env || JSV.createEnvironment("json-schema-draft-03"); // latest draft
	
if (!schema.adaptors) {
	schema.adaptors = [];
	file = '/schema/adaptors/adaptor.json';
	common.getJSONFile({
		file : file,
		success : function(jsonScript) {	
			var i, scriptObj = JSON.parse(jsonScript),
			schemas = scriptObj.schemas;

			console.log('scriptObj',scriptObj);
			for (i=schemas.length-1; i>=0; i--) {
				schema.env.createSchema(schemas[i]);
			}
			schema.env.setOption("defaultSchemaURI", "http://meo.my/versions/0.1.7/json-schema/adaptor");
			schema = $.extend(schema, {
				adaptor : schema.env.findSchema("http://meo.my/versions/0.1.7/json-schema/adaptor")
			});		
		},
		error : function() {
		}
	});
	

}