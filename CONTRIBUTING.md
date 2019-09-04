# Contributing

Contributions to this project are always welcome. To keep things consistent, please follow these guidelines when contributing to the project.

### Documenting your code
We generally only accept contributions with well-documented code. This includes comments in the code, external files explaining certain aspects if necessary and so on.

If you aren't good in English, that isn't a problem. We'll be more than happy to provide any assistance necessary in a PR, as long as we understand what it's about. We will, however, not document your code for you, so please understand that we won't accept PRs where no effort was put into documenting the code.

### Automated testing
This project uses automated tests to ensure stability, as it is meant to be deployed on production servers. Therefore, all changed/added features have to include unit tests covering

- standard cases (what should happen)
- edge cases (documenting responses when something unexpected happens)

Please also understand that small updates (increasing the patch version number) may not to changed results in unit tests, as this could create compatibility issues (see the *Compatibility* section below)

### Dependencies
**Don't** add dependencies unless absolutely necessary (and even than, be prepared for it to get declined). As mentioned above, this is meant to be deployed
on production servers. As every new third-party-dependency adds potential vulnerabilities to the project, this should be avoided if somehow possible.

### Contributing
If an issue exists for the task, please assign yourself in it and clearly state when you begin and stop working on it to let everyone
know what's being worked on/ what's not assigned yet.

Contributions may exist as PRs to the `develop` branch (and for hotfixes only to the `master` branch) only. They have to get reviewed and merged by members of the GitHub organization.

#### As a member/maintainer of the core team
If you are a member of the core team (i.e., a member of the organization here on GitHub), contributions may be done directly in this repository via a branch from the `develop` branch. While this is not enforced, please see the GitFlow workflow as a recommendation for contirbutions.

#### As an external contributor
If you are an external contributor, please fork the project and work locally in your account, and then create a PR following the guidelines above.

### Release management
Releases may get created by the mainainers of the project (and team members empowered by said maintainers only). They have to follow the guidelines and workflows mentioned below.

Versioning numbers should follow the semantic versioning 2.0.0 pattern (or, for tags, a sematnic versioning number including a prefix `v`).

#### Hotfix releases
Hotfixes, as proposed by the GitFlow workflow, get merged directly into the master branch. As soon as they are merged, the process for releasing a new version below has to get implemented.

Hotfix releases may **never** create compatibility issues (i.e., break or change tests) and should only get used when necessary.

This should get used for high-priority fixes only.

#### Feature releases
Feature releases are merges from `develop` into `master`. As soon as this gets merged, the process decribed below has to get implemented.

All compatibility changes must be clearly documented in the release notes.

#### Process for releasing a new version

1. Merging the releavant branch (`hotfix-*` or `develop`)
2. Commit and push to `master` a commit bumping the version number (`package.json`) with PATCH for hotfixes and MINOR for feature releases.
   The commit message should be `Increased package version to vX.X.X`
3. Run CI tests for the commit
4. If all tests and requirements pass, continue with step (8)
5. Revert the commit
6. Inform about failed release in the PR for the release, e.g., `develop->master`
7. Go to step (10)
8. Create a tag with the format `vX.X.X` for the commit and create a GitHub release including release notes
9. Publish new package version to npm (if applicable)
10. Merge `master` into `develop`

### References
1. [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
2. [Semantic versioning](https://semver.org/)
