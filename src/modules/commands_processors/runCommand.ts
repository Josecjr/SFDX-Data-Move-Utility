/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import * as fs from 'fs';
import "reflect-metadata";
import "es6-shim";
import { plainToClass } from "class-transformer";
import {
    parseQuery,
    composeQuery,
    FieldType,
    OrderByClause,
    Field as SOQLField,
    getComposedField
} from 'soql-parser-js';
import { MessageUtils, RESOURCES, LOG_MESSAGE_VERBOSITY } from "../components/messages";
import * as models from '../models';
import { OPERATION, CONSTANTS } from '../components/statics';
import { MigrationJobTask as Task, MigrationJob as Job } from '../models';



/**
 * Class to process SFDMU:RUN CLI command
 *
 * @export
 * @class RunCommand
 */
export class RunCommand {

    logger: MessageUtils;
    basePath: string;
    targetUsername: string;
    sourceUsername: string;
    apiVersion: string;
    script: models.Script;

    job: Job;

    /**
     *Creates an instance of RunCommand.
     * @param {MessageUtils} logger The MessageUtils instance
     * @param {string} basePath The absolute or relative path where the export.json file does exist (from the command line)
     * @param {string} sourceUsername The username/SFDX instance name of the source env (from the command line)
     * @param {string} targetUsername The username/SFDX instance name of the target env (from the command line)
     * @param {string} apiVersion The sf api version to use across all api operations (from the command line)
     * @memberof RunCommand
     */
    constructor(logger: MessageUtils,
        basePath: string,
        sourceUsername: string,
        targetUsername: string,
        apiVersion: string) {

        this.logger = logger;
        this.basePath = (path.isAbsolute(basePath) ? basePath : path.join(process.cwd(), basePath.toString())).replace(/([^"]+)(.*)/, "$1");
        this.targetUsername = targetUsername;
        this.sourceUsername = sourceUsername;
        this.apiVersion = apiVersion;
    }



    /**
     * Setup the command
     *
     * @returns {Promise<void>}
     * @memberof RunCommand
     */
    async setupAsync(): Promise<void> {

        // Load script file
        if (!fs.existsSync(this.basePath)) {
            throw new models.CommandInitializationError(this.logger.getResourceString(RESOURCES.workingPathDoesNotExist));
        }
        let filePath = path.join(this.basePath, CONSTANTS.SCRIPT_FILE_NAME);

        if (!fs.existsSync(filePath)) {
            throw new models.CommandInitializationError(this.logger.getResourceString(RESOURCES.packageFileDoesNotExist));
        }

        this.logger.infoMinimal(RESOURCES.newLine);
        this.logger.headerMinimal(RESOURCES.loadingPackageFile);

        let json = fs.readFileSync(filePath, 'utf8');
        let jsonObject = JSON.parse(json);
        this.script = plainToClass(models.Script, jsonObject);

        // Setup script object
        await this.script.setupAsync(this.logger, this.sourceUsername, this.targetUsername, this.basePath, this.apiVersion);

        this.logger.objectMinimal({
            [this.logger.getResourceString(RESOURCES.source)]: this.logger.getResourceString(RESOURCES.sourceOrg, this.script.sourceOrg.name),
            [this.logger.getResourceString(RESOURCES.target)]: this.logger.getResourceString(RESOURCES.targetOrg, this.script.targetOrg.name),
            [this.logger.getResourceString(RESOURCES.packageScript)]: this.logger.getResourceString(RESOURCES.scriptFile, filePath)
        });

        // Describe sobjects
        await this.script.processObjectsMetadataAsync();

    }



    /**
     * Analyse the current script structure and create 
     * the optimised list of steps 
     * to perform during the migration process
     *
     * @returns {Promise<void>}
     * @memberof RunCommand
     */
    async createMigrationJobAsync(): Promise<void> {

        this.logger.infoMinimal(RESOURCES.newLine);
        this.logger.headerMinimal(RESOURCES.dataMigrationProcessStarted);
        this.logger.infoVerbose(RESOURCES.buildingMigrationStaregy);

        this.job = new Job({
            script: this.script
        })

        let startIndex = 0;

        this.script.objects.forEach(newObject => {

            let newTask: Task = new Task({
                scriptObject: newObject,
                job: this.job
            });

            if (newObject.isReadonlyObject) {
                // Readonly objects are always at the beginning
                this.job.tasks.unshift(newTask);
                startIndex++;
            } else if (this.job.tasks.length == 0) {
                // First object
                this.job.tasks.push(newTask);
            } else {
                // The index where to insert the new object
                let indexToInsert: number = this.job.tasks.length;
                for (var taskIndex = this.job.tasks.length - 1; taskIndex >= startIndex; taskIndex--) {
                    var existedTask = this.job.tasks[taskIndex];
                    // Check if the new object is parent to the existed task
                    let isNewObject_Parent = existedTask.scriptObject.parentObjects.some(x => x.name == newObject.name);
                    // Check if the existed task is parent MD to the new object
                    let isExistedTask_ParentMasterDetail = newObject.parentMasterDetailObjects.some(x => x.name == existedTask.scriptObject.name);
                    if (isNewObject_Parent && !isExistedTask_ParentMasterDetail) {
                        // The new object is the parent => push it before the existed task
                        indexToInsert = taskIndex;
                    }
                    // The existed task is the parent => leave without change
                }
                // Insert the new object at the calculated index
                this.job.tasks.splice(indexToInsert, 0, newTask);
            }
        });
    }
}












