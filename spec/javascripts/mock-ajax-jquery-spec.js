describe("Jasmine Mock Ajax (for jQuery)", function() {
  var request, anotherRequest, success, error, complete;
  var sharedContext = {};

  beforeEach(function() {
    success = jasmine.createSpy("onSuccess");
    error = jasmine.createSpy("onFailure");
    complete = jasmine.createSpy("onComplete");
  });

  describe("when making a request", function () {
    beforeEach(function() {
      request = jQuery.ajax({
        url: "example.com/someApi",
        type: "GET",
        success: success,
        complete: complete,
        error: error
      });
    });

    it("should store URL and transport", function() {
      expect(request.url).toEqual("example.com/someApi");
    });

    it("should queue the request", function() {
      expect(ajaxRequests.length).toEqual(1);
    });

    it("should allow access to the queued request", function() {
      expect(ajaxRequests[0]).toEqual(request);
    });

    describe("and then another request", function () {
      beforeEach(function() {
        anotherRequest = jQuery.ajax({
          url: "example.com/someApi",
          type: "GET",
          success: success,
          complete: complete,
          error: error
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
          anotherRequest = jQuery.ajax({
            url: "example.com/someApi",
            type: "GET",
            success: success,
            complete: complete,
            error: error
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

  xdescribe("when simulating a response with request.response", function () {
    beforeEach(function() {
      request = new Ajax.Request("idontcare", {
        method: 'get',
        onSuccess: success,
        onFailure: error,
        onComplete: complete
      });
    });

    describe("and the response is Success", function () {
      beforeEach(function() {
        var response = {status: 200, contentType: "text/html", responseText: "OK!"};
        request.response(response);
        sharedContext.responseCallback = success;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(error).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("and the response is Failure", function () {
      beforeEach(function() {
        var response = {status: 500, contentType: "text/html", responseText: "(._){"};
        request.response(response);
        sharedContext.responseCallback = error;
        sharedContext.status = response.status;
        sharedContext.contentType = response.contentType;
        sharedContext.responseText = response.responseText;
      });

      it("should not call the success handler", function() {
        expect(success).not.toHaveBeenCalled();
      });

      it("should call the failure handler", function() {
        expect(error).toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("and the response is Success, but with JSON", function () {
      var response;
      beforeEach(function() {
        var responseObject = {status: 200, contentType: "application/json", responseText: "{'foo':'bar'}"};

        request.response(responseObject);

        sharedContext.responseCallback = success;
        sharedContext.status = responseObject.status;
        sharedContext.contentType = responseObject.contentType;
        sharedContext.responseText = responseObject.responseText;

        response = success.mostRecentCall.args[0];
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(error).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      it("should return a JavaScript object", function() {
        window.response = response;
        expect(response.responseJSON).toEqual({foo: "bar"});
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("the content type defaults to application/json", function () {
      beforeEach(function() {
        var response = {status: 200, responseText: "OK!"};
        request.response(response);

        sharedContext.responseCallback = success;
        sharedContext.status = response.status;
        sharedContext.contentType = "application/json";
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(error).not.toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });

    describe("and the response is null", function () {
      beforeEach(function() {

        request = jQuery.ajax({
          url: "example.com/someApi",
          type: "GET",
          success: success,
          complete: complete,
          error: error
        });

        var response = {status: null, responseText: "whoops!"};
        request.response(response);

        sharedContext.responseCallback = on0;
        sharedContext.status = 0;
        sharedContext.contentType = 'application/json';
        sharedContext.responseText = response.responseText;
      });

      it("should not call the success handler", function() {
        expect(success).not.toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(error).not.toHaveBeenCalled();
      });

      it("should call the on0 handler", function() {
        expect(on0).toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehavior(sharedContext);
    });
  });
});

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
