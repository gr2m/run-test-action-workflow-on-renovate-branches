# run-test-action-workflow-on-renovate-branches

This is a script for [mutate-github-repositories-cli](https://github.com/gr2m/mutate-github-repositories-cli/). It looks for `.github/workflows/test.yml` and adds

```yml
on:
  push:
    branches:
      - renovate/**
```

## Usage

```
git clone https://github.com/gr2m/run-test-action-workflow-on-renovate-branches.git
cd run-test-action-workflow-on-renovate-branches
$ npx mutate-github-repositories-cli \
  --token 0123456789012345678901234567890123456789 \
  script.js \
  "octokit/*"
```

## Licenses

[ISC](LICENSE.md)
