// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as vscode from "vscode";

import { SwiftDocumentFormattingEditProvider } from "./swiftFormat";
import { SwiftLint } from "./swiftLint";
import { SwiftTasks } from "./swiftTasks";

export function activate(context: vscode.ExtensionContext): void {
    let outputChannel = vscode.window.createOutputChannel("Swift Lang");
    context.subscriptions.push(outputChannel);

    let formatter = vscode.languages.registerDocumentFormattingEditProvider(
        { language: "swift", scheme: "file" },
        new SwiftDocumentFormattingEditProvider()
    );
    context.subscriptions.push(formatter);

    new SwiftLint(context);
    new SwiftTasks(context);

    outputChannel.appendLine("swift-lang activated");
}

export function deactivate(): void {}
