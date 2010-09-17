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

    readyState: 0,

    status: null,

    send: function(data) {
      xhr.params = data;
    },

    getResponseHeader: function(name) {
      return xhr.responseHeaders[name];
    },

    responseText: null,

    response: function(response) {
      xhr.status = response.status;
      xhr.responseText = response.responseText || "";
      xhr.readyState = 4;
      xhr.responseHeaders = response.responseHeaders ||
                            {"Content-type": response.contentType || "application/json" };

      // uncomment for jquery 1.3.x support
      // jasmine.Clock.tick(20);

      xhr.onreadystatechange();
    }
  };

  return xhr;
}

// Jasmine-Ajax Glue code for Prototype.js
Ajax.Request.prototype.originalRequest = Ajax.Request.prototype.request;
Ajax.Request.prototype.request = function(url) {
  this.originalRequest(url);
   ajaxRequests.push(this);
};

Ajax.Request.prototype.response = function(responseOptions) {
  return this.transport.response(responseOptions);
};

