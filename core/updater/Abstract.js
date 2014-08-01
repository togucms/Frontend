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

Ext.ns('App.updater');

App.updater.Abstract = Ext.extend(App.BaseClass, {
	constructor: function(config) {
		var me = this, component, data;
			
		me.callParent(arguments);
		
		component = me.component;
		data = component.data;
		
		component.on('init', me.onInit, me);
		component.on('beforeunload', me.onBeforeUnload, me);
		component.on('unload', me.destroy, me);
		
		component.on('edit', me.onEdit, me);
		component.on('endedit', me.onEndEdit, me);
		
		data.on('set.' + me.variable, me.onSet, me);
	},
	
	onEdit: function() {
		var me = this,
			element = me.getElement();
			
		me.bind(element, 'mouseenter', me.fireMouseEnter);
		me.bind(element, 'mouseleave', me.fireMouseLeave);		
		me.component.data.on('highlight.' + me.variable, me.onHighlight, me);
		me.component.data.on('lowlight.' + me.variable, me.onLowlight, me);
	},
	
	onEndEdit: function() {
		var me = this,
			element = me.getElement();
		me.unbind(element, 'mouseenter', me.fireMouseEnter);
		me.unbind(element, 'mouseleave', me.fireMouseLeave);		
		me.component.data.un('highlight.' + me.variable, me.onHighlight, me);
		me.component.data.un('lowlight.' + me.variable, me.onLowlight, me);
	},
	
	fireMouseEnter: function() {
		this.component.data.fireEvent('field.mouseenter', this.variable);
	},
	
	fireMouseLeave: function() {
		this.component.data.fireEvent('field.mouseleave', this.variable);
	},
	
	getElement: function() {
		return this.component.getNode(this.nodeId);
	},

	onSet: function(value, oldValue) {
		this.update(this.getElement(), value, oldValue);
	},
	
	onInit: function() {
		
	},
	
	update: function(element, value, oldValue) {
		// Needs to be extended
	},
	
	getValue: function() {
		return this.component.data.get(this.variable);
	},
	
	onHighlight: function() {
		this.getElement().addClass('variable-highlighted');
	},
	
	onLowlight: function() {
		this.getElement().removeClass('variable-highlighted');
	},
	
	onBeforeUnload: function() {
		
	},
	
	destroy: function() {
		var me = this,
			component = me.component,
			data = component.data;
		
		component.un('init', me.onInit, me);
		component.un('unload', me.destroy, me);
		
		component.un('edit', me.onEdit, me);
		component.un('endedit', me.onEndEdit, me);
		
		data.un('set.' + me.variable, me.onSet, me);
		
		me.callParent(arguments);
		
		me.component = null;
	}
});