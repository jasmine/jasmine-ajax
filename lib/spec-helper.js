beforeEach(function() {

  if (typeof jQuery != 'undefined') {
    spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
      var newXhr = new FakeXMLHttpRequest();
      ajaxRequests.push(newXhr);
      return newXhr;
    });
  } else {
    spyOn(Ajax, "getTransport").andCallFake(function() {
      return new FakeXMLHttpRequest();
    });
  }
  clearAjaxRequests();

});
