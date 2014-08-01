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

Ext.applyIf(Ext, {
	findKey : function(object, key) {
		if(object === undefined || key === undefined) {
			return undefined;
		}
		var root = object,
			splitted = key.split('.');
		for(var k = 0; k < splitted.length; k++) {
			if(root[splitted[k]] === undefined) {
				return undefined;
			}
			root = root[splitted[k]];
		}
		return root;
	},
	createKey : function(object, key, value) {
		var root = object,
			splitted = key.split('.');
		
		for(var k = 0; k < splitted.length - 1; k++) {
			root[splitted[k]] = root[splitted[k]] || {};
			root = root[splitted[k]];
		}
		root[splitted[k]] = value;
	},
	countProperties : function(obj) {
	    var count = 0;

	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop)) {
	        	++count;
	        }
	    }

	    return count;
	},
	indexOf : 'indexOf' in Array.prototype ? 
		function(array, object, from) {
			return array.indexOf(object, from);
		} : 
		function(array, object, from) {
			var i, ln = array.length;
			
			from = from || 0;
			if(from < 0) {
				from = Math.max(0, from + ln);
			}
			
			for(i = from; i < ln; i++) {
				if(array[i] === object) {
					return i;
				}
			}
			return -1;
		}
});
