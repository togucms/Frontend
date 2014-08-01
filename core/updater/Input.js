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

App.updater.Input = Ext.extend(App.updater.Attr, {
	onInit: function() {
		var element = this.getElement();
		this.bind(element, 'onkeypress', this.onChange, this);
		this.bind(element, 'change', this.onChange, this);
		this.bind(element, 'onpaste', this.onChange, this);
		this.bind(element, 'oninput', this.onChange, this);
	},
	update: function(element, value, oldValue) {
		if(this.attrProperty !== "value") {
			return this.callParent();
		}
		if(element.val() !== value) {
			element.val(value);
		}
	},
	onChange: function() {
		var element = this.getElement();
		this.component.data.set(this.variable, element.val());
	}
});