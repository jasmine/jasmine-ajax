describe("Jasmine Mock Ajax (for toplevel)", function() {
  var request, anotherRequest, response;
  var success, error, complete;
  var client, onreadystatechange;
  var sharedContext = {};
  var fakeGlobal, mockAjax;

  beforeEach(function() {
    var fakeXMLHttpRequest = jasmine.createSpy('realFakeXMLHttpRequest');
    fakeGlobal = {XMLHttpRequest: fakeXMLHttpRequest};
    mockAjax = new MockAjax(fakeGlobal);
    mockAjax.install();

    success = jasmine.createSpy("onSuccess");
    error = jasmine.createSpy("onFailure");
    complete = jasmine.createSpy("onComplete");

    onreadystatechange = function() {
      if (this.readyState == this.DONE) {
        if (this.status == 200) {
          if (this.responseHeaders['Content-type'] === 'application/json') {
            this.response = JSON.parse(this.responseText);
          } else {
            this.response = this.responseText;
          }
          success(this.response, this.textStatus, this);
        } else {
          error(this, this.textStatus, '');
        }

        complete(this, this.textStatus);
      }
    };
  });

  describe("when making a request", function () {
    beforeEach(function() {
      client = new fakeGlobal.XMLHttpRequest();
      client.onreadystatechange = onreadystatechange;
      client.open("GET", "example.com/someApi");
      client.send();
      request = mockAjax.requests.mostRecent();
    });

    it("should store URL and transport", function() {
      expect(request.url).toEqual("example.com/someApi");
    });

    it("should queue the request", function() {
      expect(mockAjax.requests.count()).toEqual(1);
    });

    it("should allow access to the queued request", function() {
      expect(mockAjax.requests.first()).toEqual(request);
    });

    it("should allow access to the queued request via index", function() {
      expect(mockAjax.requests.at(0)).toEqual(request);
    });

    describe("and then another request", function () {
      beforeEach(function() {
        client = new fakeGlobal.XMLHttpRequest();
        client.onreadystatechange = onreadystatechange;
        client.open("GET", "example.com/someApi");
        client.send();

        anotherRequest = mockAjax.requests.mostRecent();
      });

      it("should queue the next request", function() {
        expect(mockAjax.requests.count()).toEqual(2);
      });

      it("should allow access to the other queued request", function() {
        expect(mockAjax.requests.first()).toEqual(request);
        expect(mockAjax.requests.mostRecent()).toEqual(anotherRequest);
      });
    });

    describe("mockAjax.requests.mostRecent()", function () {

      describe("when there is one request queued", function () {
        it("should return the request", function() {
          expect(mockAjax.requests.mostRecent()).toEqual(request);
        });
      });

      describe("when there is more than one request", function () {
        beforeEach(function() {
          client = new fakeGlobal.XMLHttpRequest();
          client.onreadystatechange = onreadystatechange;
          client.open("GET", "example.com/someApi");
          client.send();
          anotherRequest = mockAjax.requests.mostRecent();
        });

        it("should return the most recent request", function() {
          expect(mockAjax.requests.mostRecent()).toEqual(anotherRequest);
        });
      });

      describe("when there are no requests", function () {
        beforeEach(function() {
          mockAjax.requests.reset();
        });

        it("should return null", function() {
          expect(mockAjax.requests.mostRecent()).toBeUndefined();
        });
      });
    });

    describe("clearAjaxRequests()", function () {
      beforeEach(function() {
        mockAjax.requests.reset();
      });

      it("should remove all requests", function() {
        expect(mockAjax.requests.count()).toEqual(0);
        expect(mockAjax.requests.mostRecent()).toBeUndefined();
      });
    });
  });

  describe("when simulating a response with request.response", function () {
    describe("and the response is Success", function () {
      beforeEach(function() {
        client = new fakeGlobal.XMLHttpRequest();
        client.onreadystatechange = onreadystatechange;
        client.open("GET", "example.com/someApi");
        client.setRequestHeader("Content-Type", "text/plain")
        client.send();

        request = mockAjax.requests.mostRecent();
        response = {status: 200, contentType: "text/html", responseText: "OK!"};
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

      sharedAjaxResponseBehaviorForZepto_Success(sharedContext);
    });

    describe("and the response is Success, but with JSON", function () {
      beforeEach(function() {
        client = new fakeGlobal.XMLHttpRequest();
        client.onreadystatechange = onreadystatechange;
        client.open("GET", "example.com/someApi");
        client.setRequestHeader("Content-Type", "application/json")
        client.send();

        request = mockAjax.requests.mostRecent();
        var responseObject = {status: 200, contentType: "application/json", responseText: '{"foo":"bar"}'};

        request.response(responseObject);

        sharedContext.responseCallback = success;
        sharedContext.status = responseObject.status;
        sharedContext.contentType = responseObject.contentType;
        sharedContext.responseText = responseObject.responseText;

        response = success.calls.mostRecent().args[2];
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
        expect(success.calls.mostRecent().args[0]).toEqual({foo: "bar"});
      });

      sharedAjaxResponseBehaviorForZepto_Success(sharedContext);
    });

    describe("the content type defaults to application/json", function () {
      beforeEach(function() {
        client = new fakeGlobal.XMLHttpRequest();
        client.onreadystatechange = onreadystatechange;
        client.open("GET", "example.com/someApi");
        client.setRequestHeader("Content-Type", "application/json")
        client.send();

        request = mockAjax.requests.mostRecent();
        response = {status: 200, responseText: '{"foo": "valid JSON, dammit."}'};
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

      sharedAjaxResponseBehaviorForZepto_Success(sharedContext);
    });

    describe("and the status/response code is 0", function () {
      beforeEach(function() {
        client = new fakeGlobal.XMLHttpRequest();
        client.onreadystatechange = onreadystatechange;
        client.open("GET", "example.com/someApi");
        client.setRequestHeader("Content-Type", "text/plain")
        client.send();

        request = mockAjax.requests.mostRecent();
        response = {status: 0, responseText: '{"foo": "whoops!"}'};
        request.response(response);

        sharedContext.responseCallback = error;
        sharedContext.status = 0;
        sharedContext.contentType = 'application/json';
        sharedContext.responseText = response.responseText;
      });

      it("should call the success handler", function() {
        expect(success).not.toHaveBeenCalled();
      });

      it("should not call the failure handler", function() {
        expect(error).toHaveBeenCalled();
      });

      it("should call the complete handler", function() {
        expect(complete).toHaveBeenCalled();
      });

      sharedAjaxResponseBehaviorForZepto_Failure(sharedContext);
    });
  });

  describe("and the response is error", function () {
    beforeEach(function() {
      client = new fakeGlobal.XMLHttpRequest();
      client.onreadystatechange = onreadystatechange;
      client.open("GET", "example.com/someApi");
      client.setRequestHeader("Content-Type", "text/plain")
      client.send();

      request = mockAjax.requests.mostRecent();
      response = {status: 500, contentType: "text/html", responseText: "(._){"};
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

    sharedAjaxResponseBehaviorForZepto_Failure(sharedContext);
  });

  describe('when simulating a response with request.responseTimeout', function() {
    beforeEach(function() {
      clock.install();

      client = new fakeGlobal.XMLHttpRequest();
      client.onreadystatechange = onreadystatechange;
      client.open("GET", "example.com/someApi");
      client.setRequestHeader("Content-Type", "text/plain")
      client.send();

      request = mockAjax.requests.mostRecent();
      response = {contentType: "text/html", responseText: "(._){"};
      request.responseTimeout(response);

      sharedContext.responseCallback = error;
      sharedContext.status = response.status;
      sharedContext.contentType = response.contentType;
      sharedContext.responseText = response.responseText;
    });

    afterEach(function() {
      clock.uninstall();
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
  });
});


function sharedAjaxResponseBehaviorForZepto_Success(context) {
  describe("the success response", function () {
    var xhr;
    beforeEach(function() {
      xhr = context.responseCallback.calls.mostRecent().args[2];
    });

    it("should have the expected status code", function() {
      expect(xhr.status).toEqual(context.status);
    });

    it("should have the expected content type", function() {
      expect(xhr.getResponseHeader('Content-type')).toEqual(context.contentType);
    });

    it("should have the expected response text", function() {
      expect(xhr.responseText).toEqual(context.responseText);
    });
  });
}

function sharedAjaxResponseBehaviorForZepto_Failure(context) {
  describe("the failure response", function () {
    var xhr;
    beforeEach(function() {
      xhr = context.responseCallback.calls.mostRecent().args[0];
    });

    it("should have the expected status code", function() {
      expect(xhr.status).toEqual(context.status);
    });

    it("should have the expected content type", function() {
      expect(xhr.getResponseHeader('Content-type')).toEqual(context.contentType);
    });

    it("should have the expected response text", function() {
      expect(xhr.responseText).toEqual(context.responseText);
    });
  });
}
