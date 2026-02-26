const fs = require('fs');
const glob = require('glob');
const ejs = require('ejs');

const pkg = JSON.parse(fs.readFileSync('package.json'));

const configs = [
  {
    src: [
      { literal: '(function() {' },
      {
        template: 'src/licenseBanner.ejs',
        data: {
          packageVersion: pkg.version,
          currentYear: new Date(Date.now()).getFullYear()
        }
      },
      'src/requireAjax.js',
      'src/*.js',
      'src/boot/suffix.js',
      { literal: '})()' },
    ],
    dest: 'lib/mock-ajax.js',
  }
];

for (const {src, dest} of configs) {
  function expand(srcListEntry) {
    if (typeof srcListEntry === 'object' && !srcListEntry.glob) {
      return srcListEntry;
    }

    const matches =  glob.sync(
      srcListEntry.glob ?? srcListEntry,
      {ignore: srcListEntry.exclude}
    );
    return matches.sort(function (a, b) {
      // Match the sort order of previous build tools, so that the
      // output is the same.
      a = a.toLowerCase();
      b = b.toLowerCase();

      if (a < b) {
        return -1;
      } else if (a === b) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  const srcs = src.flatMap(expand);
  const seen = new Set();
  const chunks = [];

  for (const s of srcs) {
    let content;

    if (!seen.has(s)) {
      if (s.template) {
        const template = fs.readFileSync(s.template, {encoding: 'utf8'});
        content = ejs.render(template, s.data);
      } else if (s.literal) {
        content = s.literal;
      } else {
        content = fs.readFileSync(s, {encoding: 'utf8'});
      }

      chunks.push(content);
      seen.add(s);
    }
  }

  fs.writeFileSync(dest, chunks.join('\n'), {encoding: 'utf8'});
}