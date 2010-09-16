Ajax.Request.prototype.response = function(responseOptions) {
  this.transport.readyState = 4;
   if (typeof(responseOptions) == "string") {
     responseOptions = {responseText: responseOptions};
   }

   this.transport.responseHeaders = responseOptions.responseHeaders ||
                                    {"Content-type": responseOptions.contentType || Ajax.Response.defaultContentType};
   this.transport.status = typeof(responseOptions.status) == "undefined" ? 200 : responseOptions.status;
   this.transport.responseText = responseOptions.responseText;
   this.transport.onreadystatechange();
};

Ajax.Response.defaultContentType = "application/json";
Ajax.Request.prototype.oldRequest = Ajax.Request.prototype.request;

Ajax.Request.prototype.request = function(url) {
   this.oldRequest(url);
   ajaxRequests.push(this);
};

Ajax.RealRequest = Class.create(Ajax.Request, {
   request: function(url) {
     this.transport = Try.these(
             function() {
               return new XMLHttpRequest()
             },
             function() {
               return new ActiveXObject('Msxml2.XMLHTTP')
             },
             function() {
               return new ActiveXObject('Microsoft.XMLHTTP')
             }
             ) || false;
     this.oldRequest(url);
   }
});

function stubXhr(options) {
  var xhr = {
    requestHeaders: {},
    open: function() {
      xhr.method = arguments[0];
      xhr.url = arguments[1];
    },

    setRequestHeader: function(header, value) {
      xhr.requestHeaders[header] = value;
    },

    abort: function() {
    },

    readyState: 1,

    status: null,

    send: function(data) {
      xhr.params = data;
    },

    getResponseHeader: function() {},

    responseText: null,

    response: function(response) {
      xhr.status = response.status;
      xhr.responseText = response.responseText || "";
      xhr.readyState = 4;

      // uncomment for jquery 1.3.x support
      // jasmine.Clock.tick(20);

      xhr.onreadystatechange();
    }
  };

  jQuery.extend(xhr, options || {});

  return xhr;
}





// generic

var ajaxRequests = [];

function FakeAjaxTransport() {
   this.overrideMimeType = false;
   this.readyState = 0;
   this.setRequestHeader = jasmine.createSpy("setRequestHeader");
   this.open = jasmine.createSpy("open");
   this.send = jasmine.createSpy("send");
   this.abort = jasmine.createSpy("abort");

   this.getResponseHeader = function(name) {
     return this.responseHeaders[name];
   };
}

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



