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
    var eventListeners = this.eventList[event];

    if(eventListeners){
      for(var i = 0; i < eventListeners.length; i++){
        eventListeners[i]();
      }
    }
  };

  return function() {
    return new EventBus();
  };
};