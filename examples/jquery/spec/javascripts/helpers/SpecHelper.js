jQuery.noConflict();

beforeEach(function() {
  clearAjaxRequests();

  spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
	
    var newXhr = new FakeXMLHttpRequest();
    ajaxRequests.push(newXhr);
    return newXhr;
  });
});
