module.exports = function( grunt ) {
  'use strict';

  function packageVersion() {
    return require('./package.json').version;
  }
  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({
    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: true,
        eqeqeq: true,
        eqnull: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        globals: {
          global: true,
          jasmine: false,
          module: false,
          exports: true,
          describe: false,
          it: false,
          expect: false,
          beforeEach: false,
          afterEach: false,
          spyOn: false,
          getJasmineRequireObj: false,
          require: false
        }
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'lib/**/*.js', 'spec/**/*.js']
    },
    packageVersion: packageVersion(),
    shell: {
      ctags: {
        command: 'ctags -R lib'
      },
      release: {
        command: [
          'git tag v<%= packageVersion %>',
          'git push origin main --tags',
          'npm publish'
        ].join('&&')
      }
    },
    template: {
        options: {
            data: function() {
                return {
                    packageVersion: packageVersion(),
                    files: grunt.file.expand([
                        'src/requireAjax.js',
                        'src/**/*.js',
                        '!src/boot.js'
                    ])
                };
            }
        },
        lib: {
            src: 'src/boot.js',
            dest: '.tmp/mock-ajax.js'
        }
    },
    includes: {
        options: {
            includeRegexp: /\/\/\s*include "(\S+)";/,
            includePath: '.'
        },
        lib: {
            src: '.tmp/mock-ajax.js',
            dest: 'lib/mock-ajax.js'
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['template:lib', 'includes:lib']);
  grunt.registerTask('ctags', 'Generate ctags', ['shell:ctags']);
  grunt.registerTask('release', 'Release ' + packageVersion() + ' to npm', ['shell:release']);
};
