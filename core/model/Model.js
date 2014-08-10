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

Ext.ns('App.model');

App.model.Model = Ext.extend(App.BaseClass, {
	
	inject: ['resourceManager', 'bus'],
	
	constructor: function(config) {
		var me = this, k;
	
		me.callParent(arguments);
		
		me.extend();
		
		me.initialized = false;
		me.values = me.values || {};
		me.models = {};
		me.parent = null;
		
		me.initModels();
		
		me.initialize();
		
		if(me.id === undefined) {
			me.id = me.resourceManager.getUniqueId();
			me.resourceManager.setModel(me.id, me.getData());
		}
	},
	
	extend: function() {
		var me = this,
			type = me.type,
			extend = [App.modelTypes[type]],
			properties = {},
			k,
			i = 0,
			ln;
			
		while(App.modelTypes[type].extend) {
			type = App.modelTypes[type].extend;
			extend.push(App.modelTypes[type]);
		}
		
		extend.reverse();

		for(ln = extend.length; i < ln; i++) {
			for(k in extend[i]) {
				if(Ext.isArray(extend[i][k])) {
					 properties[k] = (properties[k] || []).concat(extend[i][k]);
				} else {
					properties[k] = extend[i][k];
				}
			}
		}
		
		Ext.apply(me, properties);
	},
	
	initModels: function() {
		var me = this,
			fields = me.fields,
			i = 0, 
			ln = fields.length,
			field,
			fieldName,
			value, list;
			
		for(; i < ln; i++) {
			field = fields[i];
			fieldName = field.name;
			if(field.type == "reference") {
				me.models[fieldName] = list = new App.ComponentList();
				list.on('add', me.onAdd, me);
				list.on('remove', me.onRemove, me);
				list.on('set', me.onSet, me);
			} 
		}
	},
	
	initialize: function() {
		var me = this,
			data = me.resourceManager.getModel(me.id) || {},
			fields = me.fields,
			i = 0, 
			ln = fields.length,
			field,
			fieldName,
			value,
			model;
		
		if(me.initialized == true) {
			return;
		}
		for(; i < ln; i++) {
			field = fields[i];
			fieldName = field.name;
			value = me.values[fieldName] || data[fieldName] || field.defaultValue;
			if(fields[i].type == "reference" && value) {
				me.models[fieldName].splice.apply(me.models[fieldName], [0,0].concat(value))
			} else {
				me.values[fieldName] = value;
			}
		}
		
		me.initialized = true;
		me.fireEvent('initialize', me);	
	},
	getData: function() {
		var me = this,
			data = {},
			fields = me.fields,
			i = 0, ln = fields.length,
			fieldName, field;
		
		for(; i < ln; i++) {
			field = fields[i];
			fieldName = field.name;
			if(fields[i].type == "reference") {
				data[fieldName] = me.models[fieldName].getData();
			} else {
				data[fieldName] = me.get(fieldName);
			}
		}
		return data;
	},
	
	onAdd: function(elements, position) {
		var i = 0, 
			ln = elements.length;
		
		for(; i < ln; i++) {
			elements[i].setParent(this);
		}
	},
	
	onRemove: function(elements) {
		var i = 0, 
			ln = elements.length;
			
		for(; i < ln; i++) {
			elements[i].destroy();
		}
	},
	
	onSet: function(index, newValue, oldValue) {
		oldValue && this.onRemove([oldValue]);
		this.onAdd([newValue]);
	},
		
	set: function(variable, value) {
		var me = this,
			oldValue = me.get(variable);
		
		if(me.fireEvent('beforeset.' + variable, value, oldValue) === false) {
			return;
		}
		
		me.values[variable] = value;
		
		me.fireEvent('set', variable, value, oldValue);
		me.fireEvent('set.' + variable, value, oldValue);
		
		return value;
	},
	
	get: function(variable) {
		return this.values[variable];
	},
	
	getModel: function(variable) {
		return this.models[variable];
	},
	
	setParent: function(parent) {
		this.parent = parent;
	},
	
	destroy: function() {
		this.setParent(null);
		this.eachModel(function(list) {
			list.destroy();
		});
		
		this.fireEvent('destroy', this);
	},

	findParent: function(type) {
		if(this.type == type) {
			return this;
		}
		if(this.parent) {
			return this.parent.findParent(type);
		}
		return null;
	},
	
	eachModel: function(fn, scope) {
		scope = scope || window;
		var k;
		
		for(k in this.models) {
			if(fn.call(scope, this.models[k], k) === false) {
				return false;
			};
		}
	},
	
	setId: function(newId) {
		this.id = newId;
		this.fireEvent('idchanged', this.id, newId);
	},
	loadSection: function(section) {
		if(section.length == 0) {
			return;
		}
		var me = this,
			currentSection = me.getModel('nextSection')[0],
			thisSection = section.shift();
		
		if(! currentSection || thisSection.type != currentSection.type || thisSection.id != currentSection.id) {
			me.bus.fireEvent('section.beforechange', me, thisSection);
			me.getModel('nextSection').set(0, thisSection);
			me.bus.fireEvent('section.change', me, thisSection);
		}
		return me.getModel('nextSection')[0].loadSection(section);
	}
	
});
