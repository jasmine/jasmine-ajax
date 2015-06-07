describe('Event', function() {
  beforeEach(function() {
    this.eventFactory = getJasmineRequireObj().AjaxEvent();
    this.xhr = jasmine.createSpy('xhr');
  });

  it('create an event', function() {
    var event = this.eventFactory.event(this.xhr, 'readystatechange');

    expect(event.type).toBe('readystatechange');
    expect(event.currentTarget).toBe(this.xhr);
    expect(event.target).toBe(this.xhr);
    expect(event.cancelable).toBe(false);
    expect(event.bubbles).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(event.eventPhase).toBe(2);
    expect(event.timeStamp).toBeDefined();
    expect(event.isTrusted).toBe(false);
  });

  it('create a progress event', function() {
    var event = this.eventFactory.progressEvent(this.xhr, 'loadend');

    expect(event.type).toBe('loadend');
    expect(event.currentTarget).toBe(this.xhr);
    expect(event.target).toBe(this.xhr);
    expect(event.cancelable).toBe(false);
    expect(event.bubbles).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(event.eventPhase).toBe(2);
    expect(event.timeStamp).toBeDefined();
    expect(event.isTrusted).toBe(false);

    expect(event.lengthComputable).toBe(false);
    expect(event.loaded).toBe(0);
    expect(event.total).toBe(0);
  });
});