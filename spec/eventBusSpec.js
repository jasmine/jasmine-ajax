describe('EventBus', function() {
  beforeEach(function() {
    this.bus = getJasmineRequireObj().AjaxEventBus()();
    this.xhr = jasmine.createSpy('xhr');
  });

  it('calls an event listener', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('foo', callback);
    this.bus.trigger(this.xhr, 'foo');

    expect(callback).toHaveBeenCalled();
  });

  it('calls an event listener with additional arguments', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('foo', callback);
    this.bus.trigger(this.xhr, 'foo', 'bar');

    expect(callback).toHaveBeenCalledWith('bar');
  });

  it('only triggers callbacks for the specified event', function() {
    var fooCallback = jasmine.createSpy('foo'),
        barCallback = jasmine.createSpy('bar');

    this.bus.addEventListener('foo', fooCallback);
    this.bus.addEventListener('bar', barCallback);

    this.bus.trigger(this.xhr, 'foo');

    expect(fooCallback).toHaveBeenCalled();
    expect(barCallback).not.toHaveBeenCalled();
  });

  it('calls all the callbacks for the specified event', function() {
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('otherCallback');

    this.bus.addEventListener('foo', callback1);
    this.bus.addEventListener('foo', callback2);

    this.bus.trigger(this.xhr, 'foo');

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('works if there are no callbacks for the event', function() {
    var bus = this.bus;
    expect(function() {
      bus.trigger(this.xhr, 'notActuallyThere');
    }).not.toThrow();
  });

  it('does not call listeners that have been removed', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('foo', callback);
    this.bus.removeEventListener('foo', callback);
    this.bus.trigger(this.xhr, 'foo');

    expect(callback).not.toHaveBeenCalled();
  });

  it('only removes the specified callback', function() {
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('otherCallback');

    this.bus.addEventListener('foo', callback1);
    this.bus.addEventListener('foo', callback2);
    this.bus.removeEventListener('foo', callback2);

    this.bus.trigger(this.xhr, 'foo');

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});