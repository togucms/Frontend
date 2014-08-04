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

App.SiteController = Ext.extend(App.BaseClass, {
	inject: ['resourceManager', 'componentFactory', 'modelFactory'],
	
	constructor: function(config) {
		var me = this;
		me.callParent(arguments);
		
		me.rootElement = $('<div />').attr('id', 'rootcontroller').appendTo($('#container'));
		
		this.initSite();
	},
	
	initSite: function() {
		var me = this,
			rootModel = me.rootModel = this.modelFactory.create({ type: "rootModel" }),
			rootComponent = this.componentFactory.create({
				data: rootModel,
				type: "rootComponent"
			});
		
		App.Injector.resolve('bus').fireEvent('sitecontroller.rootmodel', me, rootModel);
		
		me.rootElement.html(rootComponent.render());
		
		rootComponent.initComponent();
		rootComponent.load();
	},
	loadPage: function(page) {
		var me = this,
			section = this.resourceManager.getModel(page.section),
			sections = [page.section];
		
		me.page = page;

		while(section = section.sectionConfig ? this.resourceManager.getModel(section.sectionConfig.parentSection): null) {
			sections.unshift(section.id);
		}
		sections.shift();
		
		me.rootModel.set('page', page);
		me.rootModel.loadSection(sections);
	}
});

