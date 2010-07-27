describe("TwitterAPI", function(){
  beforeEach(function(){
    twitterApi = new TwitterAPI();
  });

  it("should have a base url", function(){
    expect(twitterApi.BASE_URL).toEqual("http://search.twitter.com/search.json");
  })
});