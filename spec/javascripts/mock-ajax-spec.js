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

  it("clears requests and stubs upon uninstall", function() {
    var fakeXmlHttpRequest = jasmine.createSpy('fakeXmlHttpRequest'),
        fakeGlobal = { XMLHttpRequest: fakeXmlHttpRequest },
        mockAjax = new MockAjax(fakeGlobal);

    mockAjax.install();

    mockAjax.requests.track({url: '/testurl'});
    mockAjax.stubRequest('/bobcat');

    expect(mockAjax.requests.count()).toEqual(1);
    expect(mockAjax.stubs.findStub('/bobcat')).toBeDefined();

    mockAjax.uninstall();

    expect(mockAjax.requests.count()).toEqual(0);
    expect(mockAjax.stubs.findStub('/bobcat')).not.toBeDefined();
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
