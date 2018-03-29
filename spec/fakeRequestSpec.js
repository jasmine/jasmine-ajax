describe('FakeRequest', function() {
  beforeEach(function() {
    this.requestTracker = { track: jasmine.createSpy('trackRequest') };
    this.stubTracker = { findStub: function() {} };
    var parserInstance = this.parserInstance = jasmine.createSpy('parse');
    this.paramParser = { findParser: function() { return { parse: parserInstance }; } };
    var eventBus = this.fakeEventBus = {
      addEventListener: jasmine.createSpy('addEventListener'),
      trigger: jasmine.createSpy('trigger'),
      removeEventListener: jasmine.createSpy('removeEventListener')
    };
    this.eventBusFactory = function() {
      return eventBus;
    };
    this.fakeGlobal = {
      XMLHttpRequest: function() {
        this.extraAttribute = 'my cool attribute';
      },
      DOMParser: window.DOMParser,
      ActiveXObject: window.ActiveXObject
    };
    this.FakeRequest = getJasmineRequireObj().AjaxFakeRequest(this.eventBusFactory)(this.fakeGlobal, this.requestTracker, this.stubTracker, this.paramParser);
  });

  it('extends from the global XMLHttpRequest', function() {
    var request = new this.FakeRequest();

    expect(request.extraAttribute).toEqual('my cool attribute');
  });

  it('skips XMLHttpRequest attributes that IE does not want copied', function() {
    // use real window here so it will correctly go red on IE if it breaks
    var FakeRequest = getJasmineRequireObj().AjaxFakeRequest(this.eventBusFactory)(window, this.requestTracker, this.stubTracker, this.paramParser);
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

  it('converts the url to a string', function() {
    var request = new this.FakeRequest();
    request.open('METHOD', undefined);

    expect(request.method).toEqual('METHOD');
    expect(request.url).toEqual('undefined');
  });

  it('saves an override mime type', function() {
    var request = new this.FakeRequest();

    request.overrideMimeType('application/text; charset: utf-8');

    expect(request.overriddenMimeType).toBe('application/text; charset: utf-8');
  });

  describe('when the request is not yet opened', function () {

    it('should throw an error', function () {
      var request = new this.FakeRequest();

      expect(function () {
        request.setRequestHeader('X-Header-1', 'value1');
      }).toThrowError('DOMException: Failed to execute "setRequestHeader" on "XMLHttpRequest": The object\'s state must be OPENED.');
    });
  });

  describe('when the request is opened', function () {

    var request;

    beforeEach(function () {
      request = new this.FakeRequest();

      request.open('METHOD', 'URL');
    });

    it('saves request headers', function() {
      request.setRequestHeader('X-Header-1', 'value1');
      request.setRequestHeader('X-Header-2', 'value2');

      expect(request.requestHeaders).toEqual({
        'X-Header-1': 'value1',
        'X-Header-2': 'value2'
      });
    });

    it('combines request headers with the same header name', function() {
      request.setRequestHeader('X-Header', 'value1');
      request.setRequestHeader('X-Header', 'value2');

      expect(request.requestHeaders['X-Header']).toEqual('value1, value2');
    });

    it('finds the content-type request header', function() {
      request.setRequestHeader('ContEnt-tYPe', 'application/text+xml');

      expect(request.contentType()).toEqual('application/text+xml');
    });

    it('clears the request headers when opened', function() {
      // Requirement #14 https://www.w3.org/TR/XMLHttpRequest/#the-open()-method
      request.setRequestHeader('X-Header1', 'value1');

      expect(request.requestHeaders['X-Header1']).toEqual('value1');

      request.open();

      expect(request.requestHeaders['X-Header1']).not.toBeDefined();
      expect(request.requestHeaders).toEqual({});
    });
  });

  it('getResponseHeader returns null, if no response has been received', function() {
    var request = new this.FakeRequest();
    expect(request.getResponseHeader('XY')).toBe(null);
  });

  it('getAllResponseHeaders returns null, if no response has been received', function() {
    var request = new this.FakeRequest();
    expect(request.getAllResponseHeaders()).toBe(null);
  });

  describe('managing readyState', function() {
    beforeEach(function() {
      this.request = new this.FakeRequest();
    });

    it('has a static state UNSENT', function () {
        expect(this.FakeRequest.UNSENT).toBe(0);
    });

    it('has a static state OPENED', function () {
        expect(this.FakeRequest.OPENED).toBe(1);
    });

    it('has a static state HEADERS_RECEIVED', function () {
        expect(this.FakeRequest.HEADERS_RECEIVED).toBe(2);
    });

    it('has a static state LOADING', function () {
        expect(this.FakeRequest.LOADING).toBe(3);
    });

    it('has a static state DONE', function () {
        expect(this.FakeRequest.DONE).toBe(4);
    });

    it('has an initial ready state of 0 (unsent)', function() {
      expect(this.request.readyState).toBe(0);
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalled();
    });

    it('has a ready state of 1 (opened) when opened', function() {
      this.request.open();

      expect(this.request.readyState).toBe(1);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 0 (unsent) when aborted', function() {
      this.request.open();
      this.fakeEventBus.trigger.calls.reset();

      this.request.abort();

      expect(this.request.readyState).toBe(0);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 1 (opened) when sent', function() {
      this.request.open();
      this.fakeEventBus.trigger.calls.reset();

      this.request.send();

      expect(this.request.readyState).toBe(1);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 4 (done) when timed out', function() {
      this.request.open();
      this.request.send();
      this.fakeEventBus.trigger.calls.reset();

      jasmine.clock().install();
      this.request.responseTimeout();
      jasmine.clock().uninstall();

      expect(this.request.readyState).toBe(4);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 4 (done) when network erroring', function() {
      this.request.open();
      this.request.send();
      this.fakeEventBus.trigger.calls.reset();

      this.request.responseError();

      expect(this.request.readyState).toBe(4);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 4 (done) when responding', function() {
      this.request.open();
      this.request.send();
      this.fakeEventBus.trigger.calls.reset();

      this.request.respondWith({});

      expect(this.request.readyState).toBe(4);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('has a ready state of 2, then 4 (done) when responding', function() {
      this.request.open();
      this.request.send();
      this.fakeEventBus.trigger.calls.reset();

      var request = this.request;
      var events = [];
      var headers = [
        { name: 'X-Header', value: 'foo' }
      ];

      this.fakeEventBus.trigger.and.callFake(function(event) {
        if (event === 'readystatechange') {
          events.push({
            readyState: request.readyState,
            status: request.status,
            statusText: request.statusText,
            responseHeaders: request.responseHeaders
          });
        }
      });

      this.request.respondWith({
        status: 200,
        statusText: 'OK',
        responseHeaders: headers
      });

      expect(this.request.readyState).toBe(4);
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
      expect(events.length).toBe(2);
      expect(events).toEqual([
        { readyState: 2, status: 200, statusText: 'OK', responseHeaders: headers },
        { readyState: 4, status: 200, statusText: 'OK', responseHeaders: headers }
      ]);
    });

    it('throws an error when timing out a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.respondWith({});
      var request = this.request;

      expect(function() {
        request.responseTimeout();
      }).toThrowError('FakeXMLHttpRequest already completed');
    });

    it('throws an error when responding to a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.respondWith({});
      var request = this.request;

      expect(function() {
        request.respondWith({});
      }).toThrowError('FakeXMLHttpRequest already completed');
    });

    it('throws an error when erroring a request that has completed', function() {
      this.request.open();
      this.request.send();
      this.request.respondWith({});
      var request = this.request;

      expect(function() {
        request.responseError({});
      }).toThrowError('FakeXMLHttpRequest already completed');
    });
  });

  it('registers on-style callback with the event bus', function() {
    this.request = new this.FakeRequest();

    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('readystatechange', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('loadstart', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('progress', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('abort', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('error', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('load', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('timeout', jasmine.any(Function));
    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('loadend', jasmine.any(Function));

    this.request.onreadystatechange = jasmine.createSpy('readystatechange');
    this.request.onloadstart = jasmine.createSpy('loadstart');
    this.request.onprogress = jasmine.createSpy('progress');
    this.request.onabort = jasmine.createSpy('abort');
    this.request.onerror = jasmine.createSpy('error');
    this.request.onload = jasmine.createSpy('load');
    this.request.ontimeout = jasmine.createSpy('timeout');
    this.request.onloadend = jasmine.createSpy('loadend');

    var args = this.fakeEventBus.addEventListener.calls.allArgs();
    for (var i = 0; i < args.length; i++) {
      var eventName = args[i][0],
          busCallback = args[i][1];

      busCallback();
      expect(this.request['on' + eventName]).toHaveBeenCalled();
    }
  });

  it('delegates addEventListener to the eventBus', function() {
    this.request = new this.FakeRequest();

    this.request.addEventListener('foo', 'bar');

    expect(this.fakeEventBus.addEventListener).toHaveBeenCalledWith('foo', 'bar');
  });

  it('delegates removeEventListener to the eventBus', function() {
    this.request = new this.FakeRequest();

    this.request.removeEventListener('foo', 'bar');

    expect(this.fakeEventBus.removeEventListener).toHaveBeenCalledWith('foo', 'bar');
  });

  describe('triggering progress events', function() {
    beforeEach(function() {
      this.request = new this.FakeRequest();
    });

    it('should not trigger any events to start', function() {
      this.request.open();

      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
    });

    it('should trigger loadstart when sent', function() {
      this.request.open();

      this.fakeEventBus.trigger.calls.reset();

      this.request.send();

      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('readystatechange');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('progress');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('abort');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('error');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('load');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('timeout');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('loadend');
    });

    it('should trigger abort, progress, loadend when aborted', function() {
      this.request.open();
      this.request.send();

      this.fakeEventBus.trigger.calls.reset();

      this.request.abort();

      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('progress');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('abort');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('error');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('load');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('timeout');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadend');
    });

    it('should trigger error, progress, loadend when network error', function() {
      this.request.open();
      this.request.send();

      this.fakeEventBus.trigger.calls.reset();

      this.request.responseError();

      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('progress');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('abort');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('error');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('load');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('timeout');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadend');
    });

    it('should trigger timeout, progress, loadend when timing out', function() {
      this.request.open();
      this.request.send();

      this.fakeEventBus.trigger.calls.reset();

      jasmine.clock().install();
      this.request.responseTimeout();
      jasmine.clock().uninstall();

      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('progress');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('abort');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('error');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('load');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('timeout');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadend');
    });

    it('should trigger load, progress, loadend when responding', function() {
      this.request.open();
      this.request.send();

      this.fakeEventBus.trigger.calls.reset();

      this.request.respondWith({ status: 200 });

      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('loadstart');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('readystatechange');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('progress');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('abort');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('error');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('load');
      expect(this.fakeEventBus.trigger).not.toHaveBeenCalledWith('timeout');
      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('loadend');
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

    request.respondWith({ status: 200 });

    expect(request.status).toBe(200);
    expect(request.statusText).toBe('');
  });

  it('has a statusText from the response', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, statusText: 'OK' });

    expect(request.status).toBe(200);
    expect(request.statusText).toBe('OK');
  });

  it('has a status from the response when there is an error', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.responseError({ status: 500 });

    expect(request.status).toBe(500);
    expect(request.statusText).toBe('');
  });

  it('has a statusText from the response when there is an error', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.responseError({ status: 500, statusText: 'Internal Server Error' });

    expect(request.status).toBe(500);
    expect(request.statusText).toBe('Internal Server Error');
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

    request.respondWith({ status: 200, responseText: 'foobar' });

    expect(request.responseText).toBe('foobar');
  });

  it('defaults responseText if none is given', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200 });

    expect(request.responseText).toBe('');
  });

  it('saves responseURL', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, responseText: 'foobar', responseURL: 'foo.bar/redirect' });

    expect(request.responseURL).toBe('foo.bar/redirect');
  });

  it('defaults responseURL if none is given', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200 });

    expect(request.responseURL).toBe(null);
  });

  it('retrieves individual response headers', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({
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

    request.respondWith({
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

    request.respondWith({
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

    request1.respondWith({ status: 200, responseHeaders: { 'X-Foo': 'bar' } });
    request2.respondWith({ status: 200, responseHeaders: { 'X-Baz': 'quux' } });

    expect(request1.getAllResponseHeaders()).toBe("X-Foo: bar\r\n");
    expect(request2.getAllResponseHeaders()).toBe("X-Baz: quux\r\n");
  });

  it('retrieves all response headers', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({
      status: 200,
      responseHeaders: [
        { name: 'X-Header-1', value: 'foo' },
        { name: 'X-Header-2', value: 'bar' },
        { name: 'X-Header-1', value: 'baz' }
      ]
    });

    expect(request.getAllResponseHeaders()).toBe("X-Header-1: foo\r\nX-Header-2: bar\r\nX-Header-1: baz\r\n");
  });

  it('sets the content-type header to the specified contentType when no other headers are supplied', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, contentType: 'text/plain' });

    expect(request.getResponseHeader('content-type')).toBe('text/plain');
    expect(request.getAllResponseHeaders()).toBe("Content-Type: text/plain\r\n");
  });

  it('sets a default content-type header if no contentType and headers are supplied', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200 });

    expect(request.getResponseHeader('content-type')).toBe('application/json');
    expect(request.getAllResponseHeaders()).toBe("Content-Type: application/json\r\n");
  });

  it('has no responseXML by default', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200 });

    expect(request.responseXML).toBeNull();
  });

  it('parses a text/xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, contentType: 'text/xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
      expect(request.response instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
      expect(request.response instanceof window.ActiveXObject).toBe(true);
    }
  });

  it('parses an application/xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, contentType: 'application/xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
      expect(request.response instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
      expect(request.response instanceof window.ActiveXObject).toBe(true);
    }
  });

  it('parses a custom blah+xml document into responseXML', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, contentType: 'application/text+xml', responseText: '<dom><stuff/></dom>' });

    if (typeof window.Document !== 'undefined') {
      expect(request.responseXML instanceof window.Document).toBe(true);
      expect(request.response instanceof window.Document).toBe(true);
    } else {
      // IE 8
      expect(request.responseXML instanceof window.ActiveXObject).toBe(true);
      expect(request.response instanceof window.ActiveXObject).toBe(true);
    }
  });

  it('stringifies responseJSON into responseText', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, responseJSON: {'foo': 'bar'} });

    expect(request.response).toEqual('{"foo":"bar"}');
  });

  it('defaults the response attribute to the responseText', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, responseText: 'foo' });

    expect(request.response).toEqual('foo');
  });

  it('has a text response when the responseType is blank', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, responseText: 'foo', responseType: '' });

    expect(request.response).toEqual('foo');
  });

  it('has a text response when the responseType is text', function() {
    var request = new this.FakeRequest();
    request.open();
    request.send();

    request.respondWith({ status: 200, responseText: 'foo', responseType: 'text' });

    expect(request.response).toEqual('foo');
  });

  describe('function response', function() {
    it('can return a response', function() {
      var request = new this.FakeRequest();
      request.open();
      request.send();

      function f(stub, request) {
        expect(stub.action).toBeUndefined();
        stub.isReturn = function() { return true; };
        stub.isError = function() { return false; };
        stub.isTimeout = function() { return false; };
        stub.isCallFunction = function() { return false; };
        stub.responseText = 'foo';
      }

      request.responseCallFunction({ functionToCall: f });

      expect(request.response).toEqual('foo');
    });

    it('can return an error', function() {
      var request = new this.FakeRequest();
      request.open();
      request.send();

      this.fakeEventBus.trigger.calls.reset();

      function f(stub, request) {
        expect(stub.action).toBeUndefined();
        stub.isReturn = function() { return false; };
        stub.isError = function() { return true; };
        stub.isTimeout = function() { return false; };
        stub.isCallFunction = function() { return false; };
      }

      request.responseCallFunction({ functionToCall: f });

      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('error');
    });

    it('can return a timeout', function() {
      var request = new this.FakeRequest();
      request.open();
      request.send();

      this.fakeEventBus.trigger.calls.reset();

      function f(stub, request) {
        expect(stub.action).toBeUndefined();
        stub.isReturn = function() { return false; };
        stub.isError = function() { return false; };
        stub.isTimeout = function() { return true; };
        stub.isCallFunction = function() { return false; };
      }

      jasmine.clock().install();
      request.responseCallFunction({ functionToCall: f });
      jasmine.clock().uninstall();

      expect(this.fakeEventBus.trigger).toHaveBeenCalledWith('timeout');
    });

    it('can chain to another function', function() {
      var request = new this.FakeRequest();
      request.open();
      request.send();

      this.fakeEventBus.trigger.calls.reset();

      var calls = 0;
      function f(stub, request) {
        expect(stub.action).toBeUndefined();
        stub.isReturn = function() { return false; };
        stub.isError = function() { return false; };
        stub.isTimeout = function() { return false; };

        ++calls;
        if (calls > 1) {
          stub.isCallFunction = function() { return false; };
        } else {
          stub.isCallFunction = function() { return true; };
        }
      }

      request.responseCallFunction({ functionToCall: f });

      expect(calls).toBe(2);
    });
  });
});
