getJasmineRequireObj().ajax = function(jRequire) {
  var $ajax = {};

  $ajax.RequestStub = jRequire.AjaxRequestStub();
  $ajax.RequestTracker = jRequire.AjaxRequestTracker();
  $ajax.StubTracker = jRequire.AjaxStubTracker();
  $ajax.ParamParser = jRequire.AjaxParamParser();
  $ajax.event = jRequire.AjaxEvent();
  $ajax.eventBus = jRequire.AjaxEventBus($ajax.event);
  $ajax.fakeRequest = jRequire.AjaxFakeRequest($ajax.eventBus);
  $ajax.MockAjax = jRequire.MockAjax($ajax);

  return $ajax.MockAjax;
};
