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

Ext.ns('App.container');

App.container.Container = Ext.extend(Ext.extend(Array, Ext.util.Observable.prototype), {
	
	inject: ['bus', 'componentFactory'],
	
	constructor: function(config) {
		var me = this, model;
		
		me.callParent(arguments);

		Ext.apply(me, config || {});

		me.index = {};
		me.elementId = null;
		me.rendered = false;
		me.listeningDD = false;
		
		model = me.model = me.model.getModel(me.field);
		
		me.init();

		model.on('add', me.onAdd, me);
		model.on('set', me.onSet, me);
		model.on('remove', me.onRemove, me);
		model.on('rearrange', me.onRearrange, me);
		model.on('idchanged', me.onIdChanged, me);
		
		me.bus.on('entity.dd.start', me.onDDStart, me);
		me.bus.on('entity.dd.end', me.onDDEnd, me);
	},
	
	init: function() {
		this.add(this.model, 0);
		this.initialized = true;
	},

	onAdd: function(components, position) {
		this.fireEvent('beforeadd', this, components, position);
		this.add(components, position);
		this.fireEvent('afteradd', this, components, position);
	},
	
	onRemove: function(components, position) {
		this.fireEvent('beforeremove', this, components, position);
		this.remove(components, position);
		this.fireEvent('afterremove', this, components, position);
	},

	onRearrange: function(components) {
		this.fireEvent('beforerearange', this, components);
		this.rearrange(components);
		this.fireEvent('afterrearrange', this, components);
	},
	
	onIdChanged: function(list, model, oldId, newId) {
		this.index[newId] = this.index[oldId];
		delete this.index[oldId];
	},
	
	onSet: function(index, newValue, oldValue) {
		oldValue && this.remove([oldValue], index);
		this.add([newValue], index);
	},

	getComponentConfig: function(model, warnIfNotFound) {
		var me = this,
			types = me.types, 
			i = 0, 
			ln = types.length, 
			type,
			config = {
				data: model,
				parent: me.parent,
				container: me
			};
		
		for(; i < ln ; i++) {
			type = types[i];
			if(type.modelType) {
				if(model.type != type.modelType) {
					continue;
				}
			}
			if(type.partial) {
				config.type = type.partial;
				config.partial = true
				config.className = type.className || "App.component.Component";
				return config;
			}
			config.type = type.component;
			return config;
		}
		if(warnIfNotFound !== false) {
			console.error(me.parent.type, 'Unable to find config for model', model);
		}
	},

	add: function(models, position) {
		var me = this,
			i = 0,
			ln = models.length,
			component,
			element,
			type,
			newComponents = [];
	
		for(i = 0; i < ln; i++) {
			component = this.componentFactory.create(me.getComponentConfig(models[i]));
			
			newComponents.push(component);
			me.index[models[i].id] = component;
		}

		me.addChilds(newComponents, position);

		me.splice.apply(me, [position, 0].concat(newComponents));
		
		me.update();

		me.fireEvent('add');
	},
	
	addChilds: function(newComponents, position) {
		var me = this,
			i = 0,
			ln = newComponents.length,
			referenceElement = me.element,
			method = "append";
		
		if( ! me.initialized ) {
			return;
		}
		
		if(me.length > 0 && position < me.length) {
			referenceElement = me[position].getElement();
			method = "before";
		}
		
		element = $('<div />').html(me.render(newComponents));
		element = element.children();
		
		referenceElement[method](element);
		
		for(i = 0; i < ln; i++) {
			newComponents[i].initComponent();
			newComponents[i].load();
		}
	},
	
	render: function(components) {
		components = components || this;
		var me = this, 
			html = [], 
			i = 0, 
			ln = components.length;
		
		for(; i < ln; i++) {
			html.push(components[i].render());
		}
		
		return html.join('');
	},
	
	remove: function(models, position) {
		var i = 0, ln = models.length, component, id;
		
		for(; i < ln; i++) {
			id = models[i].id;
			component = this[position + i];
			component.beforeUnload();
			component.getElement().detach();
			component.unload();
			delete this.index[id];
		}
		this.splice(position, models.length);
		this.update();
		
		this.fireEvent('remove');
	},
	
	rearrange: function(models) {
		var me = this,
			i = 0,
			ln = models.length,
			element = me.element,
			component,
			element;
			
		for(; i < ln; i++) {
			this[i].getElement().detach();
		}
		
		for(i=0; i < ln; i++) {
			component = me.findByModel(models[i]);
			me[i] = component;
			element.append(component.getElement());
		}
		
		me.update();
		
		this.fireEvent('rearrange');
	},
	
	update: function() {
		this.parent.initialized && this.parent.update();
	},
	
	destroy: function() {
		var me = this;
		me.parent = null;
		
		me.bus.un('entity.dd.start', me.onDDStart, me);
		me.bus.un('entity.dd.end', me.onDDEnd, me);
	},
	
	setElementId: function(elementId) {
		this.elementId = elementId;
	},
	
	initComponents: function() {
		var me = this,
			i = 0,
			ln = me.length;
		
		me.element = $('#' + me.elementId);
		
		for(; i < ln; i++) {
			me[i].initComponent();
		}
	},
	
	each: function(fn, scope) {
		scope = scope || window;
		var i = 0, ln = this.length;
		for(; i < ln; i++) {
			if(fn.call(scope, this[i], i) === false) {
				return;
			}
		}
	},
	
	load: function() {
		var me = this,
			components = me,
			i = 0,
			ln = components.length;
		
		for(; i < ln; i++) {
			components[i].load();
		}
	},
	
	findByModel: function(model) {
		return this.index[model.id];
	},
	
	getElement: function() {
		return this.element;
	},
	onDDStart: function(data) {
		if(! this.getComponentConfig(data, false)) {
			this.listeningDD = false;
			return;
		}
		
		this.listeningDD = true;
		
		this.each(function(component, index) {
			var me = this,
				el = component.getElement(),
				eOpts = {
					component: component,
					index: index
				};
			
			el.addClass('entity-prehighlight');
			
			component.bind(el, 'entity.dd.enter', me.onDDEnter, me, eOpts);
			component.bind(el, 'entity.dd.out', me.onDDOut, me, eOpts);
			component.bind(el, 'entity.dd.over', me.onDDOver, me, eOpts);
			component.bind(el, 'entity.dd.drop', me.onDDDrop, me, eOpts);
		}, this);
	},
	
	onDDEnd: function() {
		if(this.listeningDD !== true) {
			return;
		}
		
		this.each(function(component, index) {
			var me = this,
				el = component.getElement();
			
			el.removeClass('entity-prehighlight');
			
			component.unbind(el, 'entity.dd.enter', me.onDDEnter, me);
			component.unbind(el, 'entity.dd.out', me.onDDOut, me);
			component.unbind(el, 'entity.dd.over', me.onDDOver, me);
			component.unbind(el, 'entity.dd.drop', me.onDDDrop, me);
		}, this);
		
	},
	
	onDDEnter: function(e) {
		var component = e.data.eOpts.component;
		component.getElement().addClass('entity-highlight');
	},
	
	onDDOut: function(e) {
		var component = e.data.eOpts.component;
		component.getElement().removeClass('image-highlight');
	},
	
	onDDOver: function(e) {
		e.canDrop = true;
		e.stopImmediatePropagation();
	},
	
	onDDDrop: function(e, model) {
		var component = e.data.eOpts.component,
			index = e.data.eOpts.index;
			
		this.model.set(index, model);
	}

});
