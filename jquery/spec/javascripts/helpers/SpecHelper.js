var xhrs, xhrSpy; // xhr_helper.js

beforeEach(function() {
  window.location.hash = "";
  $('#jasmine_content').empty();
  $('#jasmine_content').html('<div id="store"></div><div id="overlay_spinner"></div>');

  // jquery 1.3.x for Ajax
  jasmine.Clock.useMock();
  // delete window.store;
  // window.store = new Store();

  spyOn($, 'ajax').andCallThrough();

  xhrs = [];
  xhrSpy = spyOn(jQuery.ajaxSettings, 'xhr');
  xhrSpy.andCallFake(function() {
    var newXhr = stubXhr();
    xhrs.push(newXhr);
    return newXhr;
  });
});
