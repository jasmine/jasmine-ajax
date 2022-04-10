# Developing for Jasmine Ajax

We welcome your contributions! Thanks for helping make Jasmine a better project for everyone. Please review the backlog and discussion lists before starting work.  What you're looking for may already have been done. If it hasn't, the community can help make your contribution better. If you want to contribute but don't know what to work on, [issues tagged ready for work](https://github.com/jasmine/jasmine-ajax/labels/ready%20for%20work) should have enough detail to get started.

## Links

- [Jasmine Google Group](http://groups.google.com/group/jasmine-js)
- [Jasmine-dev Google Group](http://groups.google.com/group/jasmine-js-dev)
- [Jasmine on PivotalTracker](https://www.pivotaltracker.com/n/projects/10606)

## General Workflow

Please submit pull requests via feature branches using the semi-standard workflow of:

```bash
git clone git@github.com:yourUserName/jasmine-ajax.git              # Clone your fork
cd jasmine-ajax                                                     # Change directory
git remote add upstream https://github.com/jasmine/jasmine-ajax.git # Assign original repository to a remote named 'upstream'
git fetch upstream                                                  # Fetch changes not present in your local repository
git merge upstream/main                                           # Sync local main with upstream repository
git checkout -b my-new-feature                                      # Create your feature branch
git commit -am 'Add some feature'                                   # Commit your changes
git push origin my-new-feature                                      # Push to the branch
```

Once you've pushed a feature branch to your forked repo, you're ready to open a pull request. We favor pull requests with very small, single commits with a single purpose.

## Background

### Directory Structure

* `/src` contains all of the source files
* `/spec` contains all of the tests
    * mirrors the source directory
    * there are some additional files
* `/lib` contains the generated files for distribution

### Install Dependencies

Jasmine Ajax relies on Node.js.

To install the Node dependencies, you will need Node.js, Npm, and [Grunt](http://gruntjs.com/), the [grunt-cli](https://github.com/gruntjs/grunt-cli) and ensure that `grunt` is on your path.

    $ npm install --local

...will install all of the node modules locally. Now run

    $ grunt

...if you see that JSHint runs, your system is ready.

### How to write new Jasmine Ajax code

Or, How to make a successful pull request

* _Do not change the public interface_. Lots of projects depend on Jasmine and if you aren't careful you'll break them
* _Be browser agnostic_ - if you must rely on browser-specific functionality, please write it in a way that degrades gracefully
* _Write specs_ - Jasmine's a testing framework; don't add functionality without test-driving it
* _Write code in the style of the rest of the repo_ - Jasmine should look like a cohesive whole
* _Ensure the *entire* test suite is green_ in all the big browsers and JSHint - your contribution shouldn't break Jasmine for other users

Follow these tips and your pull request, patch, or suggestion is much more likely to be integrated.

### Running Specs

Jasmine Ajax uses [jasmine-browser-runner](http://github.com/jasmine/jasmine-browser-runner) to test itself in browser.

    $ npx jasmine-browser-runner

...and then visit `http://localhost:8888` to run specs.

## Before Committing or Submitting a Pull Request

1. Ensure all specs are green in browser
1. Ensure JSHint is green with `grunt jshint`
1. Build `mock-ajax.js` with `grunt build`
1. Make sure the tests pass

Note that we use Circle for Continuous Integration. We only accept green pull requests.

