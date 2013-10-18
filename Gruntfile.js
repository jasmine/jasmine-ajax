module.exports = function( grunt ) {
  'use strict';
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
          jasmine: false,
          ajaxRequests: true,
          ajaxStubs: true,
          module: false,
          exports: true
        }
      },
      all: ['Gruntfile.js', 'lib/*.js', 'spec/*.js']
    },
    shell: {
      ctags: {
        command: 'ctags -R lib'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('ctags', 'Generate ctags', ['shell:ctags']);
};
