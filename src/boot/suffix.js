(function() {
    var jRequire = getJasmineRequireObj();
    window.MockAjax = jRequire.ajax(jRequire);
    jasmine.Ajax = new window.MockAjax(window);
})();
