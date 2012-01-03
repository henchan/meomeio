// A Backbone application based on work by [Jérôme Gravel-Niquet](http://jgn.me/). 
$(function() {

	// Blacklist Model
	window.Blacklist = Backbone.Model.extend({

		defaults : {
			blacklist : "empty blacklist...",
			inactive : false
		},

		initialize : function() {
			
			if (!this.get("blacklist")) {
				this.set({
					"blacklist" : this.defaults.blacklist
				});
			}
		},

		validate: function(model) {
			return common.validate (model,'blacklist');
		},
	
		toggle : function() {
			this.save({
				inactive : !this.get("inactive")
			});
		},

		clear : function() {
			this.destroy();
			this.view.remove();
		}

	});

	window.BlacklistList = Backbone.Collection.extend({

		model : Blacklist,

		localStorage : new Store("blacklists"),

		inactive : function() {
			return this.filter(function(blacklist) {
				return blacklist.get('inactive');
			});
		},

		all : function() {
			return this.filter(function(blacklist) {
				return blacklist.get('blacklist');
			});
		},

/*		setDefaults : function() {
			common.setDefaults(
				this, 'blacklists', 
				chrome.i18n.getMessage("lists_black_plural"), 
				chrome.i18n.getMessage("lists_black_items")
			);
		},
*/

		setDefaults : function() {
			defaults = getBlacklistDefaults();
			for (i in defaults) {
				this.create(defaults[i]);
			} ;
		},
		
		remaining : function() {
			return this.without.apply(this, this.inactive());
		},

		comparator : function(blacklist) {
			var LARGENUM = 1000000;
			return (blacklist.get('inactive') ? LARGENUM - blacklist.get('hits')
					: 0 - blacklist.get('hits'));
		}

	});

	window.Blacklists = new BlacklistList;

	window.BlacklistView = Backbone.View.extend({

		tagName : "li",

		template : _.template($('#item-template').html()),

		events : {
			"click .check" : "toggleInactive",
			"dblclick div.blacklist-content" : "edit",
			"click span.blacklist-edit" : "reformed_edit",
			"click span.blacklist-destroy" : "clear",
			"keypress .blacklist-input" : "updateOnEnter"
		},

		initialize : function() {
			_.bindAll(this, 'render', 'close');
			this.model.bind('change', this.render);
			this.model.view = this;

			if (! $("#reformed").is(':hidden')) {$("#reformed").toggle();}
		},

		render : function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setContent();
			return this;
		},

		setContent : function() {
			var blacklist = this.model.get('blacklist');
			this.$('.blacklist-content').text(blacklist);
			this.input = this.$('.blacklist-input');
			this.input.bind('blur', this.close);
			this.input.val(blacklist);
		},

		toggleInactive : function() {
			this.model.toggle();
		},

		edit : function() {
			$(this.el).addClass("editing");
			this.input.focus();
		},

		close : function() {
			
			this.model.save({
				blacklist : this.input.val()
			});
			$(this.el).removeClass("editing");
		},

		updateOnEnter : function(e) {
			if (e.keyCode == 13) {
				this.close();
			}
		},

		remove : function() {
			$(this.el).remove();
		},

		clear : function() {
			this.model.clear();
		},
		
		reformed_edit : function() {
			if (! common.reformed_edit ('.blacklist-edit') ) {
				$('#reformed').submit(function(){ return false; }).submit();
				$('#input').val($.rejson('#reformed'));
				this.edit();
			};													
		}
	});

	window.AppView = Backbone.View.extend({

		el : $("#blacklistapp"),

		statsTemplate : _.template($('#stats-template').html()),

		events : {
			"keypress #new-blacklist" : "createOnEnter",
			"keyup #new-blacklist" : "showTooltip",
			"click .blacklist-clear a" : "clearCompleted",
			"click .blacklist-reset .blacklist-reset-button" : "setDefaults"
		},

		initialize : function() {
			_.bindAll(this, 'addOne', 'addAll', 'render');

			this.input = this.$("#new-blacklist");

			Blacklists.bind('add', this.addOne);
			Blacklists.bind('reset', this.addAll);
			Blacklists.bind('all', this.render);

			Blacklists.fetch();
		},

		render : function() {
			var inactive = Blacklists.inactive().length;
			this.$('#blacklist-stats').html(this.statsTemplate({
				total : Blacklists.length,
				inactive : Blacklists.inactive().length,
				remaining : Blacklists.remaining().length
			}));
			$("#lists_black_header").text(chrome.i18n.getMessage("lists_black_header"));
			$("#blacklist-reset-button").val(chrome.i18n.getMessage("admin_reset_all"));

			this.render_hint();
		},
		
		render_hint : function() {
			var i18n = chrome.i18n.getMessage;
			
			$("#lists_black_hint").text(i18n("lists_black_hint"));
			$("#lists_black_hint_p1").text(i18n("lists_black_hint_p1"));
			$("#lists_black_hint_p2").html(
				i18n("lists_black_hint_p2_1") +
				'<a href="http://json-schema.org/"> JSON Schema </a>' +
				'<a href="/schema/lists/listsschema.json">' +
					i18n("lists_black_hint_p2_2")+ '</a>' +
				i18n("lists_black_hint_p2_3" )
			);
			$("#lists_black_hint_p3").html(
				i18n("lists_black_hint_p3_1") + 
				'</li>' + '<li>' +
				i18n("lists_black_hint_p3_2") 
			);
			$("#lists_black_hint_p4").text(i18n("lists_black_hint_p4"));
			$("#lists_black_hint_p5_1").text(i18n("lists_black_hint_p5_1"));
			$("#lists_black_hint_p5_2").text(i18n("lists_black_hint_p5_2"));
			$("#lists_black_hint_p5_3").text(i18n("lists_black_hint_p5_3"));
			$("#lists_black_hint_p6").text(i18n("lists_black_hint_p6"));
			$("#lists_black_hint_p7_1").text(i18n("lists_black_hint_p7_1"));
			$("#lists_black_hint_p7_2").text(i18n("lists_black_hint_p7_2"));
			$("#lists_black_hint_p8").html(
				i18n("lists_black_hint_p8_1") +
				'<a href="/html/lists/doc/lists.html"> '+
					i18n("lists_black_hint_p8_2") + '</a>' +
				i18n("lists_black_hint_p8_3" )
			);
		},


		addOne : function(blacklist) {
			var view = new BlacklistView({
				model : blacklist
			});
			this.$("#blacklist-list").append(view.render().el);
		},

		addAll : function() {
			Blacklists.each(this.addOne);
		},

		newAttributes : function() {
			return {
				blacklist : this.input.val(),
				hits : 0,
				inactive : false
			};
		},

		createOnEnter : function(e) {
			if (e.keyCode != 13)
				return;
			Blacklists.create(this.newAttributes());
			this.input.val('');
		},

		clearCompleted : function() {
			_.each(Blacklists.inactive(), function(blacklist) {
				blacklist.clear();
			});
			return false;
		},

		clearAll : function() {
			_.each(Blacklists.all(), function(blacklist) {
				blacklist.clear();
			});
			return false;
		},

		setDefaults : function() {
			this.clearAll();
			Blacklists.setDefaults();
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
});
