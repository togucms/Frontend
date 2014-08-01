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

Ext.ns('App.ioc');

App.ioc.Injector = App.Injector = (function() {
	var noArgs = [];
	var Injector = Ext.extend(Ext.util.Observable, {
		constructor: function() {
			this.providers = {};
			this.injectionStack = [];
			return this;
		},
		configure: function (configuration) {
			var identifier, 
				config, 
				provider;
				
			configuration = configuration || {};
			
			for(identifier in configuration) {
				config = configuration[identifier];
				if(Ext.isObject(config)) {
					provider = new App.ioc.DependencyProvider(Ext.apply({ identifier: identifier}, config));
				} else {
					provider = new App.ioc.DependencyProvider({ identifier: identifier, className : config });
				}
				
				this.providers[identifier] = provider;
				
				if(provider.getEager()) {
					provider.resolve();
				}
			}
			
			return this;
		},
	
		reset: function() {
			this.providers = {}
		},
	
		canResolve: function(identifier) {
			return !! this.providers[identifier];
		},
		
		resolve: function( identifier, targetInstance, targetInstanceConstructorArguments ) {
			var provider = this.providers[identifier];
			if(provider) {
				return provider.resolve( targetInstance, targetInstanceConstructorArguments )
			} else {
				console.error( "Error while resolving value to inject: no dependency provider found for '" + identifier + "'." );
			}
		},
		inject: function(identifiers, targetInstance, targetInstanceConstructorArguments, targetInstanceIsInitialized/* = true */) {
			/* TODO: verify injection stack */
			//this.injectionStack.push( targetClass )
			var key, value;
			for(key in identifiers) {
				value = identifiers[key];
				targetInstance[key] = this.resolve(value, targetInstance, targetInstanceConstructorArguments);
			}
		}
	});
	
	var old = Ext.extend;
	Ext.extend = function(sb, sp, overrides) {
		var superclass = sp,
			o = overrides,
			k;
        if(Ext.isObject(sp)){
            o = sp;
            superclass = sb;
        }
        
		var oc = Object.prototype.constructor;
		
		if(o.inject) {
			var inject = o.inject,
				i, ln, constructor;
				
			if(! Ext.isObject(o.inject)) {
				inject = {};
				if(Ext.isArray(o.inject)) {
					for(i = 0, ln = o.inject.length; i < ln; i++) {
						inject[o.inject[i]] = o.inject[i];
					}
				} else {
					inject[o.inject] = o.inject;
				}
			}
			o._inject = Ext.applyIf(inject, superclass.prototype._inject || {});
			delete o.inject;
			
			constructor = o.constructor;
			if(constructor == oc && superclass.constructor != oc) {
				constructor = function() {
					superclass.apply(this, arguments);
				};
			}
			
			o.constructor = function() {
				if(! this.$injected) {
					App.Injector.inject(this._inject, this, arguments, false);
					this.$injected = true;
				}
				constructor.apply(this, arguments);
			}
			constructor.$previous = o.constructor;
		} else {
			if(sp._inject && o.constructor != oc) {
				constructor = o.constructor;
				o.constructor = function() {
					if(! this.$injected) {
						App.Injector.inject(this._inject, this, arguments, false);
						this.$injected = true;
					}
					constructor.apply(this, arguments);
				}
				constructor.$previous = o.constructor;
			}
		}
		
		var Class = old.apply(this, arguments);
		
		for(k in o) {
			if(o.hasOwnProperty(k) && Ext.isFunction(o[k])) {
				Class.prototype[k].$methodName = k;
				Class.prototype[k].$class = Class;
			}
		}

		// IE8
		if(Class.prototype.constructor && ! Class.prototype.constructor.$methodName) {
			Class.prototype.constructor.$methodName = 'constructor';
			Class.prototype.constructor.$class = Class;
		}
		
		return Class;
	};


	return new Injector();
})();



