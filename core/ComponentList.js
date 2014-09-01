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

App.ComponentList = Ext.extend(Ext.extend(Array, Ext.util.Observable.prototype), {
	
	inject: ['resourceManager', 'modelFactory'],
	
	constructor: function() {
		this.callParent(arguments);
		this.on('add', this.onAdd, this);
		this.on('remove', this.onRemove, this);
	},
	
	checkArgs: function(element) {
		if(element instanceof App.model.Model) {
			return element;
		}
		return this.modelFactory.create(element);
	},
	
	loadModels: function(models, callback, scope, args) {
		this.resourceManager.loadModels(models, function() {
			callback.apply(scope, args);
		}, this);
	},
	
	onAdd: function(elements, position) {
		var i = 0, ln = elements.length;
		for(; i < ln; i++) {
			elements[i].on('idchanged', this.onIdChanged, this);
		}
	},
	
	onRemove: function(elements, position) {
		var i = 0, ln = elements.length;
		for(; i < ln; i++) {
			elements[i].un('idchanged', this.onIdChanged, this);
		}
	},
	
	onIdChanged: function(model, oldId, newId) {
		this.fireEvent('idchanged', this, model, oldId, newId);
		this.fireEvent('changed', this);
	},
	
	pop: function() {
		if(this.length > 0) {
			this.fireEvent('remove', [this[this.length - 1]], this.length - 1);
		}
		Array.prototype.pop.apply(this, arguments);
		this.fireEvent('changed', this);
	},
	
	_push: function() {
		var i = 0, ln = arguments.length, added = [];
		if(ln > 0) {
			for(; i < ln; i++) {
				added.push(this.checkArgs(arguments[i]));
			}
			this.fireEvent('add', added, this.length);
		}
		Array.prototype.push.apply(this, added);
		this.fireEvent('changed', this);
	},
	
	push: function() {
		this.loadModels(arguments, this._push, this, arguments);
	},
	
	shift: function() {
		if(this.length > 0) {
			this.fireEvent('remove', [this[0]], 0);
		}
		Array.prototype.shift.apply(this, arguments);
		this.fireEvent('changed', this);
	},
	
	_splice: function(start, length) {
		var i = 2, ln = arguments.length, added = [];
		if(length > 0) {
			this.fireEvent('remove', this.slice(start, start + length), start);
		}
		if(ln > 2) {
			for(; i < ln; i++) {
				added.push(this.checkArgs(arguments[i]));
			}
			this.fireEvent('add', added, start);	
		}
		
		Array.prototype.splice.apply(this, [start, length].concat(added));
		this.fireEvent('changed', this);
	},
	
	splice: function(start, length) {
		this.loadModels(Array.prototype.slice.call(arguments, 2), this._splice, this, arguments);
	},
	
	_unshift: function() {
		var i = 0, ln = arguments.length, added = [];
		if(ln > 0) {
			for(; i < ln; i++) {
				added.push(this.checkArgs(arguments[i]));
			}
			this.fireEvent('add', added, 0);	
		}
		Array.prototype.unshift.apply(this, added);
		this.fireEvent('changed', this);
	},
	
	unshift: function() {
		this.loadModels(arguments, this._unshift, this, arguments);
	},
	
	reverse: function() {
		var retValue = Array.prototype.reverse.apply(this, arguments);
		if(this.length > 0) {
			this.fireEvent('rearrange', this);
		}
		return retValue;
	},
	
	sort: function() {
		var retValue = Array.prototype.sort.apply(this, arguments);
		if(this.length > 0) {
			this.fireEvent('rearrange', this);
		}
		return retValue;
	},
	
	remove: function(model) {
		var i = 0, ln = this.length;
		
		for(; i < ln; i++) {
			if(model.id == this[i].id) {
				this.splice(i, 1);
				return true;
			}
		}
		return false;
	},

	_set: function(index, value) {
		value = this.checkArgs(value);
		this.fireEvent('set', index, value, this[index]);
		if(index >= this.length) {
			this.length = index + 1;
		}
		this[index] = value;
		this.fireEvent('changed', this);
	},
	
	set: function(index, value) {
		this.loadModels([value], this._set, this, arguments);
	},
	
	destroy: function() {
		this.each(function(model) {
			model.destroy();
		});
		this.fireEvent('destroy', this);
	},

	each: function(callback, scope) {
		scope = scope || window;
		var i = 0, ln = this.length;
		
		for(; i < ln; i++) {
			if(callback.call(scope, this[i], i) === false) {
				return false;
			}
		}
		return true;
	},
	
	getData: function() {
		var data = [];
		this.each(function(object, index) {
			data.push(object.id);
		}, this);
		return data;
	},
	
	findByFn: function(callback, scope) {
		scope = scope || window;
		var i = 0, ln = this.length;
		
		for(; i < ln; i++) {
			if(callback.call(scope, this[i], i) === true) {
				return this[i];
			}
		}
		return null;
	}
});
