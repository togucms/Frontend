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

App.AlohaManager = Ext.extend(Ext.util.Observable, {
	constructor: function() {
		this.callParent(arguments);
		window.Aloha && Aloha.ready($.proxy(this.onReady, this));
	},
	onReady: function() {
		Aloha.bind('aloha-smart-content-changed', $.proxy(this.onContentChanged, this));
		Aloha.bind('aloha-editable-activated', $.proxy(this.onEditableActivated, this));
		Aloha.bind('aloha-editable-deactivated', $.proxy(this.onEditableDeactivated, this));
	},
	
	activate: function(elementId, onChanged, onActivated, onDeactivated, scope) {
		Aloha.jQuery('#' + elementId).aloha();
		this.on('changed-' + elementId, onChanged, scope);
		this.on('activated-' + elementId, onActivated, scope);
		this.on('deactivated-' + elementId, onDeactivated, scope);
	},
	deactivate: function(elementId, onChanged, onActivated, onDeactivated, scope) {
		Aloha.jQuery('#' + elementId).mahalo();
		this.un('changed-' + elementId, onChanged, scope);
		this.un('activated-' + elementId, onActivated, scope);
		this.un('deactivated-' + elementId, onDeactivated, scope);
	},
	
	onEditableActivated: function(event, args) {
		this.fireEvent('activated-' + args.editable.originalObj.attr('id'), event, args);
	},
	onEditableDeactivated: function(event, args) {
		this.fireEvent('deactivated-' + args.editable.originalObj.attr('id'), event, args);
	},
	onContentChanged: function(event, args) {
		this.fireEvent('changed-' + args.editable.originalObj.attr('id'), event, args);
	}
});


