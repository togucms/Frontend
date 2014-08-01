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

(function(jQuery) {
	$(document).ready(function(){
		document.readyFired = true;
	});
})(jQuery);

var History = (function(){
	
	var iframe = null,
		oldIEMode = ! Modernizr.hashchange,
		callback = null,
		hiddenField = null,
		ready = false,
		currentToken = null,
		isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1),
		pushState = ! ( ! history.pushState);
		
	return {
		pushState: pushState,
	    getHash: pushState ? function() {
	    		return window.location.pathname;
		} : function() {
	        var href = window.location.href,
	            i = href.indexOf("#");
	           
//	        console.log(href);
	        return i >= 0 ? href.substr(i + 2) : null;
		},
	    doSave: function() {
	        hiddenField.value = currentToken;
	    },
	    handleStateChange: function(token) {
	        currentToken = token;
	        callback(token);
	    },
	    checkIFrame: function () {
	        var contentWindow = iframe.contentWindow;
	            
	        if (!contentWindow || !contentWindow.document) {
	        	setTimeout(checkIFrame, 10);
	            return;
	        }
	       
	        var doc = contentWindow.document,
	            elem = doc.getElementById("state"),
	            oldToken = elem ? elem.innerText : null,
	            oldHash = History.getHash();
	           
	        setInterval(function() {
                var doc = contentWindow.document,
                elem = doc.getElementById("state"),
                newToken = elem ? elem.innerText : null,
                newHash = History.getHash();

                if (newToken !== oldToken) {
	                oldToken = newToken;
	                History.handleStateChange(newToken.substr(1));
	                window.top.location.hash = newToken;
	                oldHash = newToken;
	                History.doSave();
	            } else if (newHash !== oldHash) {
	                oldHash = newHash;
	                History.updateIFrame('!' + newHash);
	            }
	        },50);

	        ready = true;
	    },

	    startUp: function () {
	        currentToken = hiddenField.value || History.getHash();

	        if (oldIEMode) {
	            History.checkIFrame();
	        } else {
	            var hash = History.getHash();
	            
	            setInterval(function() {
                    var newHash = History.getHash();
                    if (newHash !== hash) {
                        hash = newHash;
                        History.handleStateChange(hash);
                        History.doSave();
                    }
	            }, 50);
	            
	            ready = true;
	            
	            console.log('ready');
	        }
	    },

	    updateIFrame: function(token) {
	        var html = '<html><body><div id="state">' + 
	                    token.htmlEncode() + 
	                    '</div></body></html>';

	        try {
	            var doc = iframe.contentWindow.document;
	            doc.open();
	            doc.write(html);
	            doc.close();
	            return true;
	        } catch (e) {
	            return false;
	        }
	    },
	    init: function (onReady, onChange) {
	        callback = onChange;

	        if (ready) {
	        	$(document).ready(onReady);
	            return;
	        }
	        
	        if (!document.readyFired) {
	            $(document).ready(function() {
	                History.init(onReady, onChange);
	            });
	            return;
	        }
	        hiddenField = document.getElementById("history-field");
	        
	        if (oldIEMode) {
	        	iframe = document.getElementById("history-frame");
	        }

	        if(! history.pushState) {
	        	History.startUp();
	        }
	        
	        currentToken = History.getHash();
	        window.onpopstate = function() {
	        	 var newHash = History.getHash();
                 if (newHash !== currentToken) {
                	 callback(History.getHash());
                	 currentToken = newHash;
                 }
	        };
			
	        if (onReady) {
	        	$(document).ready(onReady);
	        }
	    },
	    add: function (token, preventDup) {
	        if (preventDup !== false) {
	            if (History.getToken() === token) {
	                return true;
	            }
	        }
	        
	        if (oldIEMode) {
	            return History.updateIFrame("!" + token);
	        } else if(! pushState ) {
	            window.location.hash = "!" + token;
	            return true;
	        }
	        
	        currentToken = token;
	        history.pushState(null, null, token);
	        if(isSafari) {
		        window.location.hash = '|';
		        window.history.go(-1);
	        }

	        callback(token);
	        return true;
	    },

	    back: function() {
	        window.history.go(-1);
	    },

	    forward: function(){
	        window.history.go(1);
	    },
	    getToken: function() {
	        return ready ? currentToken : History.getHash();
	    },
	    historyChanged: function() {
	    	
	    }
	}
})();