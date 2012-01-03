$(document)
		.ready(

				// A Backbone application based on work by [Jérôme Gravel-Niquet](http://jgn.me/).
				$(function() {

					common
							.moduleQueryURL(
									'module',
									function(module) {
										$("#module-blacklist").text(
												module.module);
										$("#module-blacklist").val(module);
										$("#whitelink").attr(
												'href',
												$("#whitelink").attr('href')
														+ "?module="
														+ module.id);

										window.Blacklist = Backbone.Model
												.extend({

													defaults : {
														blacklist : "empty blacklist...",
														inactive : false
													},

													initialize : function() {
														if (!this
																.get("blacklist")) {
															this
																	.set({
																		"blacklist" : this.defaults.blacklist
																	});
														}
													},

													validate : function(model) {
														return common.validate(
																model,
																'blacklist');
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

										window.BlacklistList = Backbone.Collection
												.extend({

													module : {
														id : null
													},

													model : Blacklist,

													localStorage : new Store(
															"modules", $(
																	"#module")
																	.val()),

													inactive : function() {
														return this
																.filter(function(
																		blacklist) {
																	return blacklist
																			.get('inactive');
																});
													},

													all : function() {
														return this
																.filter(function(
																		blacklist) {
																	return blacklist
																			.get('blacklist');
																});
													},

													/*
													 * setDefaults : function() {
													 * common.setDefaults( this,
													 * 'blacklists',
													 * chrome.i18n.getMessage("lists_black_plural"),
													 * chrome.i18n.getMessage("lists_black_items") ); },
													 */
													setDefaults : function() {
														defaults = getBlacklistDefaults();
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
															blacklist) {
														var LARGENUM = 1000000;
														return (blacklist
																.get('inactive') ? LARGENUM
																- blacklist
																		.get('hits')
																: 0 - blacklist
																		.get('hits'));
													}

												});

										window.Blacklists = new BlacklistList;

										window.BlacklistView = Backbone.View
												.extend({

													tagName : "li",

													template : _.template($(
															'#item-template')
															.html()),

													events : {
														"click .check" : "toggleInactive",
														"dblclick div.blacklist-content" : "edit",
														"click span.blacklist-destroy" : "clear",
														"click span.blacklist-edit" : "reformed_edit",
														"keypress .blacklist-input" : "updateOnEnter"
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
														var blacklist = this.model
																.get('blacklist');
														this
																.$(
																		'.blacklist-content')
																.text(blacklist);
														this.input = this
																.$('.blacklist-input');
														this.input.bind('blur',
																this.close);
														this.input
																.val(blacklist);
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
																	blacklist : this.input
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
														if (! common.reformed_edit ('.blacklist-edit') ) {
															$('#reformed').submit(function(){ return false; }).submit();
															$('#input').val($.rejson('#reformed'));
															this.edit();
														};													
													}
												});

										window.AppView = Backbone.View
												.extend({

													el : $("#blacklistapp"),

													statsTemplate : _
															.template($(
																	'#stats-template')
																	.html()),

													events : {
														"keypress #new-blacklist" : "createOnEnter",
														"keyup #new-blacklist" : "showTooltip",
														"click .blacklist-clear a" : "clearCompleted",
														"click .blacklist-reset .blacklist-reset-button" : "setDefaults"
													},

													initialize : function() {
														_.bindAll(this,
																'addOne',
																'addAll',
																'render');

														this.input = this
																.$("#new-blacklist");

														Blacklists.bind('add',
																this.addOne);
														Blacklists.bind(
																'reset',
																this.addAll);
														Blacklists.bind('all',
																this.render);

														Blacklists.fetch();
													},

													render : function() {
														var inactive = Blacklists
																.inactive().length;
														this
																.$(
																		'#blacklist-stats')
																.html(
																		this
																				.statsTemplate({
																					total : Blacklists.length,
																					inactive : Blacklists
																							.inactive().length,
																					remaining : Blacklists
																							.remaining().length
																				}));
													},

													addOne : function(blacklist) {
														var view = new BlacklistView(
																{
																	model : blacklist
																});
														this
																.$(
																		"#blacklist-list")
																.append(
																		view
																				.render().el);
													},

													addAll : function() {
														Blacklists
																.each(this.addOne);
													},

													newAttributes : function() {
														return {
															blacklist : this.input
																	.val(),
															hits : 0,
															inactive : false
														};
													},

													createOnEnter : function(e) {
														if (e.keyCode != 13)
															return;
														Blacklists
																.create(this
																		.newAttributes());
														this.input.val('');
													},

													clearCompleted : function() {
														_
																.each(
																		Blacklists
																				.inactive(),
																		function(
																				blacklist) {
																			blacklist
																					.clear();
																		});
														return false;
													},

													clearAll : function() {
														_
																.each(
																		Blacklists
																				.all(),
																		function(
																				blacklist) {
																			blacklist
																					.clear();
																		});
														return false;
													},

													/*
													 * setDefaults : function() {
													 * Blacklists.setDefaults(); },
													 */
													setDefaults : function() {
														this.clearAll();
														Blacklists
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
