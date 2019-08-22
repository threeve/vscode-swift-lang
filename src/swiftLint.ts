// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as vscode from "vscode";
import * as childProcess from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import * as which from "which";

interface SwiftLintDiagnostic {
    severity: "Warning" | "Error";
    line: number;
    character: number | null;
    rule_id: string;
    reason: string;
    type: string;
}

export class SwiftLint {
    public constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
            "swiftlint"
        );
        context.subscriptions.push(
            this.diagnosticCollection,
            vscode.workspace.onDidSaveTextDocument(
                this.onDidSaveTextDocument.bind(this)
            )
        );
    }

    private diagnosticCollection: vscode.DiagnosticCollection;

    private onDidSaveTextDocument(document: vscode.TextDocument): void {
        if (document.languageId !== "swift") return;
        let swiftlint = which.sync("swiftlint", { nothrow: true });
        let workspace = vscode.workspace.getWorkspaceFolder(document.uri);
        if (workspace !== undefined) {
            // Look for swiftformat from swiftpm or cocoapods
            const relativePaths = [
                ".build/debug/swiftlint",
                ".build/release/swiftlint",
                "Pods/SwiftLint/swiftlint",
            ];
            for (let relativePath of relativePaths) {
                let joinedPath = path.join(workspace.uri.fsPath, relativePath);
                if (existsSync(joinedPath)) {
                    swiftlint = path.normalize(joinedPath);
                    break;
                }
            }
        }
        if (swiftlint === null) return;
        let child = childProcess.spawn(
            swiftlint,
            ["lint", "--use-stdin", "--reporter", "json"],
            {
                cwd: path.dirname(document.fileName),
            }
        );
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", data => (stdout += data));
        child.stderr.on("data", data => (stderr += data));
        child.on("error", () => {});
        child.on("close", () => {
            let results: [SwiftLintDiagnostic] = JSON.parse(stdout);
            let diagnostics: vscode.Diagnostic[] = [];
            for (let lint of results) {
                let char = lint.character !== null ? lint.character - 1 : 0;
                let range = new vscode.Range(
                    new vscode.Position(lint.line - 1, char),
                    new vscode.Position(lint.line - 1, char)
                );
                let diagnostic = new vscode.Diagnostic(
                    range,
                    lint.reason,
                    lint.severity == "Error"
                        ? vscode.DiagnosticSeverity.Error
                        : vscode.DiagnosticSeverity.Warning
                );
                diagnostic.source = "swiftlint";
                diagnostic.code = lint.rule_id;
                diagnostics.push(diagnostic);
            }
            this.diagnosticCollection.set(document.uri, diagnostics);
        });
        if (child.pid) {
            child.stdin.end(document.getText());
        }
    }
}
