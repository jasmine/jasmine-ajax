describe('FakeRequest', function() {
  beforeEach(function() {
    this.requestTracker = { track: jasmine.createSpy('trackRequest') };
    this.stubTracker = { findStub: function() {} };
    var parserInstance = this.parserInstance = jasmine.createSpy('parse');
    this.paramParser = { findParser: function() { return { parse: parserInstance }; } };
    this.fakeGlobal = {
      XMLHttpRequest: function() {
        this.extraAttribute = 'my cool attribute';
      },
      DOMParser: window.DOMParser,
      ActiveXObject: window.ActiveXObject
    };
    this.FakeRequest = getJasmineRequireObj().AjaxFakeRequest()(this.fakeGlobal, this.requestTracker, this.stubTracker, this.paramParser);
  });

  it('extends from the global XMLHttpRequest', function() {
    var request = new this.FakeRequest();

    expect(request.extraAttribute).toEqual('my cool attribute');
  });

  it('skips XMLHttpRequest attributes that IE does not want copied', function() {
    // use real window here so it will correctly go red on IE if it breaks
    var FakeRequest = getJasmineRequireObj().AjaxFakeRequest()(window, this.requestTracker, this.stubTracker, this.paramParser);
    var request = new FakeRequest();

    expect(request.responseBody).toBeUndefined();
    expect(request.responseXML).toBeUndefined();
    expect(request.statusText).toBeUndefined();
  });

  it('tracks the request', function() {
    var request = new this.FakeRequest();

    expect(this.requestTracker.track).toHaveBeenCalledWith(request);
  });

  it('has default request headers and override mime type', function() {
    var request = new this.FakeRequest();

    expect(request.requestHeaders).toEqual({});
    expect(request.overriddenMimeType).toBeNull();
  });

  it('saves request information when opened', function() {
    var request = new this.FakeRequest();
    request.open('METHOD', 'URL', 'ignore_async', 'USERNAME', 'PASSWORD');

    expect(request.method).toEqual('METHOD');
    expect(request.url).toEqual('URL');
    expect(request.username).toEqual('USERNAME');
    expect(request.password).toEqual('PASSWORD');
  });

  it('saves an override mime type', function() {
    var request = new this.FakeRequest();

    request.overrideMimeType('application/text; charset: utf-8');

    expect(request.overriddenMimeType).toBe('application/text; charset: utf-8');
  });

  it('saves request headers', function() {
    var request = new this.FakeRequest();

    request.setRequestHeader('X-Header-1', 'value1');
    request.setRequestHeader('X-Header-2', 'value2');

    expect(request.requestHeaders).toEqual({
      'X-Header-1': 'value1',
      'X-Header-2': 'value2'
    });
  });

  it('combines request headers with the same header name', function() {
    var request = new this.FakeRequest();

    request.setRequestHeader('X-Header', 'value1');
    request.setRequestHeader('X-Header', 'value2');

    expect(request.requestHeaders['X-Header']).toEqual('value1, value2');
  });

  it('finds the content-type request header', function() {
    var request = new this.FakeRequest();

    request.setRequestHeader('ContEnt-tYPe', 'application/text+xml');

    expect(request.contentType()).toEqual('application/text+xml');
  });

  describe('managing readyState', function() {
    beforeEach(function() {
      this.request = new this.FakeRequest();
      this.request.onreadystatechange = jasmine.createSpy('onreadystatechange');
    });

    it('has an initial ready state of 0 (uninitialized)', function() {
      expect(this.request.readyState).toBe(0);
      expect(this.request.onreadystatechange).not.toHaveBeenCalled();
    });

    it('has a ready state of 1 (open) when opened', function() {
      this.request.open();

      expect(this.request.readyState).toBe(1);
      expect(this.request.onreadystatechange).toHaveBeenCalled();
    });

    it('has a ready state of 0 (uninitialized) when aborted', function() {
      this.request.open();
      this.request.onreadystatechange.calls.reset();

      this.request.abort();

      expect(this.request.readyState).toBe(0);
      expect(this.request.onreadystatechange).toHaveBeenCalled();
    });

    it('has a ready state of 2 (sent) when sent', function() {
      this.request.open();
      this.request.onreadystatechange.calls.reset();

      this.request.send();

      expect(this.request.readyState).toBe(2);
      expect(this.request.onreadystatechange).toHaveBeenCalled();
    });

    it('has a ready state of 4 (loaded) when timed out', function() {
      this.request.open();
      this.request.send();
      this.request.onreadystatechange.calls.reset();

      jasmine.clock().install();
      this.request.responseTimeout();
      jasmine.clock().uninstall();

      expect(this.request.readyState).toBe(4);
      expect(this.request.onreadystatechange).toHaveBeenCalledWith('timeout');
    });

    it('has a ready state of 4 (loaded) when network erroring', function() {
      this.request.open();
      this.request.send();
      this.request.onreadystatechange.calls.reset();

      this.request.responseError();

      expect(this.request.readyState).toBe(4);
      expect(this.request.onreadystatechange).toHaveBeenCalled();
    });

    it('has a ready state of 4 (loaded) when responding', function() {
      this.request.open();
      this.request.send();
      this.request.onreadystatechange.calls.reset();

      this.request.response({});

      expect(this.request.readyState).toBe(4);
      expect(this.request.onreadystatechange).toHaveBeenCalled();
    });

    it('throws an error when timing out a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.response({});
      var request = this.request;

      expect(function() {
        request.responseTimeout();
      }).toThrowError('FakeXMLHttpRequest already completed');
    });

    it('throws an error when responding to a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.response({});
      var request = this.request;

      expect(function() {
        request.response({});
      }).toThrowError('FakeXMLHttpRequest already completed');
    });

    it('throws an error when erroring a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.response({});
      var request = this.request;

      expect(function() {
        request.responseError({});
      }).toThrowError('FakeXMLHttpRequest already completed');
    });
  });

  describe('triggering progress events', function() {
    beforeEach(function() {
      this.request = new this.FakeRequest();

      spyOn(this.request, 'onloadstart');
      spyOn(this.request, 'onprogress');
      spyOn(this.request, 'onabort');
      spyOn(this.request, 'onerror');
      spyOn(this.request, 'onload');
      spyOn(this.request, 'ontimeout');
      spyOn(this.request, 'onloadend');

      var spies = {};

      spies.loadstart1 = jasmine.createSpy('loadstart1');
      spies.loadstart2 = jasmine.createSpy('loadstart2');
      this.request.addEventListener('loadstart', spies.loadstart1);
      this.request.addEventListener('loadstart', spies.loadstart2);

      spies.progress1 = jasmine.createSpy('progress1');
      spies.progress2 = jasmine.createSpy('progress2');
      this.request.addEventListener('progress', spies.progress1);
      this.request.addEventListener('progress', spies.progress2);

      spies.abort1 = jasmine.createSpy('abort1');
      spies.abort2 = jasmine.createSpy('abort2');
      this.request.addEventListener('abort', spies.abort1);
      this.request.addEventListener('abort', spies.abort2);

      spies.error1 = jasmine.createSpy('error1');
      spies.error2 = jasmine.createSpy('error2');
      this.request.addEventListener('error', spies.error1);
      this.request.addEventListener('error', spies.error2);

      spies.load1 = jasmine.createSpy('load1');
      spies.load2 = jasmine.createSpy('load2');
      this.request.addEventListener('load', spies.load1);
      this.request.addEventListener('load', spies.load2);

      spies.timeout1 = jasmine.createSpy('timeout1');
      spies.timeout2 = jasmine.createSpy('timeout2');
      this.request.addEventListener('timeout', spies.timeout1);
      this.request.addEventListener('timeout', spies.timeout2);

      spies.loadend1 = jasmine.createSpy('loadend1');
      spies.loadend2 = jasmine.createSpy('loadend2');
      this.request.addEventListener('loadend', spies.loadend1);
      this.request.addEventListener('loadend', spies.loadend2);

      this.resetEvents = function() {
        var request = this.request;
        var events = ['loadstart', 'progress', 'abort', 'error', 'load', 'timeout', 'loadend'];
        for (var index in events) {
          var event = events[index];
          request['on' + event].calls.reset();
          spies[event + '1'].calls.reset();
          spies[event + '2'].calls.reset();
        }
      };

      jasmine.addMatchers({
        toHaveTriggeredEvent: function(util) {
          return {
            compare: function(actual, expected) {
              var direct = actual['on' + expected].calls.any();
              var event1 = spies[expected + '1'].calls.any();
              var event2 = spies[expected + '2'].calls.any();
              var pass = direct && event1 && event2;

              var missed = [], triggered = [];

              (direct ? triggered : missed).push('direct');
              (event1 ? triggered : missed).push(expected + '1');
              (event2 ? triggered : missed).push(expected + '2');

              return {
                pass: pass,
                message: pass ?
                  'Expected XHR not to have triggered ' + expected + ' but ' + triggered.join(', ') + ' triggered' :
                  'Expected XHR to have triggered ' + expected + ' but ' + missed.join(', ') + " didn't trigger"
              };
            }
          };
        }
      });
    });

    it('should not trigger any events to start', function() {
      this.request.open();

      expect(this.request).not.toHaveTriggeredEvent('loadstart');
      expect(this.request).not.toHaveTriggeredEvent('progress');
      expect(this.request).not.toHaveTriggeredEvent('abort');
      expect(this.request).not.toHaveTriggeredEvent('error');
      expect(this.request).not.toHaveTriggeredEvent('load');
      expect(this.request).not.toHaveTriggeredEvent('timeout');
      expect(this.request).not.toHaveTriggeredEvent('loadend');
    });

    it('should trigger loadstart when sent', function() {
      this.request.open();
      this.request.send();

      expect(this.request).toHaveTriggeredEvent('loadstart');
      expect(this.request).not.toHaveTriggeredEvent('progress');
      expect(this.request).not.toHaveTriggeredEvent('abort');
      expect(this.request).not.toHaveTriggeredEvent('error');
      expect(this.request).not.toHaveTriggeredEvent('load');
      expect(this.request).not.toHaveTriggeredEvent('timeout');
      expect(this.request).not.toHaveTriggeredEvent('loadend');
    });

    it('should trigger abort, progress, loadend when aborted', function() {
      this.request.open();
      this.request.send();

      this.resetEvents();

      this.request.abort();

      expect(this.request).not.toHaveTriggeredEvent('loadstart');
      expect(this.request).toHaveTriggeredEvent('progress');
      expect(this.request).toHaveTriggeredEvent('abort');
      expect(this.request).not.toHaveTriggeredEvent('error');
      expect(this.request).not.toHaveTriggeredEvent('load');
      expect(this.request).not.toHaveTriggeredEvent('timeout');
      expect(this.request).toHaveTriggeredEvent('loadend');
    });

    it('should trigger error, progress, loadend when network error', function() {
      this.request.open();
      this.request.send();

      this.resetEvents();

      this.request.responseError();

      expect(this.request).not.toHaveTriggeredEvent('loadstart');
      expect(this.request).toHaveTriggeredEvent('progress');
      expect(this.request).not.toHaveTriggeredEvent('abort');
      expect(this.request).toHaveTriggeredEvent('error');
      expect(this.request).not.toHaveTriggeredEvent('load');
      expect(this.request).not.toHaveTriggeredEvent('timeout');
      expect(this.request).toHaveTriggeredEvent('loadend');
    });

    it('should trigger timeout, progress, loadend when timing out', function() {
      this.request.open();
      this.request.send();

      this.resetEvents();

      jasmine.clock().install();
      this.request.responseTimeout();
      jasmine.clock().uninstall();

      expect(this.request).not.toHaveTriggeredEvent('loadstart');
      expect(this.request).toHaveTriggeredEvent('progress');
      expect(this.request).not.toHaveTriggeredEvent('abort');
      expect(this.request).not.toHaveTriggeredEvent('error');
      expect(this.request).not.toHaveTriggeredEvent('load');
      expect(this.request).toHaveTriggeredEvent('timeout');
      expect(this.request).toHaveTriggeredEvent('loadend');
    });

    it('should trigger load, progress, loadend when responding', function() {
      this.request.open();
      this.request.send();

      this.resetEvents();

      this.request.response({ status: 200 });

      expect(this.request).not.toHaveTriggeredEvent('loadstart');
      expect(this.request).toHaveTriggeredEvent('progress');
      expect(this.request).not.toHaveTriggeredEvent('abort');
      expect(this.request).not.toHaveTriggeredEvent('error');
      expect(this.request).toHaveTriggeredEvent('load');
      expect(this.request).not.toHaveTriggeredEvent('timeout');
      expect(this.request).toHaveTriggeredEvent('loadend');
    });
  });

  it('ticks the jasmine clock on timeout', function() {
    var clock = { tick: jasmine.createSpy('tick') };
    spyOn(jasmine, 'clock').and.returnValue(clock);

    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.responseTimeout();

    expect(clock.tick).toHaveBeenCalledWith(30000);
  });

  it('has an initial status of null', function() {
    var request = new this.FakeRequest();

    expect(request.status).toBeNull();
  });

  it('has an aborted status', function() {
    var request = new this.FakeRequest();

    request.abort();

    expect(request.status).toBe(0);
    expect(request.statusText).toBe('abort');
  });

  it('has a status from the response', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200 });

    expect(request.status).toBe(200);
    expect(request.statusText).toBe('');
  });

  it('has a statusText from the response', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, statusText: 'OK' });

    expect(request.status).toBe(200);
    expect(request.statusText).toBe('OK');
  });

  it('saves off any data sent to the server', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send('foo=bar&baz=quux');

    expect(request.params).toBe('foo=bar&baz=quux');
  });

  it('parses data sent to the server', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send('foo=bar&baz=quux');

    this.parserInstance.and.returnValue('parsed');

    expect(request.data()).toBe('parsed');
  });

  it('skips parsing if no data was sent', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    expect(request.data()).toEqual({});
    expect(this.parserInstance).not.toHaveBeenCalled();
  });

  it('saves responseText', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, responseText: 'foobar' });

    expect(request.responseText).toBe('foobar');
  });

  it('defaults responseText if none is given', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200 });

    expect(request.responseText).toBe('');
  });

  it('retrieves individual response headers', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({
      status: 200,
      responseHeaders: {
        'X-Header': 'foo'
      }
    });

    expect(request.getResponseHeader('X-Header')).toBe('foo');
  });

  it('retrieves individual response headers case-insensitively', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({
      status: 200,
      responseHeaders: {
        'X-Header': 'foo'
      }
    });

    expect(request.getResponseHeader('x-header')).toBe('foo');
  });

  it('retrieves a combined response header', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({
      status: 200,
      responseHeaders: [
        { name: 'X-Header', value: 'foo' },
        { name: 'X-Header', value: 'bar' }
      ]
    });

    expect(request.getResponseHeader('x-header')).toBe('foo, bar');
  });

  it("doesn't pollute the response headers of other XHRs", function() {
    var request1 = new this.FakeRequest();
    request1.open();
    request1.send();

    var request2 = new this.FakeRequest();
    request2.open();
    request2.send();

    request1.response({ status: 200, responseHeaders: { 'X-Foo': 'bar' } });
    request2.response({ status: 200, responseHeaders: { 'X-Baz': 'quux' } });

    expect(request1.getAllResponseHeaders()).toBe('X-Foo: bar');
    expect(request2.getAllResponseHeaders()).toBe('X-Baz: quux');
  });

  it('retrieves all response headers', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({
      status: 200,
      responseHeaders: [
        { name: 'X-Header-1', value: 'foo' },
        { name: 'X-Header-2', value: 'bar' },
        { name: 'X-Header-1', value: 'baz' }
      ]
    });

    expect(request.getAllResponseHeaders()).toBe("X-Header-1: foo\r\nX-Header-2: bar\r\nX-Header-1: baz");
  });

  it('sets the content-type header to the specified contentType when no other headers are supplied', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, contentType: 'text/plain' });

    expect(request.getResponseHeader('content-type')).toBe('text/plain');
    expect(request.getAllResponseHeaders()).toBe('Content-Type: text/plain');
  });

  it('sets a default content-type header if no contentType and headers are supplied', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200 });

    expect(request.getResponseHeader('content-type')).toBe('application/json');
    expect(request.getAllResponseHeaders()).toBe('Content-Type: application/json');
  });

  it('has no responseXML by default', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200 });

    expect(request.responseXML).toBeNull();
  });

  it('parses a text/xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, contentType: 'text/xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
    }
  });

  it('parses an application/xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, contentType: 'application/xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
    }
  });

  it('parses a custom blah+xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.response({ status: 200, contentType: 'application/text+xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
    }
  });
});
