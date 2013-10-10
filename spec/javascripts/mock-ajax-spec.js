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
          jasmine.Ajax.assertInstalled();
        }).not.toThrowError("Mock ajax is not installed, use jasmine.Ajax.useMock()");
    });

    it("raises an error if the mock is not installed", function() {
      jasmine.Ajax.installed = false;
      expect(
        function() {
          jasmine.Ajax.assertInstalled();
        }).toThrowError("Mock ajax is not installed, use jasmine.Ajax.useMock()");
    });
  });

  describe("installMock", function() {
    describe("when using a top-level replacement", function() {

      it("installs the mock", function() {
          jasmine.Ajax.installMock();
          expect(window.XMLHttpRequest).toBe(FakeXMLHttpRequest);
      });

      it("saves a reference to the browser's XHR", function() {
          var xhr = window.XMLHttpRequest;
          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.real).toBe(xhr);
      });

      it("sets mode to 'toplevel'", function() {
          jasmine.Ajax.installMock();
          expect(jasmine.Ajax.mode).toEqual("toplevel");
      });
    });

    it("sets the installed flag to true", function() {
      jasmine.Ajax.installMock();
      expect(jasmine.Ajax.installed).toBeTruthy();
    });

  });

  describe("uninstallMock", function() {
    describe("when using toplevel", function() {
      it("returns ajax control to the browser object", function() {
          var xhr = window.XMLHttpRequest;

          jasmine.Ajax.installMock();
          jasmine.Ajax.uninstallMock();

          expect(window.XMLHttpRequest).toBe(xhr);
      });
    });

    it("raises an exception if jasmine.Ajax is not installed", function() {
      expect(function(){ jasmine.Ajax.uninstallMock(); }).toThrowError("Mock ajax is not installed, use jasmine.Ajax.useMock()");
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
    it("installs the mock and uninstalls when done", function() {
      var realRequest = spyOn(window, 'XMLHttpRequest'),
          fakeRequest = spyOn(window, 'FakeXMLHttpRequest');
      expect(function() {
        jasmine.Ajax.useMock(function() {
          window.XMLHttpRequest();
          throw "function that has an error"
        });
      }).toThrow();
      expect(realRequest).not.toHaveBeenCalled();
      expect(fakeRequest).toHaveBeenCalled();
      fakeRequest.calls.reset();
      window.XMLHttpRequest();
      expect(realRequest).toHaveBeenCalled();
      expect(fakeRequest).not.toHaveBeenCalled();
    });

  });

});
