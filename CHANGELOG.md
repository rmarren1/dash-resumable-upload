# Change Log for dash-resumable-upload
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

# 0.0.4 - 2019-06-01
### Fixed
- Fixed PropTypes import that was changed in React version 16

## 0.0.3 - 2018-06-19
### Fixed
- Fix issue where in some environments, multiple threads will attempt
file reconstruction simultaneously and attempt to read deleted files.

## 0.0.2 - 2018-06-19
### Fixed
- Fix issue where in environments, calling `os.unlink` or `os.remove` to quickly after
closing a file handle results in an error.

## 0.0.1 - 2018-04-07
- Initial release
