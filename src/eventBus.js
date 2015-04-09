getJasmineRequireObj().AjaxEventBus = function() {
  function EventBus() {
    this.eventList = {};
  }

  function ensureEvent(eventList, name) {
    eventList[name] = eventList[name] || [];
    return eventList[name];
  }

  function findIndex(list, thing) {
    if (list.indexOf) {
      return list.indexOf(thing);
    }

    for(var i = 0; i < list.length; i++) {
      if (thing === list[i]) {
        return i;
      }
    }

    return -1;
  }

  function slice(array, start) {
    return Array.prototype.slice.call(array, start);
  }

  EventBus.prototype.addEventListener = function(event, callback) {
    ensureEvent(this.eventList, event).push(callback);
  };

  EventBus.prototype.removeEventListener = function(event, callback) {
    var index = findIndex(this.eventList[event], callback);

    if (index >= 0) {
      this.eventList[event].splice(index, 1);
    }
  };

  EventBus.prototype.trigger = function(event) {
    // Arguments specified after event name need to be propagated
    var args = slice(arguments, 1);
    var eventListeners = this.eventList[event];

    if(eventListeners){
      for(var i = 0; i < eventListeners.length; i++){
        eventListeners[i].apply(this, args);
      }
    }
  };

  return function() {
    return new EventBus();
  };
};