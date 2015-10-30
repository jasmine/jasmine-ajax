(function() {
  var jRequire = getJasmineRequireObj(),
      MockAjax = jRequire.ajax(jRequire);
  if (typeof window === "undefined" && typeof exports === "object") {
    exports.MockAjax = MockAjax;

    /**
     * jasmine is an instance of require('jasmine') in node.js
     * we may not use jasmine to execute our specs
     * then set it manually like this:
     *
     * var jas = new new Jasmine();
     * var jasmineAjax = require('jasmine-ajax');
     * jas.Ajax = new jasmineAjax.MockAjax(global);
     */
    if (typeof jasmine !== 'undefined') {
      jasmine.Ajax = new MockAjax(this);
    }
  } else {
    window.MockAjax = MockAjax;
    jasmine.Ajax = new MockAjax(window);
  }
}());
