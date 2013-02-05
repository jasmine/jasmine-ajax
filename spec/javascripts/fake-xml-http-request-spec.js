describe("FakeXMLHttpRequest", function() {
  var xhr;
  beforeEach(function() {
    xhr = new FakeXMLHttpRequest();
  });
  it("should have an initial readyState of 0 (uninitialized)", function() {
    expect(xhr.readyState).toEqual(0);
  });

  describe("when opened", function() {
    beforeEach(function() {
      spyOn(xhr, "onreadystatechange");
      xhr.open("GET", "http://example.com");
    });
    it("should have a readyState of 1 (open)", function() {
      expect(xhr.readyState).toEqual(1);
    });
    it("should call the onreadystatechange callback", function() {
       expect(xhr.onreadystatechange).toHaveBeenCalled();
    });

    describe("when sent", function() {
      beforeEach(function() {
        xhr.send(null);
      });
      it("should have a readyState of 2 (sent)", function() {
        expect(xhr.readyState).toEqual(2);
      });
      it("should call the onreadystatechange callback", function() {
        expect(xhr.onreadystatechange.callCount).toBe(2);
      });
    });

    describe("when a response comes in", function() {
      beforeEach(function() {
        xhr.response({status: 200});
      });
      it("should have a readyState of 4 (loaded)", function() {
        expect(xhr.readyState).toEqual(4);
      });
      it("should call the onreadystatechange callback", function() {
        expect(xhr.onreadystatechange.callCount).toBe(2);
      });
    });

    describe("when aborted", function() {
      beforeEach(function() {
        xhr.abort();
      });
      it("should have a readyState of 0 (uninitialized)", function() {
        expect(xhr.readyState).toEqual(0);
      });
      it("should call the onreadystatechange callback", function() {
        expect(xhr.onreadystatechange.callCount).toBe(2);
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
