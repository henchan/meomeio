common = $.extend(common, {

	initialize : (function () {

	})(),

	validate : function(model, listType) {
				
		var env = schema.env;		
		(function unescape(escapedStr) {
			return function() {
				var character = {
					'\\' : ''
				};
				return escapedStr.replace(/[\\]/g, function(c) {
					return character[c];
				});
			};
		})();

		if (model[listType]) {
			try {
				json = JSON.parse(unescape(model[listType]));		
			} catch (e) {
				smoke.signal(chrome.i18n.getMessage("lists_invalid_json"));
				console.log('Invalid JSON ', model[listType]);		
				console.log('You can re-test your JSON at http://json.parser.online.fr/');		
				return "lists_invalid_json";
			}			
			var report = env.validate(json, schema.lists);
			if (report.errors.length === 0) {
				return; // JSON is valid against the lists schema
			}
			try {
				smoke.signal(chrome.i18n.getMessage("lists_invalid_schema"));			
			} catch (e) {
				
			}			
			console.log('Invalid lists schema', report);		
			return report;
		}
		console.log('no model list ', model); 
	}
});