Test Driving APIs with Jasmine
============
This shows an example JavaScript app that uses Jasmine to mock Ajax requests/responses and spy on callbacks related with various responses. In particular, this project provides an Ajax mock that can easily be used in a project that uses Prototype. Eventually we would like to provide a single mock that can be used for both Prototype and jQuery projects.

Interesting Parts
------------
* `spec/javascripts/helpers/mock-ajax.js`: In order to mock out the actual HTTP requests, you'll want to include this file in your project and put it somewhere on Jasmine's helper lookup path. Including this file will do a number of things, including a way for you to define your own responses and tell your requests which one to use, as well as keep a list of Ajax requests for later inspection.
* `spec/helpers/test_responses/search.js`: By defining responses with various status codes and content, you can set expectations with Jasmine about what should happen in each of those situations. For example, you might create test responses for status codes of 200, 404, 500, and whatever other responses codes are relevant to the API you are working with. You can then hand these test responses to the Ajax mocks you create, then set expectations on which callbacks should be called in each of those contexts.
