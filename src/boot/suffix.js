(function() {
    var jRequire = getAjaxRequireObj();
    window.MockAjax = jRequire.ajax(jRequire);
    jasmine.Ajax = new window.MockAjax(window);
})();
