describe("Webmock style mocking", function() {
  var successSpy, errorSpy, response;

  beforeEach(function() {
    jasmine.Ajax.useMock();

    jasmine.Ajax.stubRequest("http://example.com/someApi").andReturn({reponseText: "hi!"});


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(arguments) {
      if (this.readyState == this.DONE) {
        response = this;
      }
    };

    xhr.open("GET", "http://example.com/someApi");
    xhr.send();
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
    console.log(response);
    expect(response.responseText).toEqual('hi!');
  });

  it("should be able to mock url requests", function() {
  });

  describe(".matchStub", function() {
    it("should be able to find a stub with an exact match", function() {
      var stub = jasmine.Ajax.matchStub("http://example.com/someApi");

      expect(stub).toBeDefined();
    });
  });
});
