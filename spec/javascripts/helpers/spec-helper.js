jQuery.noConflict();

beforeEach(function() {
  clearAjaxRequests();

  spyOn(Ajax, "getTransport").andCallFake(function() {
    return new FakeAjaxTransport();
  });

  spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
    var newXhr = stubXhr();
    ajaxRequests.push(newXhr);
    return newXhr;
  });
});
