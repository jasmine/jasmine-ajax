describe('RequestStub', function() {
  beforeEach(function() {
    this.RequestStub = getJasmineRequireObj().AjaxRequestStub();

    jasmine.addMatchers({
      toMatchRequest: function() {
        return {
          compare: function(actual) {
            return {
              pass: actual.matches.apply(actual, Array.prototype.slice.call(arguments, 1))
            };
          }
        };
      }
    });
  });

  it('matches just by exact url', function() {
    var stub = new this.RequestStub('www.example.com/foo');

    expect(stub).toMatchRequest('www.example.com/foo');
  });

  it('does not match if the url differs', function() {
    var stub = new this.RequestStub('www.example.com/foo');

    expect(stub).not.toMatchRequest('www.example.com/bar');
  });

  it('matches unordered query params', function() {
    var stub = new this.RequestStub('www.example.com?foo=bar&baz=quux');

    expect(stub).toMatchRequest('www.example.com?baz=quux&foo=bar');
  });

  it('requires all specified query params to be there', function() {
    var stub = new this.RequestStub('www.example.com?foo=bar&baz=quux');

    expect(stub).not.toMatchRequest('www.example.com?foo=bar');
  });

  it('can match the url with a RegExp', function() {
    var stub = new this.RequestStub(/ba[rz]/);

    expect(stub).toMatchRequest('bar');
    expect(stub).toMatchRequest('baz');
    expect(stub).not.toMatchRequest('foo');
  });

  it('requires the method to match if supplied', function() {
    var stub = new this.RequestStub('www.example.com/foo', null, 'POST');

    expect(stub).not.toMatchRequest('www.example.com/foo');
    expect(stub).not.toMatchRequest('www.example.com/foo', null, 'GET');
    expect(stub).toMatchRequest('www.example.com/foo', null, 'POST');
  });

  it('requires the data submitted to match if supplied', function() {
    var stub = new this.RequestStub('/foo', 'foo=bar&baz=quux');

    expect(stub).toMatchRequest('/foo', 'baz=quux&foo=bar');
    expect(stub).not.toMatchRequest('/foo', 'foo=bar');
  });
});
