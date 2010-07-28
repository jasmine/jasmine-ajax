describe("TwitterApi#search", function(){
  var twitter, request;
  var onSuccess, onFailure, onComplete, onRateLimit;

  beforeEach(function(){
    onSuccess = jasmine.createSpy('onSuccess');
    onFailure = jasmine.createSpy('onFailure');
    onComplete = jasmine.createSpy('onComplete');
    onRateLimit = jasmine.createSpy('onRateLimit');

    twitter = new TwitterApi();

    twitter.search('basketball', {
      onSuccess: onSuccess,
      onFailure: onFailure,
      onComplete: onComplete,
      onRateLimit: onRateLimit
    });

    request = AjaxRequests.activeRequest();
  });

  it("calls Twitter with the correct url", function(){
    expect(request.url).toEqual("http://search.twitter.com/search.json?q=basketball")
  });

  describe("on success", function(){
    beforeEach(function(){
      request.response(TestResponses.search.success);
    });

    it("calls onSuccess", function(){
      expect(onSuccess).toHaveBeenCalled();
    });

    it("calls onComplete", function(){
      expect(onComplete).toHaveBeenCalled();
    });

    it("does not call onFailure", function(){
      expect(onFailure).not.toHaveBeenCalled();
    })
  });

  describe('on failure', function(){
    beforeEach(function(){
      request.response(TestResponses.search.failure);
    });

    it("calls onFailure", function() {
      expect(onFailure).toHaveBeenCalled();
    });

    it("call onComplete", function(){
      expect(onComplete).toHaveBeenCalled();
    });

    it("does not call onSuccess", function(){
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("on rate limit", function(){
    beforeEach(function(){
      request.response(TestResponses.search.rateLimitReached);
    });

    it("calls onRateLimit", function(){
      expect(onRateLimit).toHaveBeenCalled();
    });

    it("does not call onSuccess", function(){
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("calls onComplete", function(){
      expect(onComplete).toHaveBeenCalled();
    });
  });
});