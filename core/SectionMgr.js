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

App.SectionMgr = (function($) {
	if(History.pushState) {
		if(window.location.hash.length > 0 && window.location.hash != "|") {
			window.location.href = window.location.hash.substring(2);
		}
	} else {
		if(window.location.pathname != window.settings.urlBase) {
			window.location.href = window.settings.urlBase + "#!" + window.location.pathname;
		}
		var hash = window.location.hash;
		if(window.location.hash.length == 0) {
			hash = '#!/';
			window.location.hash = hash;
		}
		hash = hash.substring(2);
		$(document).ready(function() {
			History.add(hash, false);
		});
	}

	App.Injector.configure({
		bus: Ext.util.Observable,
		imageManager: App.ImageManager,
		resourceManager: App.ResourceMgr,
		alohaManager: App.AlohaManager,
		componentFactory: App.ComponentFactory,
		modelFactory: App.ModelFactory,
		updaterFactory: App.UpdaterFactory
	});
		
	if(window != window.top) {
		window.__id = +new Date();
		$(document.body).addClass('iframe');
		top.SiteeditorInstance && top.SiteeditorInstance.register(window);
	}

	var onChange = function(url){
		url = url || "";
    	if(! url) {
    		url = "/";
    	}
    	resourceManager.loadPath(url);
    }

    var initPath = function(object, path) {
    	if(currentPath == path) {
    		return;
    	}
    	
    	currentPath = path;
    	
		siteController.loadPage(object);
		
		History.historyChanged(path, object);
    }

    var siteController = new App.SiteController(), 
		currentPath, 
		currentPage = window.settings.currentPath,
		mouseMoved = false,
		imageManager = App.Injector.resolve('imageManager'),
		resourceManager = App.Injector.resolve('resourceManager');
	
	resourceManager.init();
	
	$('.active').remove();
	
	History.init(function() {
		onChange(History.getToken());
	}, onChange);

	window._gaq = window._gaq || [];

 	return {
 		getCurrentPath : function() {
 			return currentPath;
 		},
 		initPath : function(object, path) {
 			initPath(object, path);
 		},
 		defineImage : function(img) {
 			imageManager.defineImage(img);
 		},
 		getSiteController: function() {
 			return siteController;
 		},
 		getImageInfo: function(src) {
 			return imageManager.getImageInfo(src);
 		},
 		getCachedImages: function() {
 			return imageManager.getCachedImages();
 		},
 		loadImage : function(src) {
 			imageManager.loadImage(src);
 		},
 		setMouseMoved: function(value) {
 		    mouseMoved = value;
 		},
 		getMouseMoved: function() {
 		    return mouseMoved;
 		}
 	};
})(jQuery);

