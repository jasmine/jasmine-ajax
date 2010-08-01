function TwitterApi () {
  this.base_url = "http://search.twitter.com/search.json"
}

TwitterApi.prototype.search = function(query, callbacks) {
  new Ajax.Request(this.base_url, {
    method: 'get',
    parameters: {
      q: query
    },

    onSuccess: function(response){
      var tweets = [];
      response.responseJSON.results.each(function(result){
        tweets.push(new Tweet(result));
      });

      callbacks.onSuccess(tweets);
    },
    onFailure:  callbacks.onFailure,
    onComplete: callbacks.onComplete,
    on403:      callbacks.onRateLimit,
    on503:      callbacks.onFailWhale
  });
}
