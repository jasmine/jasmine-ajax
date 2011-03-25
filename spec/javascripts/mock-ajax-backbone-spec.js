describe("Jasmine Mock Ajax (for Backbone)", function() {
  var Model, model;
  var request, fakeResponse;


  beforeEach(function() {
    Model = Backbone.Model.extend({
      defaults: {
        foo: 'bar'
      }
    });

    fakeResponse = {
            status: 200,
            contentType: "application/json",
            responseText: '{"foo":"fake"}'
          };

    model = new Model();
    model.url = "url/foo"
  });


  describe("Model", function() {
    describe("sample model (baseline)", function() {
      it("should have default values", function() {
        expect(model.get("foo")).toEqual("bar");
      });

      it("should have a URL", function() {
        expect(model.url).toEqual("url/foo");
      });
    });


    describe("fetch method", function() {
      describe("before fetch is called", function() {
        it("should have no requests queued", function() {
          expect(ajaxRequests.length).toEqual(0);
        });
      });

      describe("when calling 'fetch'", function() {
        it("should queue a fake request", function() {
          model.fetch();
          expect(ajaxRequests.length).toEqual(1);
        });

        it("should store the model's URL on the fake request", function() {
          model.fetch();
          expect(mostRecentAjaxRequest().url).toEqual("url/foo");
        });
      });

      describe("returning fake data", function() {
        it("should have fake response in model's property", function() {
          model.fetch();
          request = mostRecentAjaxRequest();
          request.response(fakeResponse);
          expect(model.get('foo')).toEqual('fake');
        });
      });
    });
  });
});

