// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

interface SwiftTaskDefinition extends vscode.TaskDefinition {
    command: string;
}

export class SwiftTasks implements vscode.TaskProvider {
    public constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.workspace.registerTaskProvider("swift", this)
        );
    }

    public provideTasks(
        token?: vscode.CancellationToken | undefined
    ): vscode.ProviderResult<vscode.Task[]> {
        let tasks: vscode.Task[] = [];
        let folders = vscode.workspace.workspaceFolders;
        if (folders === undefined) return tasks;

        folders.forEach(folder => {
            let swiftPackage = path.join(folder.uri.fsPath, "Package.swift");
            if (!fs.existsSync(swiftPackage)) {
                return;
            }
            let build = new vscode.Task(
                { type: "swift", command: "build" },
                folder,
                "build",
                "swift",
                new vscode.ShellExecution("swift build"),
                ""
            );
            build.group = vscode.TaskGroup.Build;
            let test = new vscode.Task(
                { type: "swift", command: "test" },
                folder,
                "test",
                "swift",
                new vscode.ShellExecution("swift test"),
                ""
            );
            test.group = vscode.TaskGroup.Test;
            let clean = new vscode.Task(
                { type: "swift", command: "clean" },
                folder,
                "clean",
                "swift",
                new vscode.ShellExecution("swift package clean"),
                ""
            );
            clean.group = vscode.TaskGroup.Clean;
            tasks.push(build, clean, test);
        });

        return tasks;
    }

    public resolveTask(
        task: vscode.Task,
        token?: vscode.CancellationToken | undefined
    ): vscode.ProviderResult<vscode.Task> {
        throw new Error("Method not implemented.");
    }
}
