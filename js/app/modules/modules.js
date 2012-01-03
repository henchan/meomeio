// A Backbone application based on work by [Jérôme Gravel-Niquet](http://jgn.me/). 
$(function() {

	window.Module = Backbone.Model.extend({
		
		defaults : {
			module : "empty module...",
			inactive : false,
			admin : false,
			error : false
		},

		initialize : function() {
			if (!this.get("module")) {
				this.set({
					"module" : this.defaults.module
				});				
			}
			this.admin = this.admin || false;
		},

		toggle : function() {
			this.save({
				inactive : !this.get("inactive")
			});
			if (this.get("inactive")) this.set({admin: false});
		},

		clear : function() {
			this.destroy();
			this.view.remove();
		},

		validate: function(module) {
			var model = this,
			errMsg = null;
			if (module.module && !module.id) { // a new entry. synchronous test, so can abort data entry				
				var firstSlash;
				if (((firstSlash = module.module.indexOf('/')) <= 0)
						|| firstSlash == module.module.length - 1
						|| module.module.indexOf('/', firstSlash + 1) > -1) {
					errMsg = chrome.i18n.getMessage("admin_invalid_namespace");				
					smoke.alert(errMsg);
				}
			}
 			else if (!module.inactive && module.id) { // an activation. asynchronous test, so cannot abort data entry
				var files = [], filepath,
				path = '/schema/adaptors/vendor/' + module.module;
				if (module.admin) {
					files = files.concat(['admin.json', 'defaults.json']);
				}
				var i = 0;
				async.whilst(
				    function () { return i < files.length; },
				    function (callback) {
						filepath = path + '/' + files[i];
				        i++;
						common.getJSONFile({
							file : filepath,
							success : function() {
								callback(null);
							},
							error : function() {
								model.error = true;
								errMsg = chrome.i18n.getMessage("admin_missing_file") + filepath;
								callback(errMsg)
							}
						});					
				    },
					function(err) {
						if (err) {
							smoke.signal(errMsg);
						} 
				    }
				);		
			}
			return errMsg;
	}		
	});

	window.ModuleList = Backbone.Collection.extend({

		model : Module,

		localStorage : new Store("modules"),

		all : function() {
			return this.filter(function(module) {
				return module.get('module');
			});
		},

		inactive : function() {
			return this.filter(function(module) {
				return module.get('inactive');
			});
		},
		
		setDefaults : function() {
			common.setDefaults(this, 'modules', 'Adaptors');
		},

		storageEventListener : function (storageKey) {
			function storageEventHandler(event){
				if (event.key === storageKey) {
					request = new messenger.Message ({
						source : 'admin', 
						module : 'modules'
					});
					request.send();
				}
			}
			window.addEventListener('storage', storageEventHandler, false);
		},

		remaining : function() {
			return this.without.apply(this, this.inactive());
		},

		comparator : function(module) {
			var LARGENUM = 1000000;
			return (module.get('inactive') ? LARGENUM - module.get('hits')
					: 0 - module.get('hits'));
		}
	});

	window.Modules = new ModuleList;

	window.ModuleView = Backbone.View
			.extend({

				tagName : "li",

				template : _.template($('#item-template').html()),

				events : {
					"click .check" : "toggleInactive",
					"dblclick div.module-content" : "edit",
					"click span.module-destroy" : "clear",
					"click span.module-whitelist" : "whitelist",
					"click span.module-blacklist" : "blacklist",
					"click span.module-admin" : "admin",
					"click .module-admin-check" : "toggleAdmin",
					"keypress .module-input" : "updateOnEnter"
				},

				initialize : function() {
					_.bindAll(this, 'render', 'close');
					this.model.bind('change', this.render);
					this.model.view = this;
				},

				render : function() {
					$(this.el).html(this.template(this.model.toJSON()));
					this.setContent();
					return this;
				},

				setContent : function() {
					var module = this.model.get('module');
					this.$('.module-content').text(module);
					this.input = this.$('.module-input');
					if (!(this.model.get('inactive'))) {
						this.$('.module-destroy').remove();
					}
					else {
						this.$('.module-admin-check').remove();						
						this.$('.module-admin').remove();						
						this.$('.module-whitelist').remove();						
						this.$('.module-blacklist').remove();						
					}
					if (!(this.model.get('admin'))) {
						this.$('.module-admin').remove();
					}
					this.input.bind('blur', this.close);
					this.input.val(module);
				},

				toggleInactive : function() {
					this.model.toggle();
				},

				toggleAdmin : function() {
					if (this.model.get("inactive")) {return false;}
					this.model.save({
						admin : !this.model.get("admin")
					});

				},

				edit : function() {
					$(this.el).addClass("editing");
					this.input.focus();
				},

				close : function() {
					this.model.save({
						module : this.input.val()
					});
					$(this.el).removeClass("editing");
				},

				updateOnEnter : function(e) {
					if (e.keyCode == 13)
						this.close();
				},

				remove : function() {
					$(this.el).remove();
				},

				admin : function() {
					var splitMod = this.model.get('module').split('/', 2), ns = splitMod[0], module = splitMod[1];
					module = this.model.get('id');
					chrome.tabs.create({
						url : '/html/modules/genericModule.html?module='+ module+'&id='+ this.model.get('id'),
						index : 0
					}, function() {
					});
				},

				whitelist : function() {
					module = this.model.get('id');
					chrome.tabs.create({
						url : '/html/lists/level2/whitelists.html?module='+ module,
						index : 0
					});
				},

				blacklist : function() {
					module = this.model.get('id');
					chrome.tabs.create({
						url : '/html/lists/level2/blacklists.html?module='+ module,
						index : 0
					});
				},

				clear : function() {
					this.model.clear();
				}

			});

	window.AppView = Backbone.View.extend({

		el : $("#moduleapp"),

		statsTemplate : _.template($('#stats-template').html()),

		events : {
			"keypress #new-module" : "createOnEnter",
			"keyup #new-module" : "showTooltip",
			"click .module-clear a" : "clearCompleted",
			"click .module-reset .module-reset-button" : "setDefaults"
		},

		initialize : function() {
			_.bindAll(this, 'addOne', 'addAll', 'render');

			this.input = this.$("#new-module");

			Modules.bind('add', this.addOne);
			Modules.bind('reset', this.addAll);
			Modules.bind('all', this.render);

			Modules.fetch();
		},

		render : function() {
			var inactive = Modules.inactive().length;
			this.$('#module-stats').html(this.statsTemplate({
				total : Modules.length,
				inactive : Modules.inactive().length,
				remaining : Modules.remaining().length
			}));
			$("#admin_modules_header").text(chrome.i18n.getMessage("admin_modules_header"));
		},

		addOne : function(module) {
			var view = new ModuleView({
				model : module
			});
			this.$("#module-list").append(view.render().el);
		},

		addAll : function() {
			Modules.each(this.addOne);
		},

		newAttributes : function() {
			return {
				module : this.input.val(),
				hits : 0,
				inactive : false,
				admin : false
			};
		},

		createOnEnter : function(e) {
			if (e.keyCode != 13)
				return;
			Modules.create(this.newAttributes());
			this.input.val('');
		},

		clearCompleted : function() {
			_.each(Modules.inactive(), function(module) {
				module.clear();
			});
			return false;
		},

		clearAll : function() {
			_.each(Modules.all(), function(module) {
				module.clear();
			});
			return false;
		},

		setDefaults : function() {
			Modules.setDefaults();
		},

		showTooltip : function(e) {
			var tooltip = this.$(".ui-tooltip-top");
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout)
				clearTimeout(this.tooltipTimeout);
			if (val == '' || val == this.input.attr('placeholder'))
				return;
			var show = function() {
				tooltip.show().fadeIn();
			};
			this.tooltipTimeout = _.delay(show, 1000);
		}
	});
	
	window.App = new AppView;
	
	Modules.storageEventListener('modules');  // start up the listener immediately
});
