describe("mockAjax", function() {
  it("does not replace XMLHttpRequest until it is installed", function() {
    var fakeXmlHttpRequest = jasmine.createSpy('fakeXmlHttpRequest'),
        fakeGlobal = { XMLHttpRequest: fakeXmlHttpRequest },
        mockAjax = new MockAjax(fakeGlobal);

    fakeGlobal.XMLHttpRequest('foo');
    expect(fakeXmlHttpRequest).toHaveBeenCalledWith('foo');
    fakeXmlHttpRequest.calls.reset();

    mockAjax.install();
    fakeGlobal.XMLHttpRequest('foo');
    expect(fakeXmlHttpRequest).not.toHaveBeenCalled();
  });

  it("replaces the global XMLHttpRequest on uninstall", function() {
    var fakeXmlHttpRequest = jasmine.createSpy('fakeXmlHttpRequest'),
        fakeGlobal = { XMLHttpRequest: fakeXmlHttpRequest },
        mockAjax = new MockAjax(fakeGlobal);

    mockAjax.install();
    mockAjax.uninstall();

    fakeGlobal.XMLHttpRequest('foo');
    expect(fakeXmlHttpRequest).toHaveBeenCalledWith('foo');
  });

  it("allows the httpRequest to be retrieved", function() {
    var fakeXmlHttpRequest = jasmine.createSpy('fakeXmlHttpRequest'),
        fakeGlobal = { XMLHttpRequest: fakeXmlHttpRequest },
        mockAjax = new MockAjax(fakeGlobal);

    mockAjax.install();
    var request = new fakeGlobal.XMLHttpRequest();

    expect(mockAjax.requests.count()).toBe(1);
    expect(mockAjax.requests.mostRecent()).toBe(request);
  });

  it("allows the httpRequests to be cleared", function() {
    var fakeXmlHttpRequest = jasmine.createSpy('fakeXmlHttpRequest'),
        fakeGlobal = { XMLHttpRequest: fakeXmlHttpRequest },
        mockAjax = new MockAjax(fakeGlobal);

    mockAjax.install();
    var request = new fakeGlobal.XMLHttpRequest();

    expect(mockAjax.requests.mostRecent()).toBe(request);
    mockAjax.requests.reset();
    expect(mockAjax.requests.count()).toBe(0);
  });
});
