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

App.updater.Image = Ext.extend(App.updater.Attr, {
	inject: ['imageManager', 'bus'],
	
	onInit: function() {
		var me = this;
		
		me.callParent(arguments);
		
		me.bus.on('image.dd.start', me.onDDStart, me);
		me.bus.on('image.dd.end', me.onDDEnd, me);
		
		if(! me.imageManager.getSrc(me.getValue())) {
			me.update(me.getElement(), me.getValue());
		}
		
		me.component.data.on('listenclick', me.onListenClick, me);
	},
	
	onDDStart: function(image) {
		if(! this.canSetImage(image)) {
			return;
		}
		var me = this,
			el = me.getElement();
			
		el.addClass('image-prehighlight');
		
		me.bind(el, 'image.dd.enter', me.onDDEnter, me);
		me.bind(el, 'image.dd.out', me.onDDOut, me);
		me.bind(el, 'image.dd.over', me.onDDOver, me);
		me.bind(el, 'image.dd.drop', me.onDDDrop, me);
	},
	
	onDDEnd: function(e) {
		var el = this.getElement();
		el.removeClass('image-prehighlight');
	},
	
	onDDEnter: function(e) {
		this.getElement().addClass('image-highlight');
	},
	
	onDDOut: function(e) {
		this.getElement().removeClass('image-highlight');
	},
	
	onDDOver: function(e) {
		e.canDrop = true;
		e.stopImmediatePropagation();
	},
	
	canSetImage: function(image) {
		return true;
	},
	
	onDDDrop: function(e, image) {
		this.component.data.set(this.variable, image.id);
	},
	
	onListenClick: function() {
		this.bind(this.getElement(), 'dblclick', this.onDoubleClick, this);
	},
	
	onDoubleClick: function(event, element) {
		this.component.data.fireEvent('image.dblclick.' + this.variable, this, event, element);
	},
		
	update: function(element, value, oldValue) {
		var args = arguments;
		this.imageManager.getImageInfo(value, function(imageInfo) {
			value = App.Template.getImage(this.component, this.attrProperty, value);
			App.updater.Image.superclass.update.apply(this, args);
		}, this);
	},
	destroy: function() {
		var me = this;
		
		me.bus.un('image.dd.start', me.onDDStart, me);
		me.bus.un('image.dd.end', me.onDDEnd, me);
		me.component.data.un('listenclick', me.onListenClick, me);
	
		this.callParent(arguments);
	}

});