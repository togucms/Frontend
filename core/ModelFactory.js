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

App.ModelFactory = Ext.extend(App.Factory, {
	inject: ['resourceManager'],
	
	create: function(model) {
		var className, values = {}, config = {};
		if(Ext.isObject(model)) {
			values = Ext.apply(values, model);
		} else {
			Ext.apply(values, this.resourceManager.getModel(model));
		}
		config.id = values.id;
		config.type = values.type;
		
		config.values = values;
		
		className = App.modelTypes[config.type].className;
		
		return this.instantiateClass(className, config);
	}
});
