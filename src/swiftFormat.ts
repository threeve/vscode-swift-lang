// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as vscode from "vscode";
import * as childProcess from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import * as which from "which";

export class SwiftDocumentFormattingEditProvider
    implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        return new Promise<vscode.TextEdit[]>((resolve, reject): void => {
            // Look for swiftformat from swiftpm or cocoapods
            const relativePaths = [
                ".build/debug/swiftformat",
                ".build/release/swiftformat",
                "Pods/SwiftFormat/CommandLineTool/swiftformat",
            ];
            let workspace = vscode.workspace.getWorkspaceFolder(document.uri);
            if (workspace === undefined) {
                return reject("unable to resolve workspace");
            }
            let swiftFormatPath = which.sync("swiftformat", { nothrow: true });
            for (let relativePath of relativePaths) {
                let joinedPath = path.join(workspace.uri.fsPath, relativePath);
                if (existsSync(joinedPath)) {
                    swiftFormatPath = path.normalize(joinedPath);
                    break;
                }
            }
            if (swiftFormatPath === null) {
                return reject("Unable to location `swiftformat` binary");
            }
            // TODO: find a .swiftformat config file
            let config = undefined;
            let currentPath = path.dirname(document.fileName);
            while (currentPath.startsWith(workspace.uri.fsPath)) {
                let testPath = path.join(currentPath, ".swiftformat");
                if (existsSync(testPath)) {
                    config = testPath;
                    break;
                }
                currentPath = path.dirname(currentPath);
            }
            let swiftFormat = childProcess.spawn(
                swiftFormatPath,
                config === undefined ? [] : ["--config", config],
                {
                    cwd: path.dirname(document.fileName),
                }
            );
            token.onCancellationRequested(
                () => !swiftFormat.killed && swiftFormat.kill()
            );
            let stdout = "";
            let stderr = "";
            swiftFormat.stdout.setEncoding("utf8");
            swiftFormat.stdout.on("data", data => (stdout += data));
            swiftFormat.stderr.on("data", data => (stderr += data));
            swiftFormat.on("error", () => {
                return reject();
            });
            swiftFormat.on("close", code => {
                if (code !== 0) {
                    return reject(stderr);
                }
                const fileStart = new vscode.Position(0, 0);
                const fileEnd = document.lineAt(document.lineCount - 1).range
                    .end;
                const textEdits: vscode.TextEdit[] = [
                    new vscode.TextEdit(
                        new vscode.Range(fileStart, fileEnd),
                        stdout
                    ),
                ];
                return resolve(textEdits);
            });
            if (swiftFormat.pid) {
                swiftFormat.stdin.end(document.getText());
            }
        });
    }
}
