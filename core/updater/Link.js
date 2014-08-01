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

App.updater.Link = Ext.extend(App.updater.Attr, {
	inject: ['resourceManager', 'bus'],
	
	onInit: function() {
		this.attrProperty == "href" && this.getElement().on('click', $.proxy(this.onClick, this));
		
		this.bus.on('link.dd.start', this.onDDStart, this);
		this.bus.on('link.dd.end', this.onDDEnd, this);
	},
	
	onClick:function() {
		History.add(this.getElement().attr('href'));
	},

	onDDStart: function(linkId) {
		if(! this.canSetLink(linkId)) {
			return;
		}
		var me = this,
			el = me.getElement();
			
		el.addClass('link-prehighlight');
		
		me.bind(el, 'link.dd.enter', me.onDDEnter, me);
		me.bind(el, 'link.dd.out', me.onDDOut, me);
		me.bind(el, 'link.dd.over', me.onDDOver, me);
		me.bind(el, 'link.dd.drop', me.onDDDrop, me);
	},
	
	onDDEnd: function(e) {
		var el = this.getElement();
		el.removeClass('link-prehighlight');
	},
	
	onDDEnter: function(e) {
		this.getElement().addClass('link-highlight');
	},
	
	onDDOut: function(e) {
		this.getElement().removeClass('link-highlight');
	},
	
	onDDOver: function(e) {
		e.canDrop = true;
		e.stopImmediatePropagation();
	},
	
	canSetLink: function(linkId) {
		return true;
	},
	
	onDDDrop: function(e, linkId) {
		this.component.data.set(this.variable, linkId);
	},
	
	update: function(element, value, oldValue) {
		var args = arguments;
		this.resourceManager.fetchLink(value, function(linkInfo) {
			value = App.Template.getLink(this.component, this.attrProperty, value);
			App.updater.Link.superclass.update.apply(this, args)
		}, this);
	},
	
	destroy: function() {
		this.bus.un('link.dd.start', this.onDDStart, this);
		this.bus.un('link.dd.end', this.onDDEnd, this);
		this.callParent(arguments);
	}
});