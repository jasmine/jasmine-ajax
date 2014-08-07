describe('RequestTracker', function() {
  beforeEach(function() {
    var Constructor = getJasmineRequireObj().AjaxRequestTracker();
    this.tracker = new Constructor();
  });

  it('tracks the number of times ajax requests are made', function() {
    expect(this.tracker.count()).toBe(0);

    this.tracker.track();

    expect(this.tracker.count()).toBe(1);
  });

  it('simplifies access to the last (most recent) request', function() {
    this.tracker.track();
    this.tracker.track('request');

    expect(this.tracker.mostRecent()).toEqual('request');
  });

  it('returns a useful falsy value when there is no last (most recent) request', function() {
    expect(this.tracker.mostRecent()).toBeFalsy();
  });

  it('simplifies access to the first (oldest) request', function() {
    this.tracker.track('request');
    this.tracker.track();

    expect(this.tracker.first()).toEqual('request');
  });

  it('returns a useful falsy value when there is no first (oldest) request', function() {
    expect(this.tracker.first()).toBeFalsy();
  });

  it('allows the requests list to be reset', function() {
    this.tracker.track();
    this.tracker.track();

    expect(this.tracker.count()).toBe(2);

    this.tracker.reset();

    expect(this.tracker.count()).toBe(0);
  });

  it('allows retrieval of an arbitrary request by index', function() {
    this.tracker.track('1');
    this.tracker.track('2');
    this.tracker.track('3');

    expect(this.tracker.at(1)).toEqual('2');
  });

  it('allows retrieval of all requests that are for a given url', function() {
    this.tracker.track({ url: 'foo' });
    this.tracker.track({ url: 'bar' });

    expect(this.tracker.filter('bar')).toEqual([{ url: 'bar' }]);
  });

  it('allows retrieval of all requests that match a given RegExp', function() {
    this.tracker.track({ url: 'foo' });
    this.tracker.track({ url: 'bar' });
    this.tracker.track({ url: 'baz' });

    expect(this.tracker.filter(/ba[rz]/)).toEqual([{ url: 'bar' }, { url: 'baz' }]);
  });

  it('allows retrieval of all requests that match based on a function', function() {
    this.tracker.track({ url: 'foo' });
    this.tracker.track({ url: 'bar' });
    this.tracker.track({ url: 'baz' });

    var func = function(request) {
      return request.url === 'bar';
    };

    expect(this.tracker.filter(func)).toEqual([{ url: 'bar' }]);
  });

  it('filters to nothing if no requests have been tracked', function() {
    expect(this.tracker.filter('foo')).toEqual([]);
  });
});
