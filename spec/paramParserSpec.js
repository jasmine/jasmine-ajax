describe('ParamParser', function() {
  beforeEach(function() {
    var Constructor = getJasmineRequireObj().AjaxParamParser();
    expect(Constructor).toEqual(jasmine.any(Function));
    this.parser = new Constructor();
  });

  it('has a default parser', function() {
    var parser = this.parser.findParser({ contentType: function() {} }),
        parsed = parser.parse('3+stooges=shemp&3+stooges=larry%20%26%20moe%20%26%20curly&some%3Dthing=else+entirely');

    expect(parsed).toEqual({
      '3 stooges': ['shemp', 'larry & moe & curly'],
      'some=thing': ['else entirely']
    });
  });

  it('should detect and parse json', function() {
    var data = {
          foo: 'bar',
          baz: ['q', 'u', 'u', 'x'],
          nested: {
            object: {
              containing: 'stuff'
            }
          }
        },
        parser = this.parser.findParser({ contentType: function() { return 'application/json'; } }),
        parsed = parser.parse(JSON.stringify(data));

    expect(parsed).toEqual(data);
  });

  it('should parse json with further qualifiers on content-type', function() {
    var data = {
          foo: 'bar',
          baz: ['q', 'u', 'u', 'x'],
          nested: {
            object: {
              containing: 'stuff'
            }
          }
        },
        parser = this.parser.findParser({ contentType: function() { return 'application/json; charset=utf-8'; } }),
        parsed = parser.parse(JSON.stringify(data));

    expect(parsed).toEqual(data);
  });

  it('should have custom parsers take precedence', function() {
    var custom = {
      test: jasmine.createSpy('test').and.returnValue(true),
      parse: jasmine.createSpy('parse').and.returnValue('parsedFormat')
    };

    this.parser.add(custom);

    var parser = this.parser.findParser({ contentType: function() {} }),
        parsed = parser.parse('custom_format');

    expect(parsed).toEqual('parsedFormat');
    expect(custom.test).toHaveBeenCalled();
    expect(custom.parse).toHaveBeenCalledWith('custom_format');
  });

  it('should skip custom parsers that do not match', function() {
    var custom = {
      test: jasmine.createSpy('test').and.returnValue(false),
      parse: jasmine.createSpy('parse').and.returnValue('parsedFormat')
    };

    this.parser.add(custom);

    var parser = this.parser.findParser({ contentType: function() {} }),
        parsed = parser.parse('custom_format');

    expect(parsed).toEqual({ custom_format: [ 'undefined' ] });
    expect(custom.test).toHaveBeenCalled();
    expect(custom.parse).not.toHaveBeenCalled();
  });

  it('removes custom parsers when reset', function() {
    var custom = {
      test: jasmine.createSpy('test').and.returnValue(true),
      parse: jasmine.createSpy('parse').and.returnValue('parsedFormat')
    };

    this.parser.add(custom);

    var parser = this.parser.findParser({ contentType: function() {} }),
        parsed = parser.parse('custom_format');

    expect(parsed).toEqual('parsedFormat');

    custom.test.calls.reset();
    custom.parse.calls.reset();

    this.parser.reset();

    parser = this.parser.findParser({ contentType: function() {} });
    parsed = parser.parse('custom_format');

    expect(parsed).toEqual({ custom_format: [ 'undefined' ] });
    expect(custom.test).not.toHaveBeenCalled();
    expect(custom.parse).not.toHaveBeenCalled();
  });
});
