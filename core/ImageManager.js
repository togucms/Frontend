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

App.ImageManager = Ext.extend(App.BaseClass, {
	inject: ['bus'],
	defaultFormat : 'reference',
	constructor: function() {
		var me = this;
		me.callParent(arguments);
		
		me.images = {};
		me.cachedImagesHolder = $('<div />')
			.addClass('cache')
			.appendTo(document.body)
	},
	getFormat: function(format) {
		return format || this.defaultFormat;
	},
	defineImages: function(images) {
		var id;
		
		for(id in images) {
			this.defineImage(id, images[id]);
		}
	},
	defineImage: function(id, img) {
		var format;

		for(format in img) {
			img[format].loaded = false;
		}
		
		this.images[id] = img;
	},
	getSrc: function(id, format) {
		if(! this.images[id]) {
			return;
		}
		format = this.getFormat(format);
		return this.images[id][format].src; 
	},
	
	setLoaded: function(id, format, element) {
		this.images[id][format].loaded = true;
		this.bus.fire('imageLoaded', id, format);
	},

	
	onImageLoad: function(id, format, element) {
		setTimeout($.proxy(this.setLoaded, id, format), 0);
		$(element).remove();
	},
	
	isLoaded: function(id, format) {
		format = me.getFormat(format);
		return !! this.images[id][format].loaded;
	},
	
	load : function(id, format) {
		var me = this, cb;
		format = me.getFormat(format);
		
		if(! me.isLoaded(id, format)) {
			cb = $.proxy(this.onImageLoad, this, {
				id: id,
				format: format
			});
			
			$('<img />').appendTo(me.cachedImagesHolder)
				.load(cb)
				.error(cb)
				.attr('src', me.getSrc(id, format));
		}
	},
	getImageInfo: function(id, callback, scope, eOpts) {
		scope = scope || window;
		if(this.images[id]) {
			return callback.call(scope, this.images[id], eOpts);
		}
		
    	jQuery.ajax({
    		url: "/getImageInfo",
    		dataType: 'json',
    		data: {
    			id: id
    		},
    		success: jQuery.proxy(function(response) {
    			this.defineImage(id, response.media[0]);
    			callback.call(scope, this.images[id], eOpts);
    		}, this)
    	});
		
	},

	
	getCachedImages: function() {
		return this.cachedImages;
	}
	
});

