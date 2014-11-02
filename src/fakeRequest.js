getJasmineRequireObj().AjaxFakeRequest = function() {
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

  function fakeRequest(global, requestTracker, stubTracker, paramParser) {
    function FakeXMLHttpRequest() {
      requestTracker.track(this);
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

    var iePropertiesThatCannotBeCopied = ['responseBody', 'responseText', 'responseXML', 'status', 'statusText', 'responseTimeout'];
    extend(FakeXMLHttpRequest.prototype, new global.XMLHttpRequest(), iePropertiesThatCannotBeCopied);
    extend(FakeXMLHttpRequest.prototype, {
      open: function() {
        this.method = arguments[0];
        this.url = arguments[1];
        this.username = arguments[3];
        this.password = arguments[4];
        this.readyState = 1;
        this.onreadystatechange();
      },

      setRequestHeader: function(header, value) {
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
        this.readyState = 0;
        this.status = 0;
        this.statusText = "abort";
        this.onreadystatechange();
        this.onprogress();
        this.onabort();
        this.onloadend();
      },

      readyState: 0,

      onloadstart: function() {
      },

      onprogress: function() {
      },

      onabort: function() {
      },

      onerror: function() {
      },

      onload: function() {
      },

      ontimeout: function() {
      },

      onloadend: function() {
      },

      onreadystatechange: function(isTimeout) {
      },

      status: null,

      send: function(data) {
        this.params = data;
        this.readyState = 2;
        this.onloadstart();
        this.onreadystatechange();

        var stub = stubTracker.findStub(this.url, data, this.method);
        if (stub) {
          this.response(stub);
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
        name = name.toLowerCase();
        var resultHeader;
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
        var responseHeaders = [];
        for (var i = 0; i < this.responseHeaders.length; i++) {
          responseHeaders.push(this.responseHeaders[i].name + ': ' +
            this.responseHeaders[i].value);
        }
        return responseHeaders.join('\r\n');
      },

      responseText: null,

      response: function(response) {
        if (this.readyState === 4) {
          throw new Error("FakeXMLHttpRequest already completed");
        }
        this.status = response.status;
        this.statusText = response.statusText || "";
        this.responseText = response.responseText || "";
        this.readyState = 4;
        this.responseHeaders = normalizeHeaders(response.responseHeaders, response.contentType);
        this.responseXML = getResponseXml(response.responseText, this.getResponseHeader('content-type') || '');

        this.onreadystatechange();
        this.onprogress();
        this.onload();
        this.onloadend();
      },

      responseTimeout: function() {
        if (this.readyState === 4) {
          throw new Error("FakeXMLHttpRequest already completed");
        }
        this.readyState = 4;
        jasmine.clock().tick(30000);
        this.onreadystatechange('timeout');
        this.onprogress();
        this.ontimeout();
        this.onloadend();
      },

      responseError: function() {
        if (this.readyState === 4) {
          throw new Error("FakeXMLHttpRequest already completed");
        }
        this.readyState = 4;
        this.onreadystatechange();
        this.onprogress();
        this.onerror();
        this.onloadend();
      }
    });

    return FakeXMLHttpRequest;
  }

  return fakeRequest;
};
