// code shared by admin pages
common = $.extend(common, {

	getAdaptor : function(nsModule, options) {
//		console.log('getAdaptor');
		var file = '/schema/adaptors/vendor/'+nsModule+'/javascripts/adaptor.js';
		common.getJSONFile({
			file : file,
			success : function (jsScript) {
				window.App.clearAll();
				options.success && options.success ({script : jsScript});
			},
			error : function () {
				options.error && options.error ('getAdaptor error');
			}
		});
	},
		
	configurable : {
		"admin" : {
			"boilerplate" : {
				"admin_header_href" :"http://www.example.com/configurable",
				"admin_header1" :"Configurable",
				"admin_double_click_edit2" :"a configurable item.",
				"admin_input_placeholder" :"a configurable placeholder",
				"admin_enter_to_save2" :"configurable item",
				"admin_singular" :"configurable",
				"admin_plural" :"configurables",
				"admin_ok_to_reset2" :"configurable items."
			}
		}
	},
	
	configureTexts : {

		"initialize" : function () {
			var  cust = common.configurable.admin.boilerplate;
//			console.log(cust); 
			this.getConfigs(cust, {
				success : function () {
					common.configureTexts.setBoilers(cust);
				}
			});
		},

		"getConfigs" : function (cust, options) {
			var nsModule = $("#nsModule").val()	; 
			var pathtoFile = '/schema/adaptors/vendor/'+nsModule+'/admin.json';
			common.getJSONFile({
				file : pathtoFile,
				success : function (jsonScript) {
					var configurable = JSON.parse(jsonScript)[nsModule];
					for (key in configurable.admin.boilerplate) {
						cust[key] = configurable.admin.boilerplate[key];
					}
					options.success && options.success ();
				},
				error : function (e) {
					options.error && options.error ('getJSONFile error', e);
					console.error(e);
				}
			});		
		},

		setBoilers : function(cust, options) {
			
			var i18n = chrome.i18n.getMessage;
			// set common admin form boiler-plates. Subject to customisation (cust) and to internationalisation (i18n)
			$("#genericapp h1 a").prop( 'href', cust.admin_header_href);
			$("#genericapp h1 a").text(cust.admin_header1 +' '+i18n("admin_header"));
			$("#instructions li").text(i18n("admin_double_click_edit")+cust.admin_double_click_edit2);	
			$("#create-generic input").prop( 'placeholder', cust.admin_input_placeholder);
			$("#create-generic input").prop( 'text', i18n("admin_enter_to_save")+ cust.admin_enter_to_save2);

		    $("#generic-reset-button").attr( 'value', "what is wrong here?");

		}
	},
	
	validate : function(model) {	
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

		if (model.content) {
			try {
				console.log(model.content);
				json = JSON.parse(unescape(model.content));
			} catch (e) {
				smoke.signal(chrome.i18n.getMessage("admin_invalid_json"));
				console.log('Invalid JSON ', model);		
				console.log('You can re-test your JSON at http://json.parser.online.fr/');		
				return "admin_invalid_json";
			}
			
			if (!model.inactive) {
				var report = env.validate(json, schema.adaptor);
				if (report.errors.length === 0) {
					return; // JSON is valid against the module schema
				}
				try {
					smoke.signal(chrome.i18n.getMessage("admin_invalid_schema"));			
				} catch (e) {
					
				}			
				
			}
			console.log('Invalid module schema', report);		
			return report;
		}
		console.log('no model adaptor ', model); 
		return true;
	}
		
});
