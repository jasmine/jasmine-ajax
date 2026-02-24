To make a release:

1. Generate release notes using the `anchorman` gem.
2. Update the version in package.json.
3. Run `npm run build`.
4. Commit release notes, package.json, and lib/mock-ajax.js and push.
5. Wait for CI to go green.
6. Tag the commit and run `git push --tags`.
7. Publish the release: `npm publish`.