$(document)
		.ready(
				// A Backbone application based on work by [Jérôme
				// Gravel-Niquet](http://jgn.me/).
				$(function() {
					common
							.moduleQueryURL(
									'id',
									function(module) {
										$("#nsModule").val(module.module);

										window.Generic = Backbone.Model
												.extend({
													defaults : {
														content : "empty configurable item ...",
														inactive : false
													},

													initialize : function() {
														if (!this
																.get("content")) {
															this
																	.set({
																		"content" : this.defaults.content
																	});
														}
													},

													validate : function(model) {
														if (!model.inactive) {
															return common
																	.validate(model)
														}
														;
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

										window.GenericList = Backbone.Collection
												.extend({

													model : Generic,

													localStorage : new Store($(
															"#nsModule").val()),

													inactive : function() {
														return this
																.filter(function(
																		generic) {
																	return generic
																			.get('inactive');
																});
													},

													all : function() {
														return this
																.filter(function(
																		module) {
																	return module
																			.get('content');
																});
													},

													setDefaults : function() {
														common
																.setDefaults(
																		this,
																		$(
																				"#nsModule")
																				.val(),
																		'configurable',
																		common.configurable.admin.boilerplate.admin_ok_to_reset2);

													},

													remaining : function() {
														return this.without
																.apply(
																		this,
																		this
																				.inactive());
													},

													comparator : function(
															generic) {
														var LARGENUM = 1000000;
														return (generic
																.get('inactive') ? LARGENUM
																- generic
																		.get('hits')
																: 0 - generic
																		.get('hits'));
													}

												});

										window.generic = new GenericList;

										window.GenericView = Backbone.View
												.extend({

													tagName : "li",

													template : _.template($(
															'#item-template')
															.html()),

													events : {
														"click .check" : "toggleInactive",
														"dblclick div.input" : "edit",
														"click span.generic-destroy" : "clear",
														"click span.generic-edit" : "reformed_edit",
														"keypress .generic-input" : "updateOnEnter"
													},

													initialize : function() {
														_.bindAll(this,
																'render',
																'close');
														this.model.bind(
																'change',
																this.render);
														this.model.view = this;
														
														$("#reformed").toggle();
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
														var content = this.model
																.get('content');
														this.$('.input').text(
																content);
														this.input = this
																.$('.generic-input');
														this.input.bind('blur',
																this.close);
														this.input.val(content);
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
																	content : this.input
																			.val()
																});
														$(this.el).removeClass(
																"editing");
													},

													updateOnEnter : function(e) {
														if (e.keyCode == 13)
															this.close();
													},

													remove : function() {
														$(this.el).remove();
													},

													clear : function() {
														this.model.clear();
													},

													reformed_edit : function() {														
														if (! common.reformed_edit ('.generic-edit') ) {
															$('#reformed').submit(function(){ return false; }).submit();
															$('#input').val($.rejson('#reformed'));
															this.edit();
														};													
													}
												});

										window.AppView = Backbone.View
												.extend({

													el : $("#genericapp"),

													statsTemplate : _
															.template($(
																	'#stats-template')
																	.html()),

													events : {
														"keypress #new-generic" : "createOnEnter",
														"keyup #new-generic" : "showTooltip",
														"click .generic-clear a" : "clearCompleted",
														"click .generic-reset .generic-reset-button" : "setDefaults"
													},

													initialize : function() {
														_.bindAll(this,
																'addOne',
																'addAll',
																'render');

														this.input = this
																.$("#new-generic");

														generic.bind('add',
																this.addOne);
														generic.bind('reset',
																this.addAll);
														generic.bind('all',
																this.render);

														common.configureTexts
																.initialize();

														generic.fetch();

														/*
														 * common.getAdaptor(nsModule, {
														 * success : function
														 * (){ } })
														 */},

													render : function() {
														var inactive = generic
																.inactive().length;
														this
																.$(
																		'#generic-stats')
																.html(
																		this
																				.statsTemplate({
																					total : generic.length,
																					inactive : generic
																							.inactive().length,
																					remaining : generic
																							.remaining().length
																				}));
													},

													addOne : function(generic) {
														var view = new GenericView(
																{
																	model : generic
																});
														this
																.$(
																		"#generic-list")
																.append(
																		view
																				.render().el);
													},

													addAll : function() {
														generic
																.each(this.addOne);
													},

													newAttributes : function() {
														return {
															content : this.input
																	.val(),
															hits : 0,
															inactive : false
														};
													},

													createOnEnter : function(e) {
														if (e.keyCode != 13)
															return;
														generic
																.create(this
																		.newAttributes());
														this.input.val('');
													},

													clearCompleted : function() {
														_
																.each(
																		generic
																				.inactive(),
																		function(
																				generic) {
																			generic
																					.clear();
																		});
														return false;
													},

													clearAll : function() {
														_
																.each(
																		generic
																				.all(),
																		function(
																				generic) {
																			generic
																					.clear();
																		});
														return false;
													},

													setDefaults : function() {
														generic.setDefaults();
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
										$("#generic .generic-reset").submit(
												function() {
													generic.setDefaults();
													return false;
												});
									});
				}));
