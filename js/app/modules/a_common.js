// code shared by admin pages

common = $.extend(common, {

	moduleQueryURL : function(queryType, callback) {
		chrome.tabs
				.getCurrent(function(tab) {
					var tabUrl = tab.url, keyVal, 
					queryArr = $.url(tabUrl).attr('query').split('&');
					console.log(queryArr)
					for (i in queryArr) {
						keyVal = queryArr[i].split('=');
						if (keyVal[0] === queryType) {
							callback(JSON.parse(localStorage
									.getItem('modules'))[keyVal[1]]);
						}
					}
				});
	},

	setDefaults : function(module, modStr, modDesc, itemName) {
		common.getDefaults (modStr,
		{
			warning : 
				chrome.i18n.getMessage("admin_ok_to_reset1") +
				itemName +
				chrome.i18n.getMessage("admin_ok_to_reset3") ,
			success : function (defaults) {	
				var modules = defaults.data[modStr];
				for (i in modules) {
					module.create(modules[i]);
				}
			},
			error : function () {				
			},
			decline : function () {	
			}
		});
	},

	getDefaults : function(nsModule, options) {
		smoke.confirm(options.warning, function(a){
			if (a) {
				if (nsModule.indexOf('/') == -1) 
				{ path = 'defaults.json';}
				else {path = '/schema/adaptors/vendor/'+nsModule+'/defaults.json';}
					common.getJSONFile({
					file : path,
					success : function (jsonScript) {
						window.App.clearAll();
						options.success && options.success ({data : JSON.parse(jsonScript)});
					},
					error : function () {
						options.error && options.error ('getJSONFile error');
					}
				});
			} else {options.decline && options.decline(); }
		});
	},
	
	reformed_edit : function (selector) {
		if ($("#reformed").is(':hidden')){
			$('#reformed').reform($('#input').val(), {
				'editor' : 'edit'
			});
			$(selector)
					.each(
							function(idx, el) {
								console.log('el', el);
								var syntax = null;
								if ($(el)
										.attr(
												'data-mediatype') == 'text/javascript') {
									syntax = 'js';
								} else if ($(el)
										.attr(
												'data-mediatype') == 'text/html') {
									syntax = 'html'
								}
								$(el)
										.focus(
												function(
														ev) {
													active_editor = bespin
															.useBespin(
																	el,
																	{
																		stealFocus : true,
																		syntax : syntax,
																		settings : {
																			tabstop : 2,
																			theme : "white"
																		}
																	});
												});
							});
			$("#reformed").toggle();
			return true;
		}
		$("#reformed").toggle();
		return false;
	}
});
