describe("FakeXMLHttpRequest", function() {
  var xhr;
  var xhr2;
  beforeEach(function() {
    var realXMLHttpRequest = {someOtherProperty: 'someValue'},
        realXMLHttpRequestCtor = spyOn(window, 'XMLHttpRequest').and.returnValue(realXMLHttpRequest),
        fakeGlobal = {XMLHttpRequest: realXMLHttpRequestCtor},
        mockAjax = new MockAjax(fakeGlobal);
    mockAjax.install();
    xhr = new fakeGlobal.XMLHttpRequest();
    xhr2 = new fakeGlobal.XMLHttpRequest();
  });

  function objectKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    return keys;
  }

  it("should have an initial readyState of 0 (uninitialized)", function() {
    expect(xhr.readyState).toEqual(0);
  });

  it("should throw if attempt to set a header", function() {
    expect(function() { xhr.setRequestHeader('X-Header-1', 'one'); }).toThrow();
  });

  describe("when setting request headers", function() {
    beforeEach(function() {
      xhr.open("GET", "http://example.com");
      xhr.setRequestHeader('X-Header-1', 'one');
    });

    it("should make the request headers available", function() {
      expect(objectKeys(xhr.requestHeaders).length).toEqual(1);
      expect(xhr._getRequestHeader('X-Header-1')).toEqual('one');
    });

    describe("when setting headers on another xhr object", function() {
      beforeEach(function() {
        xhr2.open("GET", "http://example2.com");
        xhr2.setRequestHeader('X-Header-2', 'two');
      });

      it("should make the only its request headers available", function() {
        expect(objectKeys(xhr2.requestHeaders).length).toEqual(1);
        expect(xhr2._getRequestHeader('X-Header-2')).toEqual('two');
      });

      it("should not modify any other xhr objects", function() {
        expect(objectKeys(xhr.requestHeaders).length).toEqual(1);
        expect(xhr._getRequestHeader('X-Header-1')).toEqual('one');
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
      xhr.send('3+stooges=shemp&3+stooges=larry%20%26%20moe%20%26%20curly&some%3Dthing=else+entirely');
    });

    it("should return request params as a hash of arrays", function() {
      var data = xhr.data();
      expect(data['3 stooges'].length).toEqual(2);
      expect(data['3 stooges'][0]).toEqual('shemp');
      expect(data['3 stooges'][1]).toEqual('larry & moe & curly');
      expect(data['some=thing']).toEqual(['else entirely']);
    });
  });

  describe("when a fake XMLHttpRequest is created", function() {
    it("inherits the properties of the real XMLHttpRequest object", function() {
      expect(xhr.someOtherProperty).toBe('someValue');
    })
  })
});
