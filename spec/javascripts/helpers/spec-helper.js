beforeEach(function() {
   clearAjaxRequests();
   spyOn(Ajax, "getTransport").andCallFake(function() {
     return new FakeAjaxTransport();
   });
});
