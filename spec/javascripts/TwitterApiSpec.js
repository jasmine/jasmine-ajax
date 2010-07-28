describe("TwitterApi#search", function(){
  var twitter, request;
  var onSuccess, onFailure, onComplete;

  beforeEach(function(){
    onSuccess = jasmine.createSpy('onSuccess');
    onFailure = jasmine.createSpy('onFailure');
    onComplete = jasmine.createSpy('onComplete');

    twitter = new TwitterApi();

    twitter.search('basketball', {
      onSuccess: onSuccess,
      onFailure: onFailure,
      onComplete: onComplete
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
    
    it("calls #searchComplete", function(){
      expect(twitter.searchComplete).toHaveBeenCalled();
    });

    it("does not call #searchError", function(){
      expect(twitter.searchError).not.toHaveBeenCalled();
    })
  });

  describe('onFailure', function(){
    
  });
  // beforeEach(function(){
  //   twitter = new TwitterApi();
  // 
  //   spyOn(twitter, 'displaySearchResults');
  // 
  //   request = new Ajax.Request(twitter.BASE_URL, {
  //     onSuccess: function(response) {
  //       twitter.displaySearchResults(response);
  //     }
  //   });
  // 
  // });
  // 
  // it("should work", function(){
  //   request.response({status: 200, contentType: "text/json", responseText: "should be the results"});
  //   // expect(twitter.displaySearchResults).not.toHaveBeenCalled();
  //   // fails, but gives me the message "Expected spy displaySearchResults to have been called."
  //   expect(twitter.displaySearchResults).toHaveBeenCalled();
  // });
});

// describe("TwitterApi", function(){
//   beforeEach(function(){
//     twitter = new TwitterAPI();
//     request = new Ajax.Request(twitter.BASE_URL, {
//       // is this necessary?
//       onSuccess: function() {
//         // twitter.displaySearchResults(response)
//         alert("Sup");
//     });
// 
//     // spyOn(twitter, 'displaySearchResults');
//   });
// 
//   it("calls displaySearchResults on successful requests", function(){
//     sdfsdfsd
//     // request.response({status: 200, contentType: "text/json", responseText: "should be the results"});
//     // expect(twitter.displaySearchResults).toHaveBeenCalled();
//   });
// });
