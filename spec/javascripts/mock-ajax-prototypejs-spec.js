describe("Jasmine Mock Ajax (for Prototype.js)", function() {
  var request, anotherRequest, onSuccess, onFailure, onComplete;
  var sharedContext = {};

  beforeEach(function() {
    onSuccess = jasmine.createSpy("onSuccess");
    onFailure = jasmine.createSpy("onFailure");
    onComplete = jasmine.createSpy("onComplete");
  });

  describe("when making a request", function () {
    beforeEach(function() {
      request = new Ajax.Request("example.com/someApi", {
        onSuccess: onSuccess,
        onFailure: onFailure,
        onComplete: onComplete
      });
    });

    it("should store URL and transport", function() {
      expect(request.url).toEqual("example.com/someApi");
      expect(request.transport).toBeTruthy();
    });

    it("should queue the request", function() {
      expect(ajaxRequests.length).toEqual(1);
    });

    it("should allow access to the queued request", function() {
      expect(ajaxRequests[0]).toEqual(request);
    });

    describe("and then another request", function () {
      beforeEach(function() {
        anotherRequest = new Ajax.Request("example.com/someApi", {
          onSuccess: onSuccess,
          onFailure: onFailure,
          onComplete: onComplete
        });
      });

      it("should queue the next request", function() {
        expect(ajaxRequests.length).toEqual(2);
      });

      it("should allow access to the other queued request", function() {
        expect(ajaxRequests[1]).toEqual(anotherRequest);
      });
    });

    describe("mostRecentAjaxRequest", function () {

      describe("when there is one request queued", function () {
        it("should return the request", function() {
          expect(mostRecentAjaxRequest()).toEqual(request);
        });
      });

      describe("when there is more than one request", function () {
        beforeEach(function() {
          anotherRequest = new Ajax.Request("balthazarurl", {
            onSuccess: onSuccess,
            onFailure: onFailure,
            onComplete: onComplete
          });
        });

        it("should return the most recent request", function() {
          expect(mostRecentAjaxRequest()).toEqual(anotherRequest);
        });
      });

      describe("when there are no requests", function () {
        beforeEach(function() {
          clearAjaxRequests();
        });

        it("should return null", function() {
          expect(mostRecentAjaxRequest()).toEqual(null);
        });
      });
    });

    describe("clearAjaxRequests()", function () {
      beforeEach(function() {
        clearAjaxRequests();
      });

      it("should remove all requests", function() {
        expect(ajaxRequests.length).toEqual(0);
        expect(mostRecentAjaxRequest()).toEqual(null);
      });
    });
  });

  describe("when simulating a response with request.response", function () {
    beforeEach(function() {
      request = new Ajax.Request("idontcare", {
        method: 'get',
        onSuccess: onSuccess,
        onFailure: onFailure,
        onComplete: onComplete
      });
    });

    describe("and the response is Success", function () {
      beforeEach(function() {
        var response = {status: 200, contentType: "text/html", responseText: "OK!"};
        request.response(response);
        sharedContext.responseCallback = onSuccess;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(onSuccess).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(onFailure).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(onComplete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("and the response is Failure", function () {
      beforeEach(function() {
        var response = {status: 500, contentType: "text/html", responseText: "(._){"};
        request.response(response);
        sharedContext.responseCallback = onFailure;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should not call the success handler", function() {
        expect(onSuccess).not.toHaveBeenCalled();
      });

      it("should call the failure handler", function() {
        expect(onFailure).toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(onComplete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("and the response is Success, but with JSON", function () {
      var response;
      beforeEach(function() {
        var responseObject = {status: 200, contentType: "application/json", responseText: "{'foo':'bar'}"};

        request.response(responseObject);

        sharedContext.responseCallback = onSuccess;
        sharedContext.status = responseObject.status;
        sharedContext.contentType = responseObject.contentType;
        sharedContext.responseText = responseObject.responseText;

        response = onSuccess.mostRecentCall.args[0];
        console.error(response)
      });

      it("should call the success handler", function() {
        expect(onSuccess).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(onFailure).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(onComplete).toHaveBeenCalled();
      });

      it("should return a JavaScript object", function() {
        window.response = response;
        expect(response.responseJSON).toEqual({foo: "bar"});
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

  });
});

//  describe(".response", function() {
//    it("should present responseJSON if contentType is application/json", function() {
//      request = new Ajax.Request("http://example.com/someApi", {
//        onSuccess: onSuccess,
//        onFailure: onFailure,
//        onComplete: onComplete
//      });
//
//      request.response({status: 201, contentType: "application/json", responseText: "{'foo':'bar'}"});
//      expect(onSuccess).toHaveBeenCalled();
//      var response = onSuccess.mostRecentCall.args[0];
//      expect(response.getHeader('Content-type')).toEqual("application/json");
//      expect(response.responseJSON).toEqual({foo: "bar"});
//    });
//
//    it("should default to status 200", function() {
//      request.response({contentType: "text/html", responseText: "Yay!"});
//      expect(onSuccess).toHaveBeenCalled();
//      expect(onComplete).toHaveBeenCalled();
//      var response = onSuccess.mostRecentCall.args[0];
//      expect(response.status).toEqual(200);
//    });
//
//    it("should default to contentType application/json", function() {
//      request.response({status: 200, responseText: "{'foo':'bar'}"});
//      expect(onComplete).toHaveBeenCalled();
//      var response = onComplete.mostRecentCall.args[0];
//      expect(response.getHeader('Content-type')).toEqual("application/json");
//      expect(response.responseJSON).toEqual({foo: "bar"});
//    });
//
//    it("should convert null response status to status 0", function() {
//      request.response({status: null, responseText: ""});
//      expect(onSuccess).toHaveBeenCalled();
//      expect(onComplete).toHaveBeenCalled();
//      var response = onSuccess.mostRecentCall.args[0];
//      expect(response.status).toEqual(0);
//    });
//
//    it("should accept a string", function() {
//      request.response("{'foo': 'bar'}");
//      expect(onSuccess).toHaveBeenCalled();
//      var response = onSuccess.mostRecentCall.args[0];
//      expect(response.responseText).toEqual("{'foo': 'bar'}");
//    });
//  });
//});

function sharedAjaxResponseBehavior(context) {
  describe("the response", function () {
    var response;
    beforeEach(function() {
      response = context.responseCallback.mostRecentCall.args[0];
    });

    it("should have the expected status code", function() {
      expect(response.status).toEqual(context.status);
    });

    it("should have the expected content type", function() {
      expect(response.getHeader('Content-type')).toEqual(context.contentType);
    });

    it("should have the expected response text", function() {
      expect(response.responseText).toEqual(context.responseText);
    });
  });
}

xdescribe("pockets.mock_ajax", function() {
  var request, success, failure, complete;

  beforeEach(function() {
    success = jasmine.createSpy("success");
    failure = jasmine.createSpy("failure");
    complete = jasmine.createSpy("complete");
    request = new Ajax.Request("balthazarurl", {onSuccess: success, onFailure: failure,
      onComplete: complete});
  });

  it("should store URL and transport", function() {
    expect(request.url).toEqual("balthazarurl");
    expect(request.transport).toBeTruthy();
  });

  describe("AjaxRequests", function() {
    it("should attach new AJAX requests to AjaxRequests.requests", function() {
      expect(AjaxRequests.requests.length).toEqual(1);
      expect(AjaxRequests.activeRequest()).toEqual(request);
      var request2 = new Ajax.Request("balthazarurl2", {onSuccess: success, onFailure: failure,
        onComplete: complete});
      expect(AjaxRequests.requests.length).toEqual(2);
      expect(AjaxRequests.activeRequest()).toEqual(request2);
    });

    it("should let you clear AJAX requests", function() {
      clearAjaxRequests();
      expect(AjaxRequests.requests.length).toEqual(0);
    });
  });

  describe(".response", function() {
    it("should pretend that the AJAX request returned a response with status, contentType, and responseText", function() {
      request.response({status: 201, contentType: "text/html", responseText: "You have been redirected."});
      expect(success).wasCalled();
      expect(complete).wasCalled();
      expect(failure).wasNotCalled();
      var response = success.mostRecentCall.args[0];
      expect(response.status).toEqual(201);
      expect(response.getHeader('Content-type')).toEqual("text/html");
      expect(response.responseText).toEqual("You have been redirected.");
      expect(response.responseJSON).toEqual(null);
    });

    it("should call failure for error statuses", function() {
      request.response({status: 500, contentType: "text/html", responseText: "Ar mateys."});
      expect(success).wasNotCalled();
      expect(complete).wasCalled();
      expect(failure).wasCalled();
      var response = failure.mostRecentCall.args[0];
      expect(response.status).toEqual(500);
      expect(response.getHeader('Content-type')).toEqual("text/html");
      expect(response.responseText).toEqual("Ar mateys.");
    });

    it("should present responseJSON if contentType is application/json", function() {
      request.response({status: 201, contentType: "application/json", responseText: "{'foo':'bar'}"});
      expect(success).wasCalled();
      var response = success.mostRecentCall.args[0];
      expect(response.getHeader('Content-type')).toEqual("application/json");
      expect(response.responseJSON).toEqual({foo: "bar"});
    });

    it("should default to status 200", function() {
      request.response({contentType: "text/html", responseText: "Yay!"});
      expect(success).wasCalled();
      expect(complete).wasCalled();
      var response = success.mostRecentCall.args[0];
      expect(response.status).toEqual(200);
    });

    it("should default to contentType application/json", function() {
      request.response({status: 200, responseText: "{'foo':'bar'}"});
      expect(complete).wasCalled();
      var response = complete.mostRecentCall.args[0];
      expect(response.getHeader('Content-type')).toEqual("application/json");
      expect(response.responseJSON).toEqual({foo: "bar"});
    });

    it("should convert null response status to status 0", function() {
      request.response({status: null, responseText: ""});
      expect(success).wasCalled();
      expect(complete).wasCalled();
      var response = success.mostRecentCall.args[0];
      expect(response.status).toEqual(0);
    });

    it("should accept a string", function() {
      request.response("{'foo': 'bar'}");
      expect(success).wasCalled();
      var response = success.mostRecentCall.args[0];
      expect(response.responseText).toEqual("{'foo': 'bar'}");
    });
  });
});
