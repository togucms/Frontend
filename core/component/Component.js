/*!
Copyright (c) 2012-2014 Alessandro Siragusa <alessandro@togu.io>

This file is part of the Togu CMS.

Togu is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Togu is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Togu.  If not, see <http://www.gnu.org/licenses/>.
*/

Ext.ns('App.component');

App.component.Component = Ext.extend(App.BaseClass, {
	listen: {},
	
	inject: ['bus', 'updaterFactory'],
 
	renderContentsOnLoad: true,
	
	constructor: function(config) {
		var me = this;

		me.callParent(arguments);

		Ext.apply(me, App.componentTypes[me.type]);
		
		me.initialId = me.id;
		me.containerConfig = me.containerConfig || [];
		
		me.selectorIds = {};
		me.bindings = {};
		me.updaters = {};
		me.elements = {};
		
		me.$ = {};
		
		if(me.partial === true) {
			me.template = me.parent.template + '_' + me.type;
		}

		me.createContainers();

		me.data.on('update', me.update, me);
		
		me.data.on('edit', me.onEdit, me);
		me.data.on('endedit', me.onEndEdit, me);
		
		me.data.on('highlight', me.onHighLight, me);
		me.data.on('lowlight', me.onLowLight, me);
		
		me.data.on('listenmouseover', me.onListenMouseover, me);
		me.data.on('stoplistenmouseover', me.onStopListenMouseover, me);		
		
		me.data.on('listenclick', me.onListenClick, me);
	},
	
	addSelector: function(variable, nodeId) {
		this.selectorIds[variable] = nodeId;
	},
	
	addBinding: function(event, method, nodeId) {
		(this.bindings[nodeId] = this.bindings[nodeId] || []).push([event, method]);
	},
	
	bindUpdater: function(variable, nodeInfo) {
		nodeInfo.component = this;
		nodeInfo.variable = variable;
		(this.updaters[variable] = this.updaters[variable] || []).push(this.updaterFactory.create(nodeInfo));
	},

	onEdit: function() {
		this.fireEvent('edit');
	},
	
	onEndEdit: function() {
		this.fireEvent('endedit');
	},

	createContainers: function() {
		var me = this,
			container,
			i = 0,
			ln = me.containerConfig.length,
			config;
		
		me.containers = {};
		
		for(; i < ln; i++) {
			container = me.containerConfig[i];
			
			config = Ext.apply({ 
				model: me.data,
				parent: me
			}, container);
			
			me.containers[container.name] = new App.container.Container(config);
		}
	},

	renderContents: function() {
		return App.Template.renderContents(this.template, this);
	},
	
	render: function() {
		var me = this;
		if(me.rendered === true) {
			console.error('rendering a component twice!');
			return "ERROR";
		}
		
		me.rendered = true;
		
		return App.Template.render(me.template, me, me.renderContentsOnLoad);
	},
	
	renderContainer: function(type, holderId) {
		this.containers[type].setElementId(holderId);
		return this.containers[type].render();
	},
	
	initComponent: function() {
		var me = this,
			k;

		me.initialized = true;
		
		me.initSelectors();

		me.eachContainer(function(container){
			container.initComponents()
		}, me);
		
		this.fireEvent('init');
		return me;
	},
	
	initSelectors: function() {
		var me = this,
			selectorConfig = me.selectorIds,
			selectors = me.$,
			selector; 

		for(selector in selectorConfig) {
			selectors[selector] = me.getNode(selectorConfig[selector]);
		}
		me.element = me.$.element;
		
		me.selectorsInitialized = true;
	},

	fireBubbled: function(event) {
		return function() {
			this.fireEvent.apply(this, [event, this].concat(Array.prototype.slice.call(arguments)));
		}
	},
	
	getNode: function(nodeId) {
		if(! this.elements[nodeId]) {
			this.elements[nodeId] = $('#' + nodeId);
		}
		
		return this.elements[nodeId];
	},
		
	initEvents: function() {
		var me = this,
			handlerConfig = me.handlerConfig,
			listener,
			nodeId,
			node,
			i, ln,
			events;

		if(me.selectorsInitialized !== true) {
			return;
		}
		
		for(nodeId in me.bindings) {
			node = me.getNode(nodeId);
			events = me.bindings[nodeId];
			for(i = 0, ln = events.length; i < ln; i++) {
				me.enableBubble(events[i][1]);
				me.bind(node, events[i][0], this.fireBubbled(events[i][1]));
			}
		}
		
		for(listener in me.listen) {
			if(! me[me.listen[listener].fn]) {
				console.error('Unable to find listener', me.listen[listener].fn, 'for event', listener, 'in class', me.className);
			}
			me.on(listener, me[me.listen[listener].fn], me);
		}
	
		me.eventsInitialized = true;
		return me;
	},
	
	getBubbleTarget: function(event) {
		var parent = this.parent;
		while(parent) {
			if(parent.listen && parent.listen[event.name]) {
				return parent;
			}
			parent = parent.parent;
		}
	},
	
	getElement: function() {
		return this.element;
	},
	
	load: function() {
		var me = this;
		
		me.initEvents();

		for(k in me.containers) {
			me.containers[k].load();
		}

		return me;
	},
	eachContainer: function(fn, scope) {
		var k;
		scope = scope || window;
		for(k in this.containers) {
			fn.call(scope, this.containers[k], k);
		}
	},
	
	eachComponent: function(fn, scope) {
		var k;
		scope = scope || window;
		
		for(k in this.containers) {
			this.containers[k].each(fn, scope);
		}
	},
	
	beforeUnload: function() {
		var me = this, k;

		me.fireEvent('beforeunload', me);
		me.unbindAll();

		me.eachComponent(function(component) {
			component.beforeUnload();
		});
		
		return me;
	},
	
	unload: function() {
		var me = this, k;

		me.eachComponent(function(component) {
			component.unload();
		});
		
		me.destroy();
		me.eachContainer(function(container) {
			container.destroy();
		});
		
		me.element.remove();
		
		me.fireEvent('unload', me);
		
		me.updaters = null;
		me.data = null;
		
		me.setParent(undefined);
		
		return me;
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},
	
	update: function() {
		var me = this;
			
		me.eachComponent(function(component) {
			component.update();
		});
	},
	
	onHighLight: function() {
		this.$.element.addClass('component-highlight');
	},
	
	onLowLight: function() {
		this.$.element.removeClass('component-highlight');
	},
	
	onElementMouseEnter: function() {
		this.data.fireEvent('mouseenter', this);
	},
	
	onElementMouseLeave: function() {
		this.data.fireEvent('mouseleave', this);
	},
	
	onListenMouseover: function() {
		this.bind(this.element, 'mouseenter', this.onElementMouseEnter);
		this.bind(this.element, 'mouseleave', this.onElementMouseLeave);		
	},
	
	onStopListenMouseover: function() {
		this.unbind(this.element, 'mouseenter', this.onElementMouseEnter);
		this.unbind(this.element, 'mouseleave', this.onElementMouseLeave);		
	},
	
	onElementShiftClick: function(event, element) {
		this.data.fireEvent('component.click', this, event, element);
	},
	
	onElementClick: function(event, element) {
		this.onElementShiftClick(event, element);
	},
	
	onListenClick: function() {
		this.bind(this.element, 'shift.click', this.onElementShiftClick, this);
		this.bind(this.element, 'click', this.onElementClick, this);
	}
});

