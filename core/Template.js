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

Ext.ns('App.Template');

App.Template = {
	ids : 0,
	imageManager: null,
	resourceManager: null,
	debug : false,
	getId : function() {
		return 'cmf-' + (this.ids++);
	},
	variable : function(component, variable) {
		return component.data.get(variable);
	},
	getLink : function(component, attrProperty, linkId) {
		if(attrProperty == "href") {
			attrProperty = "url";
		}
		var linkInfo = this.resourceManager.getLink(linkId);
		if(! linkInfo) {
			console.error('no link found', component, linkId);
			return '/404';
		}
		return linkInfo[attrProperty];
	},
	
	getImage : function(component, attrProperty, imageId) {
		var image = this.imageManager.getSrc(imageId);
		if(! image) {
			console.error('no image found', component, imageId);
			return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		}
		return image;
	},
	
	cls : function(component, variable, filter, nodeId) {
		component.bindUpdater(variable, {
			method: 'cls',
			filter: filter,
			nodeId: nodeId
		});
		return this.variable(component,variable);
	},
	
	style: function(component, cssProperty, prefix, variable, filter, suffix, nodeId) {
		component.bindUpdater(variable, {
			method: 'style',
			nodeId: nodeId,
			prefix: prefix,
			suffix: suffix,
			filter: filter,
			cssProperty: cssProperty
		});
		return this.variable(component, variable);
	},
	attr: function(component, attrProperty, prefix, variable, filter, suffix, nodeId) {
		component.bindUpdater(variable, {
			method: 'attr',
			nodeId: nodeId,
			attrProperty: attrProperty,
			filter: filter,
			prefix: prefix,
			suffix: suffix
		});
		return prefix + this.variable(component, variable) + suffix;
	},
	input:  function(component, attrProperty, prefix, variable, filter, suffix, nodeId) {
		component.bindUpdater(variable, {
			method: 'input',
			nodeId: nodeId,
			prefix: prefix,
			suffix: suffix,
			filter: filter,
			attrProperty: attrProperty
		});
		return prefix + this.variable(component, variable) + suffix;
	},
	html: function(component, variable, filter, nodeId) {
		component.bindUpdater(variable, {
			method: 'html',
			filter: filter,
			nodeId: nodeId
		});
		return this.variable(component, variable);
	},
	image : function(component, attrProperty, prefix, variable, filter, suffix, nodeId) {
		if(filter == "external") {
			return this.attr.apply(this, arguments);
		}
		component.bindUpdater(variable, {
			method: 'image',
			nodeId: nodeId,
			attrProperty: attrProperty,
			filter: filter,
			prefix: prefix,
			suffix: suffix
		});
		return prefix + this.getImage(component, attrProperty, this.variable(component, variable)) + suffix;
	},
	link : function(component, attrProperty, prefix, variable, filter, suffix, nodeId) {
		if(filter == "external") {
			return this.attr.apply(this, arguments);
		}
		
		component.bindUpdater(variable, {
			method: 'link',
			nodeId: nodeId,
			attrProperty: attrProperty,
			filter: filter,
			prefix: prefix,
			suffix: suffix
		});
		return prefix + this.getLink(component, attrProperty, this.variable(component, variable)) + suffix;
	},
	_var : function(component, variable, nodeId) {
		component.addSelector(variable, nodeId);
		if(this.debug) {
			return 'data-cmf-var="' + variable + '"';
		}
	},
	dbg: function(component, template) {
		if(this.debug) {
			return 'data-cmf-component="' + component.type + '" ' +
					'data-cmf-template="' + template + '" ';
		}
	},
	
	bind: function(component, event, method, nodeId) {
		component.addBinding(event, method, nodeId);
		if(this.debug) {
			return 'data-cmf-bind-' + event + '="' + method + '"';
		}
	},
	
	container: function(component, variable, nodeId) {
		return component.renderContainer(variable, nodeId);
	},

	nextSection: function(component, nodeId) {
		return component.renderContainer('nextSection', nodeId);
	},

	renderContents: function(tpl, component) {
		if(! this.compiled[tpl]) {
			console.error('Template not defined!', tpl);
			return;
		}
		var out = [];
		this.compiled[tpl].call(this, component, out);
		return out.join('');
	},
	
	render: function(tpl, component, renderContents) {
		if(! this.imageManager) {
			this.imageManager = App.Injector.resolve('imageManager');
		}
		if(! this.resourceManager) {
			this.resourceManager = App.Injector.resolve('resourceManager');
		}
		
		return this.renderContents(tpl, component);
	}
};

