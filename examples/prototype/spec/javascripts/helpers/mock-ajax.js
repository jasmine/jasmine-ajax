function mockXhr(options) {
  var mockXhr = {
    readyState: 1,
    responseText: "",
    responseXML: "",
    status: null,
    statusText: null,
    
    requestHeaders: {},

    abort: function(){
      console.log("called abort");
    },

    getAllResponseHeaders: function(){
      console.log("called getAllResponseHeaders");
    },

    getResponseHeader: function(header) {
      console.log("called getResponseHeader for " + header + ", was " + request);
    },

    open: function(){
      console.log("Called open");
      mockXhr.method = arguments[0];
      mockXhr.url = arguments[1];
    },

    send: function(){
      console.log("Called send");
    },

    setRequestHeader: function(header, value){
      mockXhr.requestHeaders[header] = value;
      console.log("set " + header + " to " + value);
    },

    response: function(response){
      console.log("called response");
      mockXhr.status = response.status,
      mockXhr.responseText = response.responseText,
      mockXhr.readyState = 4;
      mockXhr.onreadystatechange();
    }
  };
  
  return mockXhr;
}


// need
// 1. store list of requests
// 2. provide way to set response for each request
// 3. ability to call back into the right places

// global list of xhr requests made
xhrs = [];

function mostRecentXhr() {
  if (xhrs.length == 0) {
    return null;
  }
  return xhrs[xhrs.length - 1];
}

if (typeof jQuery != "undefined") {
  console.log("jQuery");
  
  beforeEach(function(){
    spyOn(jQuery, 'ajax').andCallThrough();

    xhrSpy = spyOn(jQuery.ajaxSettings, 'xhr');

    xhrSpy.andCallFake(function(e){
      var newXhr = mockXhr();
      xhrs.push(newXhr);
      return newXhr;
    });

  });
} else {
  console.log("Prototype");
  
  Ajax.Response.defaultContentType = "application/json";

  beforeEach(function() {
    // AjaxRequests.requests.clear();
    spyOn(Ajax, "getTransport").andCallFake(function() {
      //return new FakeAjaxTransport();
      var newXhr = mockXhr();
      xhrs.push(newXhr);
      return newXhr;
    });
  });
}



// Ajax.Request.prototype.response = function(responseOptions) {
//   this.transport.readyState = 4;
//   if (typeof(responseOptions) == "string") {
//     responseOptions = {responseText: responseOptions};
//   }
// 
//   this.transport.responseHeaders = responseOptions.responseHeaders ||
//                                    {"Content-type": responseOptions.contentType || Ajax.Response.defaultContentType};
//   this.transport.status = typeof(responseOptions.status) == "undefined" ? 200 : responseOptions.status;
//   this.transport.responseText = responseOptions.responseText;
//   this.transport.onreadystatechange();
// };
// 
// Ajax.Response.defaultContentType = "application/json";
// Ajax.Request.prototype.oldRequest = Ajax.Request.prototype.request;
// 
// Ajax.Request.prototype.request = function(url) {
//   this.oldRequest(url);
//   AjaxRequests.requests.push(this);
// };
// 
// Ajax.RealRequest = Class.create(Ajax.Request, {
//   request: function(url) {
//     this.transport = Try.these(
//             function() {
//               return new XMLHttpRequest()
//             },
//             function() {
//               return new ActiveXObject('Msxml2.XMLHTTP')
//             },
//             function() {
//               return new ActiveXObject('Microsoft.XMLHTTP')
//             }
//             ) || false;
//     this.oldRequest(url);
//   }
// });
// 
// AjaxRequests = {
//   requests: [],
//   clear: function() {
//     this.requests.clear();
//   },
//   activeRequest: function() {
//     if (this.requests.length > 0) {
//       return this.requests[this.requests.length - 1];
//     } else {
//       return null;
//     }
//   }
// };
// 
// FakeAjaxTransport = Class.create({
//   initialize: function() {
//     this.overrideMimeType = false;
//     this.readyState = 0;
//     this.setRequestHeader = jasmine.createSpy("setRequestHeader");
//     this.open = jasmine.createSpy("open");
//     this.send = jasmine.createSpy("send");
//     this.abort = jasmine.createSpy("abort");
//   },
//   getResponseHeader: function(name) {
//     return this.responseHeaders[name];
//   }
// });
// 
// beforeEach(function() {
//   AjaxRequests.requests.clear();
//   spyOn(Ajax, "getTransport").andCallFake(function() {
//     return new FakeAjaxTransport();
//   });
// });
