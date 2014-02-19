describe("FakeGetScript", function() {
  var getScript, request;
  var uri = "http://getScript.example.com";
  var callBack = jasmine.createSpy('onSuccess');
  var testResponseText = 'This is a script';

  var TestResponses = { status: 200, responseText: testResponseText };

  beforeEach(function() {
    jasmine.Ajax.useMock();
    getScript = new FakeGetScript();
    getScript(uri, callBack);
    request = mostRecentAjaxRequest();
    request.promise(TestResponses);
  });

  describe("when a getScript call is instantiated", function() {
    it("should have a readyState of 4 (loaded)", function() {
      expect(request.readyState).toEqual(4);
    });

    it("should have a status of 200", function() {
      expect(request.status).toEqual(200);
    });

    it("should have a method of 'get'", function() {
      expect(request.method).toEqual('get');
    });

    it("should have a valid url", function() {
      expect(request.url).toEqual(uri);
    });

    it("should have an undefined username", function() {
      expect(request.username).toEqual(undefined);
    });

    it("should have an undefined password", function() {
      expect(request.password).toEqual(undefined);
    });

    it("should have a callback", function() {
      expect(callBack).toHaveBeenCalled();
    });
  });
});
