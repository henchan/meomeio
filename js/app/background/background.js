//var background = {

var background = background || {};
background = $.extend(background, {

	actions : {
		CREATE : 'create'
	},
	
	getAdminModules : function(request) {
		console.log('getAdminModules: ' + request);
		request = request || {};
		var adminModules = [], modules = JSON.parse(localStorage
				.getItem('modules')), modParams = {};

		for ( var moduleKey in modules) {
			if (request.inactive || !(modules[moduleKey].inactive)) {
				console.log('selected module: ' + modules[moduleKey].module);
				if (modules[moduleKey].admin) {
					modParams = JSON.parse(localStorage
							.getItem(modules[moduleKey].module))
							|| [];
					for (i in modParams) {
						if (modParams[i].inactive) {
							delete modParams[i];
						};
					}
				} else {
					modParams = [];
				}

				adminModules.push({
					key : modules[moduleKey].module,
					id : modules[moduleKey].id,
					error : modules[moduleKey].error,
					lists : {
						whitelists : modules[moduleKey].whitelists || [],
						blacklists : modules[moduleKey].blacklists || []
					},
					parameters : modParams
				});
			}
		}
		console.log('adminModules', adminModules);
		return adminModules;
	},

	/*
	 * getLists : function (request, listType, sendResponse) { var lists =
	 * JSON.parse(localStorage.getItem(listType)) || []; sendResponse(lists); },
	 */
	getLists : function(request, listType, module, sendResponse) {
		var lists;
		if (module) {
			console.log('level2 ' + listType, module);
			lists = JSON.parse(localStorage.getItem(module)).listType || [];
		} else {
			console.log('level1 ' + listType);
			lists = JSON.parse(localStorage.getItem(listType)) || [];
		}
		console.log('lists', lists);
		sendResponse(lists);
	},

	putTags : function(request, sendResponse) {
		// store tags collected by adaptor(s)
		console.log('putTags');
		var tags = [];

		sendResponse(tags);
	},

	pageAction : function(request, sendResponse) {
		 chrome.tabs.getSelected(null, function (tab) {
			 chrome.pageAction.show(tab.id) ;
		 });
		sendResponse();
	},
		
	tryAdaptors : function(request, sendResponse) {
		params = request.parameters;
//		sendResponse(adaptor.url(params.spec, params.url));
// Try each adaptor type against the spec
		adaptor.url(params.spec, params.url);
		adaptor.html(params.spec, sendResponse);
	},
		
	htmlAdaptor : function(request, sendResponse) {
		params = request.parameters;
		adaptor.html_finish(params.extArr, sendResponse);
	},
		
	applyAdaptors : function(request, sendResponse) {
		var modules = [];
		adminModules = background.getAdminModules(request);
		
		for (i=0; i<adminModules.length; i++) 
		{		
			var module = {
				adaptor : adminModules[i].key,
				id : adminModules[i].id
			};		
			console.log('apply adaptors new way', module);			
			module.parameters = adminModules[i].parameters;
				module.lists = adminModules[i].lists;
				modules.push(module);
				if (modules.length === adminModules.length) {
					sendResponse(modules);
				}	

// TODO not actually called now. Use the code somewhere else ?
/*				var toggle_error = function(id) {
					var modules = JSON.parse(localStorage.getItem('modules'));
					if (modules[id].error || false) {
						delete modules[id].error;
					} else {
						modules[id].error = true;
					}
					localStorage.setItem('modules', JSON.stringify(modules));
				};
*/		}
	},

	setMenus : function() {
		var adminModules = this.getAdminModules();

		chrome.contextMenus
				.removeAll(function() {
					var menu_adap_top = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_adap_top")
					});

					var menu_adap_modules = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_adap_modules"),
						parentId : menu_adap_top
					});

					var menu_doc = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_doc"),
						parentId : menu_adap_top
					});

					var menu_schema = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_schema"),
						parentId : menu_adap_top,
						onclick : function(info) {
							chrome.tabs
									.create(
										{
											url : "/html/modules/reformed/index.html"
										}, function(info, tab) {
									});
						}
					});

					var menu_doc_jsv = chrome.contextMenus.
						create({
							"title" : "doc JSV",
							parentId : menu_doc,
							onclick : function(info) {
								chrome.tabs
										.create(
											{
												url : "/js/libs/JSV/docs/index.html"
											}, function(info, tab) {
										});
							}
					});

					var menu_doc_demo = chrome.contextMenus.
					create({
						"title" : chrome.i18n.getMessage("menu_doc"),
						parentId : menu_doc,
						onclick : function(info) {
							chrome.tabs
									.create(
										{
											url : "/docs/html.html"
										}, function(info, tab) {
									});
						}
				});

					var menu_wbl = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_wbl"),
						parentId : menu_adap_top
					});

					var menu_adap_all = chrome.contextMenus
							.create({
								"title" : chrome.i18n
										.getMessage("menu_adap_all"),
								parentId : menu_adap_modules,
								onclick : function(info) {
									chrome.tabs
											.create(
													{
														url : "/html/modules/modules.html"
													}, function(info, tab) {
													});
								}
							});

					var menu_wbl_wl_lev1 = chrome.contextMenus
							.create({
								"title" : chrome.i18n
										.getMessage("menu_wbl_wl_lev1"),
								parentId : menu_wbl,
								onclick : function(info) {
									chrome.tabs
											.create(
													{
														url : "/html/lists/level1/whitelists.html"
													}, function(info, tab) {
													});
								}
							});

					var menu_wbl_bl_lev1 = chrome.contextMenus
							.create({
								"title" : chrome.i18n
										.getMessage("menu_wbl_bl_lev1"),
								parentId : menu_wbl,
								onclick : function(info) {
									chrome.tabs
											.create(
													{
														url : "/html/lists/level1/blacklists.html"
													}, function(info, tab) {
													});
								}
							});

					var menu_adap_active = chrome.contextMenus.create({
						"title" : chrome.i18n.getMessage("menu_adap_active"),
						parentId : menu_adap_modules
					});

					for (i in adminModules) {
						(function setMenuProperties(adminModule) {
							var splitMod = adminModule.key.split('/', 2), ns = splitMod[0], module = splitMod[1];
							return chrome.contextMenus
									.create({
										title : module,
										parentId : menu_adap_active,
										onclick : function(info) {
											chrome.tabs
													.create(
															{
																url : "/html/modules/genericModule.html?module="
																		+ ns
																		+ '/'
																		+ module
																		+ '&id='
																		+ adminModule.id
															}, function(info,
																	tab) {
															});
										}
									});
						})(adminModules[i]);
					}
				});
	},
	
	initialize : function () {
		background.setMenus();
	}
	
});

//Common, re-usable routines
//--------------------------
//This code, usually elsewhere, is presented in url.js for demo purposes  
var common = common || {};
common = $.extend(common, {
//A common routine for copying default property values from schema to spec.  
//Since JSON Schema is used to validate spec against schema, schema properties is assuredly a superset of spec properties
	schemaDefaults : function (schema, spec) { 
//use the JSV schema methods to navigate into the schema object
console.log('schema', schema)
		var childNames = schema.getProperty('properties').getPropertyNames(),
		childs = childNames.length, i;
		defVal = schema.getProperty('default').getValue();
		if (!spec) {
//schema has a default value for this property but spec is not defined 
			if (defVal !== undefined && childs === 0) {
				spec = defVal;
			}
			else {
				spec = {};
			}
		} 
		
//start looking for defaults amongst the schema object's children (if any)
		for (i=0; i<childs; i++) {
			childName = childNames[i];
			
			spec[childName] = 
				common.schemaDefaults (
					schema.getProperty('properties').getProperty(childName),
					spec[childName]
			);
		}
		return spec;
}

});

// App starts here
background.initialize();
