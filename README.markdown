Purpose
============
This project shows an example of using Jasmine to test drive an API with JavaScript.

**Note** - The Ajax mock used in this project is specific to Prototype. We'll be posting an example using jQuery shortly, with the eventual goal of providing a single mock.

Interesting Parts
------------
* `spec/javascripts/helpers/mock-ajax.js`: In order to mock out the actual HTTP requests, you'll want to include this file in your project and put it somewhere on Jasmine's helper lookup path. Including this file will do a number of things, including:
  * overwrite Prototype's 
  * provide a way for you to define your own responses and tell your requests which one to use
  * keep a list of Ajax requests for later inspection
* `spec/helpers/test_responses/search.js`: By defining responses with various status codes and content, you can set expectations with Jasmine about what should happen in each of those situations. For example, you might create test responses for status codes of 200, 404, 500, and whatever other responses codes are relevant to the API you are working with.

Test Responses Pattern
----------------
Introduce and explain pattern
