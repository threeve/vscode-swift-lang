# Swift Language for VSCode

The Swift Language extension provides supplemental support for Swift
to VSCode.

## Features

### Swift Format

This extension supports document formatting via [Swift Format][swiftformat].

[swiftformat]: https://github.com/nicklockwood/SwiftFormat

The extension searches for a `swiftformat` executable installed via SwiftPM,
CocoaPods, or in the current PATH.

### SwiftLint

This extension supports diagnostics via [SwiftLint][swiftlint].

[swiftlint]: https://github.com/realm/SwiftLint

The extension searches for a `swiftlint` executable installed via SwiftPM,
CocoaPods, or in the current PATH.

### Tasks

The extension will provide tasks if a `Package.swift` is found in the
workspace folder. At the moment these tasks are not customizable in
`tasks.json` in the workspace.

## Requirements

Certain features of swift-lang require additional tooling to be installed.
Refer to the documentation for those features to learn how to install those
requirements.

## Extension Settings

None, yet...

## License

Copyright 2019 Jason Foreman

This software is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at <http://mozilla.org/MPL/2.0/.>
