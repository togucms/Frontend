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

App.updater.Html = Ext.extend(App.updater.Abstract, {
	inject: ['alohaManager'],
	
	onEdit: function() {
		if(this.editorActive) {
			return;
		}
		var elId =  this.getElement().attr('id');
		this.alohaManager.activate(elId, this.onChange, this.onActivated, this.onDeactivated, this);
		this.editorActive = true;
		
		this.callParent(arguments);
	},
	
	onEndEdit: function() {
		if(! this.editorActive) {
			return;
		}

		var elId =  this.getElement().attr('id');
		this.alohaManager.deactivate(elId, this.onChange, this.onActivated, this.onDeactivated, this);
		this.editorActive = false;
		
		this.callParent(arguments);
	},
	
	onChange: function(evt, args) {
		this.component.data.set(this.variable, this.getElement().html());
	},
	
	onActivated: function() {
		this.editing = true;
	},
	
	onDeactivated: function() {
		this.editing = false;
	},
	
	update: function(element, value, oldValue) {
		if(this.editing) {
			return;
		}
		if(element.html() != value) {
			element.html(value);
		} 
	},
	onBeforeUnload: function() {
		this.onEndEdit();
		this.callParent(arguments);
	}
});