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

App.ioc.DependencyProvider = Ext.extend(Ext.util.Observable, {
	identifier: null,
	getIdentifier: function() {
		return this.identifier;
	},
	
	className: null,
	getClassName: function() {
		return this.className;
	},

	parameters: null,
	getParameters: function() {
		return this.parameters;
	},

	fn: null,
	getFn: function() {
		return this.fn;
	},
	
	value: undefined,
	getValue: function() {
		return this.value;
	},
	
	singleton: true,
	getSingleton: function() {
		return this.singleton;
	},

	eager: false,
	getEager: function() {
		return this.eager;
	},

	constructor: function(config) {
		var me = this,
			classDefinition;
		
		Ext.apply(me, config || {});
	},
	resolve: function( targetInstance, targetInstanceConstructorArguments ) {
		if (this.getValue() !== undefined) {
			return this.getValue();
		}
			
		var instance = null,
			fnArguments = [targetInstance],
			parameters, className;
			
		if (this.getFn() !== null) {
			if(targetInstanceConstructorArguments) {
				fnArguments = fnArguments.concat(Ext.toArray(targetInstanceConstructorArguments ));
			}
			instance = this.getFn().apply( App.Injector, fnArguments )
		} else {
			className = this.getClassName();
			if(className) {
				parameters = this.getParameters() || [];
				instance = new className(parameters);
			} else {
				return console.error("Error while configuring rule for '" + this.getIdentifier() + "': no 'value', 'fn', or 'className' was specified.");
			}
		}
	
		if (this.getSingleton()) {
			this.value = instance;
		}
		
		return instance;
	}
});