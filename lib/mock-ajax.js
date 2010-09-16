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