describe("TwitterApi", function(){
  beforeEach(function(){
    twitter = new TwitterApi();

    spyOn(twitter, 'displaySearchResults');
    spyOn(twitter, 'searchComplete');
    spyOn(twitter, 'searchError');

    

    request = new Ajax.Request(twitter.base_url, {
      method: 'get',
      // is this anonymous function necessary?
      onSuccess: function(response){
        twitter.displaySearchResults(response);
      },
      onComplete: function(){
        twitter.searchComplete();
      },
      onError: function(response){
        twitter.searchError(response);
      }
    });
  });

  it("has a base url", function(){
    expect(twitter.base_url).toEqual("http://search.twitter.com/search.json")
  });

  describe("when searching Twitter is successful", function(){
    beforeEach(function(){
      request.response({status: 200, contentType: "text/json", responseText: "should be the results"});
    });

    it("calls #displaySearchResults", function(){
      // request.response({status: 200, contentType: "text/json", responseText: "should be the results"});
      expect(twitter.displaySearchResults).toHaveBeenCalled();
    });

    it("calls #searchComplete", function(){
      expect(twitter.searchComplete).toHaveBeenCalled();
    });

    it("does not call #searchError", function(){
      expect(twitter.searchError).not.toHaveBeenCalled();
    })
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
