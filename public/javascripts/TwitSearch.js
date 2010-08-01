var TwitSearch = function(){

  return {
    displayResults: function(tweets){

      var update_str = "";

      tweets.each(function(tweet) {
        update_str += "<li><img src='" + tweet.profile_image_url + "' alt='" + tweet.from_user + " profile image' />" +
                      "<p>" + tweet.text + "</p>" +
                      "<p class='user'>" + tweet.from_user + "</p>" +
                      "<p class='timestamp'>" + tweet.created_at + "</p>";
      });

      $("tweets").update(update_str);
    },
    searchFailure: function(response){
      console.log(response.status);
    },
    cleanup: function(){
      console.log("cleaning");
    },
    rateLimitReached: function(){
      console.log("rate limited");
    }
  }
}();
