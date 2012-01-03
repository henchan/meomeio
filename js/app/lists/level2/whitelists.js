$(document)
		.ready(

				// A Backbone application based on work by [Jérôme Gravel-Niquet](http://jgn.me/).
				$(function() {

					common
							.moduleQueryURL(
									'module',
									function(module) {
										$("#module-whitelist").text(
												module.module);
										$("#module-whitelist").val(module);
										$("#blacklink").attr(
												'href',
												$("#blacklink").attr('href')
														+ "?module="
														+ module.id);

										window.Whitelist = Backbone.Model
												.extend({

													defaults : {
														whitelist : "empty whitelist...",
														inactive : false
													},

													initialize : function() {
														if (!this
																.get("whitelist")) {
															this
																	.set({
																		"whitelist" : this.defaults.whitelist
																	});
														}
													},

													validate : function(model) {
														return common.validate(
																model,
																'whitelist');
													},

													toggle : function() {
														this
																.save({
																	inactive : !this
																			.get("inactive")
																});
													},

													clear : function() {
														this.destroy();
														this.view.remove();
													}

												});

										window.WhitelistList = Backbone.Collection
												.extend({

													module : {
														id : null
													},

													model : Whitelist,

													localStorage : new Store(
															"modules", $(
																	"#module")
																	.val()),

													inactive : function() {
														return this
																.filter(function(
																		whitelist) {
																	return whitelist
																			.get('inactive');
																});
													},

													all : function() {
														return this
																.filter(function(
																		whitelist) {
																	return whitelist
																			.get('whitelist');
																});
													},

													/*
													 * setDefaults : function() {
													 * common.setDefaults( this,
													 * 'whitelists',
													 * chrome.i18n.getMessage("lists_white_plural"),
													 * chrome.i18n.getMessage("lists_white_items") ); },
													 */
													setDefaults : function() {
														defaults = getWhitelistDefaults();
														console.log('this',
																this);
														console.log('defaults',
																defaults);
														for (i in defaults) {
															this
																	.create(defaults[i]);
														}
														;
													},

													remaining : function() {
														return this.without
																.apply(
																		this,
																		this
																				.inactive());
													},

													comparator : function(
															whitelist) {
														var LARGENUM = 1000000;
														return (whitelist
																.get('inactive') ? LARGENUM
																- whitelist
																		.get('hits')
																: 0 - whitelist
																		.get('hits'));
													}

												});

										window.Whitelists = new WhitelistList;

										window.WhitelistView = Backbone.View
												.extend({

													tagName : "li",

													template : _.template($(
															'#item-template')
															.html()),

													events : {
														"click .check" : "toggleInactive",
														"dblclick div.whitelist-content" : "edit",
														"click span.whitelist-destroy" : "clear",
														"click span.whitelist-edit" : "reformed_edit",
														"keypress .whitelist-input" : "updateOnEnter"
													},

													initialize : function() {
														_.bindAll(this,
																'render',
																'close');
														this.model.bind(
																'change',
																this.render);
														this.model.view = this;
														
														if (! $("#reformed").is(':hidden')) {$("#reformed").toggle();}
													},
													
													render : function() {
														$(this.el)
																.html(
																		this
																				.template(this.model
																						.toJSON()));
														this.setContent();
														return this;
													},

													setContent : function() {
														var whitelist = this.model
																.get('whitelist');
														this
																.$(
																		'.whitelist-content')
																.text(whitelist);
														this.input = this
																.$('.whitelist-input');
														this.input.bind('blur',
																this.close);
														this.input
																.val(whitelist);
													},

													toggleInactive : function() {
														this.model.toggle();
													},

													edit : function() {
														$(this.el).addClass(
																"editing");
														this.input.focus();
													},

													close : function() {
														this.model
																.save({
																	whitelist : this.input
																			.val()
																});
														$(this.el).removeClass(
																"editing");
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
														if (! common.reformed_edit ('.whitelist-edit') ) {
															$('#reformed').submit(function(){ return false; }).submit();
															$('#input').val($.rejson('#reformed'));
															this.edit();
														};													
													}
												});

										window.AppView = Backbone.View
												.extend({

													el : $("#whitelistapp"),

													statsTemplate : _
															.template($(
																	'#stats-template')
																	.html()),

													events : {
														"keypress #new-whitelist" : "createOnEnter",
														"keyup #new-whitelist" : "showTooltip",
														"click .whitelist-clear a" : "clearCompleted",
														"click .whitelist-reset .whitelist-reset-button" : "setDefaults"
													},

													initialize : function() {
														_.bindAll(this,
																'addOne',
																'addAll',
																'render');

														this.input = this
																.$("#new-whitelist");

														Whitelists.bind('add',
																this.addOne);
														Whitelists.bind(
																'reset',
																this.addAll);
														Whitelists.bind('all',
																this.render);

														Whitelists.fetch();
													},

													render : function() {
														var inactive = Whitelists
																.inactive().length;
														this
																.$(
																		'#whitelist-stats')
																.html(
																		this
																				.statsTemplate({
																					total : Whitelists.length,
																					inactive : Whitelists
																							.inactive().length,
																					remaining : Whitelists
																							.remaining().length
																				}));
													},

													addOne : function(whitelist) {
														var view = new WhitelistView(
																{
																	model : whitelist
																});
														this
																.$(
																		"#whitelist-list")
																.append(
																		view
																				.render().el);
													},

													addAll : function() {
														Whitelists
																.each(this.addOne);
													},

													newAttributes : function() {
														return {
															whitelist : this.input
																	.val(),
															hits : 0,
															inactive : false
														};
													},

													createOnEnter : function(e) {
														if (e.keyCode != 13)
															return;
														Whitelists
																.create(this
																		.newAttributes());
														this.input.val('');
													},

													clearCompleted : function() {
														_
																.each(
																		Whitelists
																				.inactive(),
																		function(
																				whitelist) {
																			whitelist
																					.clear();
																		});
														return false;
													},

													clearAll : function() {
														_
																.each(
																		Whitelists
																				.all(),
																		function(
																				whitelist) {
																			whitelist
																					.clear();
																		});
														return false;
													},

													/*
													 * setDefaults : function() {
													 * Whitelists.setDefaults(); },
													 */
													setDefaults : function() {
														this.clearAll();
														Whitelists
																.setDefaults();
													},

													showTooltip : function(e) {
														var tooltip = this
																.$(".ui-tooltip-top");
														var val = this.input
																.val();
														tooltip.fadeOut();
														if (this.tooltipTimeout)
															clearTimeout(this.tooltipTimeout);
														if (val == ''
																|| val == this.input
																		.attr('placeholder'))
															return;
														var show = function() {
															tooltip.show()
																	.fadeIn();
														};
														this.tooltipTimeout = _
																.delay(show,
																		1000);
													}

												});

										window.App = new AppView;

									});

				})

		);
