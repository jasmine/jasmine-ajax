describe("withMock", function() {
  var sendRequest = function(fakeGlobal) {
    var xhr = new fakeGlobal.XMLHttpRequest();

    xhr.open("GET", "http://example.com/someApi");
    xhr.send();
  };

  it("installs the mock for passed in function, and uninstalls when complete", function() {
    var xmlHttpRequest = spyOn(window, 'XMLHttpRequest').and.returnValue({open: function() {}, send: function() {}}),
      fakeGlobal = {XMLHttpRequest: xmlHttpRequest},
      mockAjax = new MockAjax(fakeGlobal);

    mockAjax.withMock(function() {
      sendRequest(fakeGlobal);
      expect(xmlHttpRequest).not.toHaveBeenCalled();
    });

    sendRequest(fakeGlobal);
    expect(xmlHttpRequest).toHaveBeenCalled();
  });

  it("properly uninstalls when the passed in function throws", function() {
    var xmlHttpRequest = spyOn(window, 'XMLHttpRequest').and.returnValue({open: function() {}, send: function() {}}),
      fakeGlobal = {XMLHttpRequest: xmlHttpRequest},
      mockAjax = new MockAjax(fakeGlobal);

    expect(function() {
      mockAjax.withMock(function() {
        throw "error"
      });
    }).toThrow("error");

    sendRequest(fakeGlobal);
    expect(xmlHttpRequest).toHaveBeenCalled();
  });
});
