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

App.ResourceMgr = Ext.extend(Ext.util.Observable, {
	constructor: function() {
		this.pages = {};
		this.links = {};
		this.models = {};
		this.imageManager = App.Injector.resolve('imageManager');
		this.uniqueId = 0;
	},
	getUniqueId: function() {
		return '_' + this.uniqueId++;
	},
	initCache : function(data) {
 		var id, url, i, ln, controllers, controller;

		for(id in data.models) {
			this.models[id] = data.models[id];
		}
		for(id in data.links) {
			this.pages[data.links[id]] = data.models[id];
			this.links[id] = data.models[id];
			
		}
		this.imageManager.defineImages(data.images);
	},
	setLink: function(id, value) {
		this.links[id] = value;
	},
	getLink: function(id) {
		return this.links[id];
	},
	fetchLink: function(id, callback, scope) {
		scope = scope || window;
		if(this.links[id]) {
			return callback.call(scope, this.links[id]);
		}
		
    	jQuery.ajax({
    		url: "/getLinkInfo",
    		dataType: 'json',
    		data: {
    			id: id
    		},
    		success: jQuery.proxy(function(response) {
    			this.setLink(id, response);
    			callback.call(scope, this.links[id]);
    		}, this)
    	});
		
	},
	
	init : function() {
	    this.initCache(window.jsData);
	},
	loadPath : function(path) {
    	if(this.pages[path]) {
    		return App.SectionMgr.initPath(this.pages[path], path);
    	}
    	
    	this.fetchPath(path);
    },
	getPage : function(path) {
		return this.pages[path];
	},
	
	setModel: function(id, value) {
		this.models[id] = value;
	},
	
	getModel: function(id) {
		if(id === undefined) {
			return {};
		}
		return this.models[id];
	},
	
	loadModels: function(models, callback, scope) {
		var i = 0, ln = models.length, missing = [];
		
		for(; i < ln; i++) {
			if(models[i].id && ! this.models[models[i].id]) {
				if(models[i].type !== "rootModel") {
					missing.push(models[i]);
				}
			}
		}
		
		if(missing.length == 0) {
			return callback.call(scope || window);
		}

		jQuery.ajax({
			url: '/loadModels',
			dataType: 'json',
			type: 'POST',
			data: {
				models: missing
			},
			success: jQuery.proxy(this.onModelsLoaded, this, callback, scope)
		});
	},
	
	onModelsLoaded: function(callback, scope, response) {
		var id;

		for(id in response.data) {
			this.models[id] = response.data[id];
		}
		
		for(id in response.links) {
			this.setLink(id, response.links[id]);
		}
		
		this.imageManager.processImages(response.images);
		
		callback.call(scope || window);
	},
	
	onPathLoaded : function(response, path) {
		this.initCache(response);
    	if(! this.pages[path]) {
    		alert('404! ' + path);
    		return;
    	}
    	App.SectionMgr.initPath(this.pages[path], path);
	},
	
	fetchPath : function(path) {
		var me = this;
    	jQuery.ajax({
    		url: path + ".json",
    		dataType: 'json',
    		success: function(response) {
    			me.onPathLoaded(response, path);
    		}
    	});
	}		
});
