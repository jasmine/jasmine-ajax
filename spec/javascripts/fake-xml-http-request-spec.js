describe("FakeXMLHttpRequest", function() {
  var xhr;
  var xhr2;
  beforeEach(function() {
    var realXMLHttpRequest = jasmine.createSpy('realRequest'),
        fakeGlobal = {XMLHttpRequest: realXMLHttpRequest},
        mockAjax = new MockAjax(fakeGlobal);
    mockAjax.install();
    xhr = new fakeGlobal.XMLHttpRequest();
    xhr2 = new fakeGlobal.XMLHttpRequest();
  });

  it("should have an initial readyState of 0 (uninitialized)", function() {
    expect(xhr.readyState).toEqual(0);
  });

  describe("when setting request headers", function() {
    beforeEach(function() {
      xhr.setRequestHeader('X-Header-1', 'one');
    });

    it("should make the request headers available", function() {
      expect(Object.keys(xhr.requestHeaders).length).toEqual(1);
      expect(xhr.requestHeaders['X-Header-1']).toEqual('one');
    });

    describe("when setting headers on another xhr object", function() {
      beforeEach(function() {
        xhr2.setRequestHeader('X-Header-2', 'two');
      });

      it("should make the only its request headers available", function() {
        expect(Object.keys(xhr2.requestHeaders).length).toEqual(1);
        expect(xhr2.requestHeaders['X-Header-2']).toEqual('two');
      });

      it("should not modify any other xhr objects", function() {
        expect(Object.keys(xhr.requestHeaders).length).toEqual(1);
        expect(xhr.requestHeaders['X-Header-1']).toEqual('one');
      });
    });
  });

  describe("when opened", function() {
    beforeEach(function() {
      xhr.open("GET", "http://example.com");
    });
    it("should have a readyState of 1 (open)", function() {
      expect(xhr.readyState).toEqual(1);
    });

    describe("when sent", function() {
      it("should have a readyState of 2 (sent)", function() {
        xhr.send(null);
        expect(xhr.readyState).toEqual(2);
      });
    });

    describe("when a response comes in", function() {
      it("should have a readyState of 4 (loaded)", function() {
        xhr.response({status: 200});
        expect(xhr.readyState).toEqual(4);
      });
    });

    describe("when aborted", function() {
      it("should have a readyState of 0 (uninitialized)", function() {
        xhr.abort();
        expect(xhr.readyState).toEqual(0);
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

  it("can be extended", function(){
    pending("why do we want to do this?");
    FakeXMLHttpRequest.prototype.foo = function(){
      return "foo";
    };
    expect(new FakeXMLHttpRequest().foo()).toEqual("foo");
  });

  describe("data", function() {
    beforeEach(function() {
      xhr.open("POST", "http://example.com?this=that");
      xhr.send('3+stooges=shemp&3+stooges=larry%20%26%20moe%20%26%20curly&some%3Dthing=else+entirely');
    });

    it("should return request params as a hash of arrays with values sorted alphabetically", function() {
      var data = xhr.data();
      expect(data['3 stooges'].length).toEqual(2);
      expect(data['3 stooges'][0]).toEqual('larry & moe & curly');
      expect(data['3 stooges'][1]).toEqual('shemp');
      expect(data['some=thing']).toEqual(['else entirely']);
    });
  });
});
