# Change Log for dash-resumable-upload
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.0.2 - 2018-06-19
### Fixed
- Fix issue where in environments, calling `os.unlink` or `os.remove` to quickly after
closing a file handle results in an error.

## 0.0.1 - 2018-04-07
- Initial release
