describe("FakeGetJSON", function() {
  var getJSON, request;
  var uri = "http://example.com";
  var data = "name=brian&project=fake-json";
  var expectedData = { name : [ 'brian' ], project : [ 'fake-json' ] };
  var callBack = jasmine.createSpy('onSuccess');
  var testResponseText = '{hello: "world"}';

  var TestResponses = { status: 200, responseText: testResponseText };

  beforeEach(function() {
    jasmine.Ajax.useMock();
    getJSON = new FakeGetJSON();
    getJSON(uri, data, callBack);
    request = mostRecentAjaxRequest();
    request.promise(TestResponses);
  });

  describe("when a getJSON call is instantiated", function() {
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

    it("should have valid data", function() {
      expect(request.data()).toEqual(expectedData);
    });

    it("should have an undefined username", function() {
      expect(request.username).toEqual(undefined);
    });

    it("should have an undefined password", function() {
      expect(request.password).toEqual(undefined);
    });

    it("should have a valid data", function() {
      expect(request.responseText).toEqual(testResponseText);
    });

    it("should have a callback", function() {
      expect(callBack).toHaveBeenCalled();
    });
  });
});
