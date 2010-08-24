function decodeParams(string) {
  var keyValuePairs = string.replace(/\+/g, "%20").split("&");
  var hash = {};
  $(keyValuePairs).each(function () {
    var equalSplit = this.split("=");
    var key = decodeURIComponent(equalSplit[0]);
    if (hash[key] == null) {
      hash[key] = decodeURIComponent(equalSplit[1]);
    } else if (jQuery.isArray(hash[key])) {
      hash[key].push(decodeURIComponent(equalSplit[1]));
    } else {
      hash[key] = [hash[key]];
      hash[key].push(decodeURIComponent(equalSplit[1]));
    }
  });
  return hash;
}

function replaceNextXhr(xhrHash) {
  xhrSpy.andCallFake(function() {
    var newXhr = stubXhr(xhrHash);
    xhrs.push(newXhr);
    return newXhr;
  });
}

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
    getResponseHeader: function() {
    },
    responseText: null,
    response: function(response) {
      xhr.status = response.status;
      xhr.responseText = response.responseText || "";
      xhr.readyState = 4;

      // jquery 1.3.x
      // jasmine.Clock.tick(20);
      // jquery 1.4.x
      xhr.onreadystatechange();
    }
  };
  $.extend(xhr, options || {});
  return xhr;
}

function mostRecentXhr() {
  if (xhrs.length == 0) {
    return null;
  }
  return xhrs[xhrs.length - 1];
}
