getJasmineRequireObj().AjaxEvent = function() {
  function now() {
    return new Date().getTime();
  }

  function noop() {
  }

  // Event object
  // https://dom.spec.whatwg.org/#concept-event
  function XMLHttpRequestEvent(xhr, type) {
    this.type = type;
    this.bubbles = false;
    this.cancelable = false;
    this.timeStamp = now();

    this.isTrusted = false;
    this.defaultPrevented = false;

    // Event phase should be "AT_TARGET"
    // https://dom.spec.whatwg.org/#dom-event-at_target
    this.eventPhase = 2;

    this.target = xhr;
    this.currentTarget = xhr;
  }

  XMLHttpRequestEvent.prototype.preventDefault = noop;
  XMLHttpRequestEvent.prototype.stopPropagation = noop;
  XMLHttpRequestEvent.prototype.stopImmediatePropagation = noop;

  function XMLHttpRequestProgressEvent() {
    XMLHttpRequestEvent.apply(this, arguments);

    this.lengthComputable = false;
    this.loaded = 0;
    this.total = 0;
  }

  // Extend prototype
  XMLHttpRequestProgressEvent.prototype = XMLHttpRequestEvent.prototype;

  return {
    event: function(xhr, type) {
      return new XMLHttpRequestEvent(xhr, type);
    },

    progressEvent: function(xhr, type) {
      return new XMLHttpRequestProgressEvent(xhr, type);
    }
  };
};