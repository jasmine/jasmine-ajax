describe("Webmock style mocking", function() {
  var successSpy, errorSpy, response, fakeGlobal, mockAjax;

  var sendRequest = function(fakeGlobal, url, method) {
    url = url || "http://example.com/someApi";
    method = method || 'GET';
    var xhr = new fakeGlobal.XMLHttpRequest();
    xhr.onreadystatechange = function(args) {
      if (this.readyState === (this.DONE || 4)) { // IE 8 doesn't support DONE
        response = this;
        successSpy();
      }
    };

    xhr.open(method, url);
    xhr.send();
  };

  beforeEach(function() {
    successSpy = jasmine.createSpy('success');
    fakeGlobal = {XMLHttpRequest: jasmine.createSpy('realXMLHttpRequest')};
    mockAjax = new window.MockAjax(fakeGlobal);
    mockAjax.install();

    mockAjax.stubRequest("http://example.com/someApi").andReturn({responseText: "hi!"});
  });

  it("allows a url to be setup as a stub", function() {
    sendRequest(fakeGlobal);
    expect(successSpy).toHaveBeenCalled();
  });

  it("should allow you to clear all the ajax stubs", function() {
    mockAjax.stubs.reset();
    sendRequest(fakeGlobal);
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("should set the contentType", function() {
    sendRequest(fakeGlobal);
    expect(response.getResponseHeader('Content-Type')).toEqual('application/json');
  });

  it("should set the responseText", function() {
    sendRequest(fakeGlobal);
    expect(response.responseText).toEqual('hi!');
  });

  it("should default the status to 200", function() {
    sendRequest(fakeGlobal);
    expect(response.status).toEqual(200);
  });

  describe("with another stub for the same url", function() {
    beforeEach(function() {
      mockAjax.stubRequest("http://example.com/someApi").andReturn({responseText: "no", status: 403});
      sendRequest(fakeGlobal);
    });

    it("should set the status", function() {
      expect(response.status).toEqual(403);
    });

    it("should allow the latest stub to win", function() {
      expect(response.responseText).toEqual('no');
    });
  });
});
