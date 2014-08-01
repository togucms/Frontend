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

App.Factory = Ext.extend(Ext.util.Observable, {
	constructor: function() {
		this.instanceIdx = 0;
	},
	getClassName: function (type) {
		var splitted = type.split('.'),
			i = 0,
			ln = splitted.length,
			selected = window;
		
		for(; i < ln; i++) {
			selected = selected[splitted[i]];
		}
		return selected;
	},
	instantiateClass: function(name, config) {
		var className = this.getClassName(name),
			instance = new className(config);
			
		instance.instanceIdx = this.instanceIdx++;
		
		return instance;
	}
});

