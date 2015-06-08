getJasmineRequireObj().AjaxRequestStub = function() {
  var RETURN = 0,
      ERROR = 1,
      TIMEOUT = 2;

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
      this.status = options.status || 200;

      this.contentType = options.contentType;
      this.response = options.response;
      this.responseText = options.responseText;
      this.responseHeaders = options.responseHeaders;
    };

    this.isReturn = function() {
      return this.action === RETURN;
    };

    this.andError = function() {
      this.action = ERROR;
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
