describe("Webmock style mocking", function() {
  var successSpy, errorSpy, response;

  var sendRequest = function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(arguments) {
      if (this.readyState == this.DONE) {
        response = this;
      }
    };

    xhr.open("GET", "http://example.com/someApi");
    xhr.send();
  };

  beforeEach(function() {
    jasmine.Ajax.useMock();
    jasmine.Ajax.stubRequest("http://example.com/someApi").andReturn({responseText: "hi!"});

    sendRequest();
  });

  afterEach(function() {
    clearAjaxStubs();
  });

  it("should allow you to clear all the ajax stubs", function() {
    expect(ajaxStubs.length).toEqual(1);
    clearAjaxStubs();
    expect(ajaxStubs.length).toEqual(0);
  });

  it("should push the new stub on the ajaxStubs", function() {
    expect(ajaxStubs.length).toEqual(1);
  });

  it("should set the url in the stub", function() {
    expect(ajaxStubs[0].url).toEqual("http://example.com/someApi");
  });

  it("should set the contentType", function() {
    expect(response.responseHeaders['Content-type']).toEqual('application/json');
  });

  it("should set the responseText", function() {
    expect(response.responseText).toEqual('hi!');
  });

  it("should default the status to 200", function() {
    expect(response.status).toEqual(200);
  });

  describe("with another stub for the same url", function() {
    beforeEach(function() {
      jasmine.Ajax.stubRequest("http://example.com/someApi").andReturn({responseText: "no", status: 403});
      sendRequest();
    });

    it("should set the status", function() {
      expect(response.status).toEqual(403);
    });

    it("should allow the latest stub to win", function() {
      expect(response.responseText).toEqual('no');
    });
  });

  describe(".matchStub", function() {
    it("should be able to find a stub with an exact match", function() {
      var stub = jasmine.Ajax.matchStub("http://example.com/someApi");

      expect(stub).toBeDefined();
    });
  });
});
