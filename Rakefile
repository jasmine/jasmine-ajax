ENV['JASMINE_SELENIUM_CONFIG_PATH'] ||= 'spec/support/jasmine_selenium_runner.yml'

require 'jasmine'
unless ENV["JASMINE_BROWSER"] == 'phantomjs'
  require 'jasmine_selenium_runner'
end
load 'jasmine/tasks/jasmine.rake'

namespace :jasmine do
  task :set_env do
    ENV['JASMINE_CONFIG_PATH'] ||= 'spec/support/jasmine.yml'
  end
end

task "jasmine:configure" => "jasmine:set_env"

task :default => "jasmine:ci"
