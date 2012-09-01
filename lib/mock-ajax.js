/*
 Jasmine-Ajax : a set of helpers for testing AJAX requests under the Jasmine
 BDD framework for JavaScript.

 Supports both Prototype.js and jQuery.

 http://github.com/pivotal/jasmine-ajax

 Jasmine Home page: http://pivotal.github.com/jasmine

 Copyright (c) 2008-2010 Pivotal Labs

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

// Jasmine-Ajax interface
var ajaxRequests = [];

function mostRecentAjaxRequest() {
  if (ajaxRequests.length > 0) {
    return ajaxRequests[ajaxRequests.length - 1];
  } else {
    return null;
  }
}

function clearAjaxRequests() {
  ajaxRequests = [];
}

// Fake XHR for mocking Ajax Requests & Responses
function FakeXMLHttpRequest() {
    this.requestHeaders = {};
    this.readyState = 0;
    this.status = null;
    this.responseText = null;

    if (typeof this.open === 'undefined') {
      FakeXMLHttpRequest.prototype.open = function() {
        this.method = arguments[0];
        this.url = arguments[1];
        this.readyState = 1;
      };

      FakeXMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        this.requestHeaders[header] = value;
      };

      FakeXMLHttpRequest.prototype.abort = function() {
        this.readyState = 0;
      };

      FakeXMLHttpRequest.prototype.onreadystatechange = function(isTimeout) {
      };

      FakeXMLHttpRequest.prototype.send = function(data) {
        this.params = data;
        this.readyState = 2;
      };

      FakeXMLHttpRequest.prototype.getResponseHeader = function(name) {
        return this.responseHeaders[name];
      };

      FakeXMLHttpRequest.prototype.getAllResponseHeaders = function() {
        var responseHeaders = [];
        for (var i in this.responseHeaders) {
          if (this.responseHeaders.hasOwnProperty(i)) {
            responseHeaders.push(i + ': ' + this.responseHeaders[i]);
          }
        }
        return responseHeaders.join('\r\n');
      };

      FakeXMLHttpRequest.prototype.response = function(response) {
        this.status = response.status;
        this.responseText = response.responseText || "";
        this.readyState = 4;
        this.responseHeaders = response.responseHeaders ||
        {"Content-type": response.contentType || "application/json" };
        // uncomment for jquery 1.3.x support
        // jasmine.Clock.tick(20);

        this.onreadystatechange();
      };

      FakeXMLHttpRequest.prototype.responseTimeout = function() {
        this.readyState = 4;
        jasmine.Clock.tick(jQuery.ajaxSettings.timeout || 30000);
        this.onreadystatechange('timeout');
      };

      FakeXMLHttpRequest.prototype.request = function (method, url, cb, p, o) {
        // for ExtJs
        this.open(method, url);
        this.send(p);
        if (this.status >= 200 && this.status < 300) {
          if (o.success) {
            if (!o.scope) {
              o.success(cb);
            } else {
              o.success.apply(o.scope, [cb]);
            }
          }
        } else {
          if (o.failure) {
            if (!o.scope) {
              o.failure(cb);
            } else {
              o.failure.apply(o.scope, [cb]);
            }
          }
        }
      };
    }
}


jasmine.Ajax = {

  isInstalled: function() {
    return jasmine.Ajax.installed == true;
  },

  assertInstalled: function() {
    if (!jasmine.Ajax.isInstalled()) {
      throw new Error("Mock ajax is not installed, use jasmine.Ajax.useMock()")
    }
  },

  useMock: function() {
    if (!jasmine.Ajax.isInstalled()) {
      var spec = jasmine.getEnv().currentSpec;
      spec.after(jasmine.Ajax.uninstallMock);

      jasmine.Ajax.installMock();
    }
  },

  installMock: function() {
    if (typeof jQuery != 'undefined') {
      jasmine.Ajax.installJquery();
    } else if (typeof Prototype != 'undefined') {
      jasmine.Ajax.installPrototype();
    } else if (typeof Ext != 'undefined') {
      jasmine.Ajax.installExt();
    } else {
      throw new Error("jasmine.Ajax currently only supports jQuery and Prototype");
    }
    jasmine.Ajax.installed = true;
  },

  installJquery: function() {
    jasmine.Ajax.mode = 'jQuery';
    jasmine.Ajax.real = jQuery.ajaxSettings.xhr;
    jQuery.ajaxSettings.xhr = jasmine.Ajax.jQueryMock;

  },

  installPrototype: function() {
    jasmine.Ajax.mode = 'Prototype';
    jasmine.Ajax.real = Ajax.getTransport;

    Ajax.getTransport = jasmine.Ajax.prototypeMock;
  },

  installExt: function() {
    jasmine.Ajax.mode = 'Ext';
    jasmine.Ajax.real = Ext.lib.Ajax;

    Ext.lib.Ajax = jasmine.Ajax.extMock();
  },

  uninstallMock: function() {
    jasmine.Ajax.assertInstalled();
    if (jasmine.Ajax.mode == 'jQuery') {
      jQuery.ajaxSettings.xhr = jasmine.Ajax.real;
    } else if (jasmine.Ajax.mode == 'Prototype') {
      Ajax.getTransport = jasmine.Ajax.real;
    } else if (jasmine.Ajax.mode === 'Ext') {
      Ext.lib.Ajax = jasmine.Ajax.real;
    }
    jasmine.Ajax.reset();
  },

  reset: function() {
    jasmine.Ajax.installed = false;
    jasmine.Ajax.mode = null;
    jasmine.Ajax.real = null;
  },

  extMock: function() {
    var newXhr = new FakeXMLHttpRequest();
    newXhr.serializeForm = Ext.lib.Ajax.serializeForm;
    newXhr.isCallInProgress = function() {return false;};
    return newXhr;
  },

  jQueryMock: function() {
    var newXhr = new FakeXMLHttpRequest();
    ajaxRequests.push(newXhr);
    return newXhr;
  },

  prototypeMock: function() {
    return new FakeXMLHttpRequest();
  },

  installed: false,
  mode: null
}


// Jasmine-Ajax Glue code for Prototype.js
if (typeof Prototype != 'undefined' && Ajax && Ajax.Request) {
  Ajax.Request.prototype.originalRequest = Ajax.Request.prototype.request;
  Ajax.Request.prototype.request = function(url) {
    this.originalRequest(url);
    ajaxRequests.push(this);
  };

  Ajax.Request.prototype.response = function(responseOptions) {
    return this.transport.response(responseOptions);
  };
}
