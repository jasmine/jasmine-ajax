getJasmineRequireObj().AjaxFakeRequest = function(eventBusFactory) {
  function extend(destination, source, propertiesToSkip) {
    propertiesToSkip = propertiesToSkip || [];
    for (var property in source) {
      if (!arrayContains(propertiesToSkip, property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  }

  function arrayContains(arr, item) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === item) {
        return true;
      }
    }
    return false;
  }

  function wrapProgressEvent(xhr, eventName) {
    return function() {
      if (xhr[eventName]) {
        xhr[eventName].apply(xhr, arguments);
      }
    };
  }

  function initializeEvents(xhr) {
    xhr.eventBus.addEventListener('readystatechange', wrapProgressEvent(xhr, 'onreadystatechange'));
    xhr.eventBus.addEventListener('loadstart', wrapProgressEvent(xhr, 'onloadstart'));
    xhr.eventBus.addEventListener('load', wrapProgressEvent(xhr, 'onload'));
    xhr.eventBus.addEventListener('loadend', wrapProgressEvent(xhr, 'onloadend'));
    xhr.eventBus.addEventListener('progress', wrapProgressEvent(xhr, 'onprogress'));
    xhr.eventBus.addEventListener('error', wrapProgressEvent(xhr, 'onerror'));
    xhr.eventBus.addEventListener('abort', wrapProgressEvent(xhr, 'onabort'));
    xhr.eventBus.addEventListener('timeout', wrapProgressEvent(xhr, 'ontimeout'));
  }

  function unconvertibleResponseTypeMessage(type) {
    var msg = [
      "Can't build XHR.response for XHR.responseType of '",
      type,
      "'.",
      "XHR.response must be explicitly stubbed"
    ];
    return msg.join(' ');
  }

  function fakeRequest(global, requestTracker, stubTracker, paramParser) {
    function FakeXMLHttpRequest() {
      requestTracker.track(this);
      this.eventBus = eventBusFactory(this);
      initializeEvents(this);
      this.requestHeaders = {};
      this.overriddenMimeType = null;
    }

    function findHeader(name, headers) {
      name = name.toLowerCase();
      for (var header in headers) {
        if (header.toLowerCase() === name) {
          return headers[header];
        }
      }
    }

    function normalizeHeaders(rawHeaders, contentType) {
      var headers = [];

      if (rawHeaders) {
        if (rawHeaders instanceof Array) {
          headers = rawHeaders;
        } else {
          for (var headerName in rawHeaders) {
            if (rawHeaders.hasOwnProperty(headerName)) {
              headers.push({ name: headerName, value: rawHeaders[headerName] });
            }
          }
        }
      } else {
        headers.push({ name: "Content-Type", value: contentType || "application/json" });
      }

      return headers;
    }

    function parseXml(xmlText, contentType) {
      if (global.DOMParser) {
        return (new global.DOMParser()).parseFromString(xmlText, 'text/xml');
      } else {
        var xml = new global.ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(xmlText);
        return xml;
      }
    }

    var xmlParsables = ['text/xml', 'application/xml'];

    function getResponseXml(responseText, contentType) {
      if (arrayContains(xmlParsables, contentType.toLowerCase())) {
        return parseXml(responseText, contentType);
      } else if (contentType.match(/\+xml$/)) {
        return parseXml(responseText, 'text/xml');
      }
      return null;
    }

extend(FakeXMLHttpRequest, {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    });

    var iePropertiesThatCannotBeCopied = ['responseBody', 'responseText', 'responseXML', 'status', 'statusText', 'responseTimeout', 'responseURL'];
    extend(FakeXMLHttpRequest.prototype, new global.XMLHttpRequest(), iePropertiesThatCannotBeCopied);
    extend(FakeXMLHttpRequest.prototype, {
      open: function() {
        this.method = arguments[0];
        this.url = arguments[1] + '';
        this.username = arguments[3];
        this.password = arguments[4];
        this.readyState = FakeXMLHttpRequest.OPENED;
        this.requestHeaders = {};
        this.eventBus.trigger('readystatechange');
      },

      setRequestHeader: function(header, value) {
        if (this.readyState === 0) {
          throw new Error('DOMException: Failed to execute "setRequestHeader" on "XMLHttpRequest": The object\'s state must be OPENED.');
        }

        if(this.requestHeaders.hasOwnProperty(header)) {
          this.requestHeaders[header] = [this.requestHeaders[header], value].join(', ');
        } else {
          this.requestHeaders[header] = value;
        }
      },

      overrideMimeType: function(mime) {
        this.overriddenMimeType = mime;
      },

      abort: function() {
        this.readyState = FakeXMLHttpRequest.UNSENT;
        this.status = 0;
        this.statusText = "abort";
        this.eventBus.trigger('readystatechange');
        this.eventBus.trigger('progress');
        this.eventBus.trigger('abort');
        this.eventBus.trigger('loadend');
      },

      readyState: FakeXMLHttpRequest.UNSENT,

      onloadstart: null,
      onprogress: null,
      onabort: null,
      onerror: null,
      onload: null,
      ontimeout: null,
      onloadend: null,
      onreadystatechange: null,

      addEventListener: function() {
        this.eventBus.addEventListener.apply(this.eventBus, arguments);
      },

      removeEventListener: function(event, callback) {
        this.eventBus.removeEventListener.apply(this.eventBus, arguments);
      },

      status: null,

      send: function(data) {
        this.params = data;
        this.eventBus.trigger('loadstart');

        var stub = stubTracker.findStub(this.url, data, this.method);

        this.dispatchStub(stub);
      },

      dispatchStub: function(stub) {
        if (stub) {
          if (stub.isReturn()) {
            this.respondWith(stub);
          } else if (stub.isError()) {
            this.responseError(stub);
          } else if (stub.isTimeout()) {
            this.responseTimeout();
          } else if (stub.isCallFunction()) {
            this.responseCallFunction(stub);
          }
        }
      },

      contentType: function() {
        return findHeader('content-type', this.requestHeaders);
      },

      data: function() {
        if (!this.params) {
          return {};
        }

        return paramParser.findParser(this).parse(this.params);
      },

      getResponseHeader: function(name) {
        var resultHeader = null;
        if (!this.responseHeaders) { return resultHeader; }

        name = name.toLowerCase();
        for(var i = 0; i < this.responseHeaders.length; i++) {
          var header = this.responseHeaders[i];
          if (name === header.name.toLowerCase()) {
            if (resultHeader) {
              resultHeader = [resultHeader, header.value].join(', ');
            } else {
              resultHeader = header.value;
            }
          }
        }
        return resultHeader;
      },

      getAllResponseHeaders: function() {
        if (!this.responseHeaders) { return null; }

        var responseHeaders = [];
        for (var i = 0; i < this.responseHeaders.length; i++) {
          responseHeaders.push(this.responseHeaders[i].name + ': ' +
            this.responseHeaders[i].value);
        }
        return responseHeaders.join('\r\n') + '\r\n';
      },

      responseText: null,
      response: null,
      responseType: null,
      responseURL: null,

      responseValue: function() {
        switch(this.responseType) {
          case null:
          case "":
          case "text":
            return this.readyState >= FakeXMLHttpRequest.LOADING ? this.responseText : "";
          case "json":
            return JSON.parse(this.responseText);
          case "arraybuffer":
            throw unconvertibleResponseTypeMessage('arraybuffer');
          case "blob":
            throw unconvertibleResponseTypeMessage('blob');
          case "document":
            return this.responseXML;
        }
      },


      respondWith: function(response) {
        if (this.readyState === FakeXMLHttpRequest.DONE) {
          throw new Error("FakeXMLHttpRequest already completed");
        }

        this.status = response.status;
        this.statusText = response.statusText || "";
        this.responseHeaders = normalizeHeaders(response.responseHeaders, response.contentType);
        this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
        this.eventBus.trigger('readystatechange');

        this.responseText = response.responseText || "";
        this.responseType = response.responseType || "";
        this.responseURL = response.responseURL || null;
        this.readyState = FakeXMLHttpRequest.DONE;
        this.responseXML = getResponseXml(response.responseText, this.getResponseHeader('content-type') || '');
        if (this.responseXML) {
          this.responseType = 'document';
        }
        if (response.responseJSON) {
          this.responseText = JSON.stringify(response.responseJSON);
        }

        if ('response' in response) {
          this.response = response.response;
        } else {
          this.response = this.responseValue();
        }

        this.eventBus.trigger('readystatechange');
        this.eventBus.trigger('progress');
        this.eventBus.trigger('load');
        this.eventBus.trigger('loadend');
      },

      responseTimeout: function() {
        if (this.readyState === FakeXMLHttpRequest.DONE) {
          throw new Error("FakeXMLHttpRequest already completed");
        }
        this.readyState = FakeXMLHttpRequest.DONE;
        jasmine.clock().tick(30000);
        this.eventBus.trigger('readystatechange');
        this.eventBus.trigger('progress');
        this.eventBus.trigger('timeout');
        this.eventBus.trigger('loadend');
      },

      responseError: function(response) {
        if (!response) {
          response = {};
        }
        if (this.readyState === FakeXMLHttpRequest.DONE) {
          throw new Error("FakeXMLHttpRequest already completed");
        }
        this.status = response.status;
        this.statusText = response.statusText || "";
        this.readyState = FakeXMLHttpRequest.DONE;
        this.eventBus.trigger('readystatechange');
        this.eventBus.trigger('progress');
        this.eventBus.trigger('error');
        this.eventBus.trigger('loadend');
      },

      responseCallFunction: function(stub) {
        stub.action = undefined;
        stub.functionToCall(stub, this);
        this.dispatchStub(stub);
      }
    });

    return FakeXMLHttpRequest;
  }

  return fakeRequest;
};
