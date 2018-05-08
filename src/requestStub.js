getJasmineRequireObj().AjaxRequestStub = function() {
  var RETURN = 0,
      ERROR = 1,
      TIMEOUT = 2,
      CALL = 3;

  function RequestStub(url, stubData, method) {
    var normalizeQuery = function(query) {
      return query ? query.split('&').sort().join('&') : undefined;
    };

    if (url instanceof RegExp) {
      this.url = url;
      this.query = undefined;
    } else {
      var split = url.split('?');
      this.url = split[0];
      this.query = split.length > 1 ? normalizeQuery(split[1]) : undefined;
    }

    this.data = (stubData instanceof RegExp) ? stubData : normalizeQuery(stubData);
    this.method = method;

    this.andReturn = function(options) {
      this.action = RETURN;
      this.status = (typeof options.status !== 'undefined') ? options.status : 200;
      this.statusText = options.statusText;

      this.contentType = options.contentType;
      this.response = options.response;
      this.responseText = options.responseText;
      this.responseHeaders = options.responseHeaders;
      this.responseURL = options.responseURL;
    };

    this.isReturn = function() {
      return this.action === RETURN;
    };

    this.andError = function(options) {
      if (!options) {
        options = {};
      }
      this.action = ERROR;
      this.status = options.status || 500;
    };

    this.isError = function() {
      return this.action === ERROR;
    };

    this.andTimeout = function() {
      this.action = TIMEOUT;
    };

    this.isTimeout = function() {
      return this.action === TIMEOUT;
    };

    this.andCallFunction = function(functionToCall) {
      this.action = CALL;
      this.functionToCall = functionToCall;
    };

    this.isCallFunction = function() {
      return this.action === CALL;
    };

    this.matches = function(fullUrl, data, method) {
      var urlMatches = false;
      fullUrl = fullUrl.toString();
      if (this.url instanceof RegExp) {
        urlMatches = this.url.test(fullUrl);
      } else {
        var urlSplit = fullUrl.split('?'),
            url = urlSplit[0],
            query = urlSplit[1];
        urlMatches = this.url === url && this.query === normalizeQuery(query);
      }
      var dataMatches = false;
      if (this.data instanceof RegExp) {
        dataMatches = this.data.test(data);
      } else {
        dataMatches = !this.data || this.data === normalizeQuery(data);
      }
      return urlMatches && dataMatches && (!this.method || this.method === method);
    };
  }

  return RequestStub;
};
