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

Ext.ns('App');

Ext.override(Ext.util.Observable, {
	callParent: function(args) {
		var method = this.callParent.caller,
			name = (method.$methodName || method.$previous.$methodName),
			Class = (method.$class || method.$previous.$class),
			superclass = Class.superclass ;
			
		if(! superclass[name]) {
			console.error('Method ', name, 'has no parent');
		}
		return superclass[name].apply(this, args || this._noArgs); 
	}
});

App.BaseClass = Ext.extend(Ext.util.Observable, {
    /**
     * @param {Object} [config]
     */	
    constructor: function(config) {
    	this.callParent(arguments);

        this.initialConfig = config;
        Ext.apply(this, config || {});
        
		this.handlers = {};
		this.bindedObjects = [];
		
		this.binds = {};
		
		this._noArgs = [];
    },
	
	mon: function(target, event, method, scope) {
		target.on.apply(target, Array.prototype.slice.call(arguments,1));
		var b = this.binds;
		(b[event] = b[event] || []).push({
			target: target,
			method: method,
			scope: scope
		});
	},
	
	mun: function(target, event, method, scope) {
		var b = this.binds[event], 
			idx = -1, 
			i = 0, 
			ln = b ? b.length : 0;
			
		for(; i < ln; i++) {
			if(b[i].target == target && b[i].method == method && b[i].scope == scope) {
				idx = i;
				ln = -1;
			}
		}
		if(idx > -1) {
			target.un.call(target, event, method, scope);
			b.splice(idx, 1);
		}
	},
	
	bind: function(target, event, method, scope, eOpts) {
		var me = this,
		t = $(target);
		
//		this.handlers[method] = method.bind(me);

		this.handlers[method] = function(e) {
			return e.data.method.apply(e.data.scope, Array.prototype.slice.call(arguments).concat([this]));
		};

		t.bind(event, { scope : scope || me, method : method, eOpts: eOpts }, this.handlers[method]);
		this.bindedObjects.push({
			target : t,
			method : method,
			event : event
		});
	},
	unbind: function(target, event, method) {
		$(target).unbind(event, this.handlers[method]);
	},
	
	unbindAll: function() {
		var me = this, k, handlers = me.handlers;
		Ext.each(this.bindedObjects, function(item, idx, allItems) {
			me.unbind(item.target, item.event, item.method);
		}, this);
		
		for(k in me.handlers) {
			delete(handlers[k]);
		} 
	},
	destroy: function() {
		var k, me = this;
		me.unbindAll();
		
		for(evt in me.binds) {
			b = me.binds[evt];
			for(i=0, ln = b.length; i < ln; i++) {
				me.mun(b[i].target, evt, b[i].method, b[i].scope);
			}
		}		
	}
});



