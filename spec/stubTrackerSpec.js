describe('StubTracker', function() {
  beforeEach(function() {
    var Constructor = getJasmineRequireObj().AjaxStubTracker();
    this.tracker = new Constructor();
  });

  it('finds nothing if no stubs are added', function() {
    expect(this.tracker.findStub()).toBeUndefined();
  });

  it('finds an added stub', function() {
    var stub = { matches: function() { return true; } };
    this.tracker.addStub(stub);

    expect(this.tracker.findStub()).toBe(stub);
  });

  it('skips an added stub that does not match', function() {
    var stub = { matches: function() { return false; } };
    this.tracker.addStub(stub);

    expect(this.tracker.findStub()).toBeUndefined();
  });

  it('passes url, data, and method to the stub', function() {
    var stub = { matches: jasmine.createSpy('matches') };
    this.tracker.addStub(stub);

    this.tracker.findStub('url', 'data', 'method');

    expect(stub.matches).toHaveBeenCalledWith('url', 'data', 'method');
  });

  it('can clear out all stubs', function() {
    var stub = { matches: jasmine.createSpy('matches') };
    this.tracker.addStub(stub);

    this.tracker.findStub();

    expect(stub.matches).toHaveBeenCalled();

    this.tracker.reset();
    stub.matches.calls.reset();

    this.tracker.findStub();

    expect(stub.matches).not.toHaveBeenCalled();
  });

  it('uses the most recently added stub that matches', function() {
    var stub1 = { matches: function() { return true; } };
    var stub2 = { matches: function() { return true; } };
    var stub3 = { matches: function() { return false; } };

    this.tracker.addStub(stub1);
    this.tracker.addStub(stub2);
    this.tracker.addStub(stub3);

    expect(this.tracker.findStub()).toBe(stub2);
  });
});
