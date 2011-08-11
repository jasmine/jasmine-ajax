describe("jasmine.Ajax", function() {
  beforeEach(function() {
    jasmine.Ajax.reset();
  });

  describe("isInstalled", function() {
    it("returns true if the mock has been installed", function() {
      jasmine.Ajax.installed = true;
      expect(jasmine.Ajax.isInstalled()).toBeTruthy();
    });

    it("returns false if the mock has not been installed", function() {
      jasmine.Ajax.installed = false;
      expect(jasmine.Ajax.isInstalled()).toBeFalsy();
    });
  });

  describe("assertInstalled", function() {
    it("doesn't raise an error if the mock is installed", function() {
      jasmine.Ajax.installed = true;
      expect(
        function() {
          jasmine.Ajax.assertInstalled()
        }).not.toThrow("Mock ajax is not installed, use jasmine.Ajax.useMock()");
    });

    it("raises an error if the mock is not installed", function() {
      jasmine.Ajax.installed = false;
      expect(
        function() {
          jasmine.Ajax.assertInstalled()
        }).toThrow("Mock ajax is not installed, use jasmine.Ajax.useMock()");
    });
  });

  describe("installMock", function() {
    describe("when using jQuery", function() {

      it("installs the mock", function() {
        withoutPrototype(function() {
          jasmine.Ajax.installMock();
          expect(jQuery.ajaxSettings.xhr).toBe(jasmine.Ajax.jQueryMock);
        });
      });

      it("saves a reference to jQuery.ajaxSettings.xhr", function() {
        withoutPrototype(function() {
          var jqueryAjax = jQuery.ajaxSettings.xhr;
          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.real).toBe(jqueryAjax);
        });
      });

      it("sets mode to 'jQuery'", function() {
        withoutPrototype(function() {
          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.mode).toEqual("jQuery");
        });
      })
    });

    describe("when using Prototype", function() {
      it("installs the mock", function() {
        withoutJquery(function() {
          jasmine.Ajax.installMock();
          expect(Ajax.getTransport).toBe(jasmine.Ajax.prototypeMock);
        });
      });

      it("stores a reference to Ajax.getTransport", function() {
        withoutJquery(function(){
          var prototypeAjax = Ajax.getTransport;

          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.real).toBe(prototypeAjax);
        });
      });

      it("sets mode to 'Prototype'", function() {
        withoutJquery(function() {
          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.mode).toEqual("Prototype");
        });
      });
    });

    describe("when using any other library", function() {
      it("raises an exception", function() {
        var jquery = jQuery;
        var prototype = Prototype;
        jQuery = undefined;
        Prototype = undefined;

        expect(function(){ jasmine.Ajax.installMock() }).toThrow("jasmine.Ajax currently only supports jQuery and Prototype");

        jQuery = jquery;
        Prototype = prototype;
      });
    });

    it("sets the installed flag to true", function() {
      jasmine.Ajax.installMock();
      expect(jasmine.Ajax.installed).toBeTruthy();
    });

  });

  describe("uninstallMock", function() {
    describe("when using jQuery", function() {
      it("returns ajax control to jQuery", function() {
        withoutPrototype(function() {
          var jqueryAjax = jQuery.ajaxSettings.xhr;

          jasmine.Ajax.installMock();
          jasmine.Ajax.uninstallMock();

          expect(jQuery.ajaxSettings.xhr).toBe(jqueryAjax);
        });


      });

    });

    describe("when using Prototype", function() {
      it("returns Ajax control to Ajax.getTransport", function() {
        withoutJquery(function() {
          var prototypeAjax = Ajax.getTransport;
          jasmine.Ajax.installMock();
          jasmine.Ajax.uninstallMock();

          expect(Ajax.getTransport).toBe(prototypeAjax);
        });
        // so uninstallMock doesn't throw error when spec.after runs
        jasmine.Ajax.installMock();
      });
    });

    it("raises an exception if jasmine.Ajax is not installed", function() {
      console.log(jasmine.Ajax.installed + 'dd');
      expect(function(){ jasmine.Ajax.uninstallMock() }).toThrow("Mock ajax is not installed, use jasmine.Ajax.useMock()");
    });

    it("sets the installed flag to false", function() {
      jasmine.Ajax.installMock();
      jasmine.Ajax.uninstallMock();
      expect(jasmine.Ajax.installed).toBeFalsy();

      // so uninstallMock doesn't throw error when spec.after runs
      jasmine.Ajax.installMock();
    });

    it("sets the mode to null", function() {
      jasmine.Ajax.installMock();
      jasmine.Ajax.uninstallMock();
      expect(jasmine.Ajax.mode).toEqual(null);
      jasmine.Ajax.installMock();
    });
  });

  describe("useMock", function() {
    it("delegates to installMock", function() {
      spyOn(jasmine.Ajax, 'installMock').andCallThrough();
      jasmine.Ajax.useMock();
      expect(jasmine.Ajax.installMock).toHaveBeenCalled();
    });

    it("ensures the mock is not already installed", function() {
      jasmine.Ajax.useMock();

      spyOn(jasmine.Ajax, 'installMock');

      jasmine.Ajax.useMock();

      expect(jasmine.Ajax.installMock).not.toHaveBeenCalled();
    });

  });

});

function withoutJquery(spec) {
  var jqueryRef = jQuery;
  jQuery = undefined;
  spec.apply(this);
  jQuery = jqueryRef;
}

function withoutPrototype(spec) {
  var prototypeRef = Prototype;
  Prototype = undefined;
  spec.apply(this);
  Prototype = prototypeRef;
}

function withoutZepto(spec) {
  var zeptoRef = Zepto;
  Zepto = undefined;
  spec.apply(this);
  Zepto = zeptoRef;
}
