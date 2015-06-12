describe('EventBus', function() {
  beforeEach(function() {
    var event = this.event = jasmine.createSpyObj('event', [
      'preventDefault',
      'stopPropagation',
      'stopImmediatePropagation'
    ]);

    var progressEvent = this.progressEvent = jasmine.createSpyObj('progressEvent', [
      'preventDefault',
      'stopPropagation',
      'stopImmediatePropagation'
    ]);

    var eventFactory = this.eventFactory = {
      event: jasmine.createSpy('event').and.returnValue(event),
      progressEvent: jasmine.createSpy('progressEvent').and.returnValue(progressEvent)
    };

    this.xhr = jasmine.createSpy('xhr');
    this.bus = getJasmineRequireObj().AjaxEventBus(eventFactory)(this.xhr);
  });

  it('calls an event listener with event object', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('foo', callback);
    this.bus.trigger('foo');

    expect(callback).toHaveBeenCalledWith(this.progressEvent);
    expect(this.eventFactory.progressEvent).toHaveBeenCalledWith(this.xhr, 'foo');
    expect(this.eventFactory.event).not.toHaveBeenCalled();
  });

  it('calls an readystatechange listener with event object', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('readystatechange', callback);
    this.bus.trigger('readystatechange');

    expect(callback).toHaveBeenCalledWith(this.event);
    expect(this.eventFactory.event).toHaveBeenCalledWith(this.xhr, 'readystatechange');
    expect(this.eventFactory.progressEvent).not.toHaveBeenCalled();
  });

  it('only triggers callbacks for the specified event', function() {
    var fooCallback = jasmine.createSpy('foo'),
        barCallback = jasmine.createSpy('bar');

    this.bus.addEventListener('foo', fooCallback);
    this.bus.addEventListener('bar', barCallback);

    this.bus.trigger('foo');

    expect(fooCallback).toHaveBeenCalled();
    expect(barCallback).not.toHaveBeenCalled();
  });

  it('calls all the callbacks for the specified event', function() {
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('otherCallback');

    this.bus.addEventListener('foo', callback1);
    this.bus.addEventListener('foo', callback2);

    this.bus.trigger('foo');

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('works if there are no callbacks for the event', function() {
    var bus = this.bus;
    expect(function() {
      bus.trigger('notActuallyThere');
    }).not.toThrow();
  });

  it('does not call listeners that have been removed', function() {
    var callback = jasmine.createSpy('callback');

    this.bus.addEventListener('foo', callback);
    this.bus.removeEventListener('foo', callback);
    this.bus.trigger('foo');

    expect(callback).not.toHaveBeenCalled();
  });

  it('only removes the specified callback', function() {
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('otherCallback');

    this.bus.addEventListener('foo', callback1);
    this.bus.addEventListener('foo', callback2);
    this.bus.removeEventListener('foo', callback2);

    this.bus.trigger('foo');

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
