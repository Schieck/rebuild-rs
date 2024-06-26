
# Contributing to Rebuild RS

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE.md) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/Schieck/rebuild-rs/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Schieck/rebuild-rs/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People *love* thorough bug reports.

## Use a Consistent Coding Style

* 2 spaces for indentation rather than tabs
* You can try running `npm run lint` for style unification

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Auto Versioning and Deployment

This project uses an automated versioning and deployment process triggered by pull requests. Here's how to use it:

### Versioning

To trigger auto versioning, include one of the following keywords in the **last commit message** before merging your pull request:
- **patch**: for bug fixes and small changes.
- **minor**: for new features that don't break backward compatibility.
- **major**: for changes that break backward compatibility.

### Example Commit Messages
- `fix: correct typos in documentation [patch]`
- `feat: add new user authentication feature [minor]`
- `breaking change: update API endpoints [major]`

### Deployment

Once a pull request with the above keywords is merged into the `main` branch:
1. The version number is automatically updated based on the keyword in the last commit message.
2. A new GitHub release is created.
3. The project is deployed to Firebase Hosting.

Ensure your last commit message follows the conventions above to properly trigger the versioning and deployment workflows.


## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/main/CONTRIBUTING.md).
