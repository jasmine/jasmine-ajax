describe("FakeXMLHttpRequest", function() {
  var xhr;
  var xhr2;
  var mockAjax;
  beforeEach(function() {
    var realXMLHttpRequest = {someOtherProperty: 'someValue'},
        realXMLHttpRequestCtor = spyOn(window, 'XMLHttpRequest').and.returnValue(realXMLHttpRequest),
        fakeGlobal = {XMLHttpRequest: realXMLHttpRequestCtor};
    mockAjax = new MockAjax(fakeGlobal);
    mockAjax.install();
    xhr = new fakeGlobal.XMLHttpRequest();
    xhr2 = new fakeGlobal.XMLHttpRequest();
  });

  function objectKeys(obj) {
    keys = [];
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    return keys;
  }

  it("should have an initial readyState of 0 (uninitialized)", function() {
    expect(xhr.readyState).toEqual(0);
  });

  describe("when setting request headers", function() {
    beforeEach(function() {
      xhr.setRequestHeader('X-Header-1', 'one');
    });

    it("should make the request headers available", function() {
      expect(objectKeys(xhr.requestHeaders).length).toEqual(1);
      expect(xhr.requestHeaders['X-Header-1']).toEqual('one');
    });

    describe("when setting headers on another xhr object", function() {
      beforeEach(function() {
        xhr2.setRequestHeader('X-Header-2', 'two');
      });

      it("should make the only its request headers available", function() {
        expect(objectKeys(xhr2.requestHeaders).length).toEqual(1);
        expect(xhr2.requestHeaders['X-Header-2']).toEqual('two');
      });

      it("should not modify any other xhr objects", function() {
        expect(objectKeys(xhr.requestHeaders).length).toEqual(1);
        expect(xhr.requestHeaders['X-Header-1']).toEqual('one');
      });
    });
  });

  describe("when opened", function() {
    beforeEach(function() {
      spyOn(xhr, 'onreadystatechange');
      xhr.open("GET", "http://example.com");
    });

    it("should have a readyState of 1 (open)", function() {
      expect(xhr.readyState).toEqual(1);
      expect(xhr.onreadystatechange).toHaveBeenCalled();
    });

    describe("when sent", function() {
      it("should have a readyState of 2 (sent)", function() {
        xhr.onreadystatechange.calls.reset();
        xhr.send(null);
        expect(xhr.readyState).toEqual(2);
        expect(xhr.onreadystatechange).toHaveBeenCalled();
      });
    });

    describe("when a response comes in", function() {
      it("should have a readyState of 4 (loaded)", function() {
        xhr.onreadystatechange.calls.reset();
        xhr.response({status: 200});
        expect(xhr.readyState).toEqual(4);
        expect(xhr.onreadystatechange).toHaveBeenCalled();
      });
    });

    describe("when aborted", function() {
      it("should have a readyState of 0 (uninitialized)", function() {
        xhr.onreadystatechange.calls.reset();
        xhr.abort();
        expect(xhr.readyState).toEqual(0);
        expect(xhr.onreadystatechange).toHaveBeenCalled();
        expect(xhr.status).toEqual(0);
        expect(xhr.statusText).toEqual("abort");
      });
    });
  });

  describe("when opened with a username/password", function() {
    beforeEach(function() {
      xhr.open("GET", "http://example.com", true, "username", "password");
    });

    it("should store the username", function() {
      expect(xhr.username).toEqual("username");
    });

    it("should store the password", function() {
      expect(xhr.password).toEqual("password");
    });
  });

  describe("data", function() {
    beforeEach(function() {
      xhr.open("POST", "http://example.com?this=that");
    });

    it("should be an empty object if no params were sent", function() {
      xhr.send();
      expect(xhr.data()).toEqual({});
    });

    it("should return request params as a hash of arrays", function() {
      xhr.send('3+stooges=shemp&3+stooges=larry%20%26%20moe%20%26%20curly&some%3Dthing=else+entirely');
      var data = xhr.data();
      expect(data['3 stooges'].length).toEqual(2);
      expect(data['3 stooges'][0]).toEqual('shemp');
      expect(data['3 stooges'][1]).toEqual('larry & moe & curly');
      expect(data['some=thing']).toEqual(['else entirely']);
    });

    it("should parse json when the content type is appropriate", function() {
      var data = {
        foo: 'bar',
        baz: ['q', 'u', 'u', 'x'],
        nested: {
          object: {
            with: 'stuff'
          }
        }
      };

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));

      expect(xhr.data()).toEqual(data);
    });

    it("should parse json even if there are further qualifiers", function() {
      var data = {
        foo: 'bar',
        baz: ['q', 'u', 'u', 'x'],
        nested: {
          object: {
            with: 'stuff'
          }
        }
      };

      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.send(JSON.stringify(data));

      expect(xhr.data()).toEqual(data);
    });

    it("should be able to use a custom parser", function() {
      xhr.send('custom_format');
      var custom = {
        test: jasmine.createSpy('test').and.returnValue(true),
        parse: jasmine.createSpy('parse').and.returnValue('parsedFormat')
      };
      mockAjax.addCustomParamParser(custom);
      expect(xhr.data()).toBe('parsedFormat');
      expect(custom.test).toHaveBeenCalled();
      expect(custom.parse).toHaveBeenCalledWith('custom_format');
    });

    it("should clear custom parsers when uninstalled", function() {
      var custom = {
        test: jasmine.createSpy('test').and.returnValue(true),
        parse: jasmine.createSpy('parse').and.returnValue('parsedFormat')
      };
      mockAjax.addCustomParamParser(custom);
      xhr.send('custom_format');
      expect(xhr.data()).toBe('parsedFormat');

      mockAjax.uninstall();
      mockAjax.install();

      xhr.send('custom_format');
      expect(xhr.data()).toEqual({custom_format: [ 'undefined' ]});
    });
  });

  describe("contentType", function() {
    it("gets the Content-Type", function() {
      xhr.setRequestHeader('Content-Type', 'something');
      expect(xhr.contentType()).toEqual('something');
    });

    it("gets the content-type even when the casing is not to spec", function() {
      xhr.setRequestHeader('content-Type', 'some other thing');
      expect(xhr.contentType()).toEqual('some other thing');
    });
  });

  describe("when a fake XMLHttpRequest is created", function() {
    it("inherits the properties of the real XMLHttpRequest object", function() {
      expect(xhr.someOtherProperty).toBe('someValue');
    })
  })
});
