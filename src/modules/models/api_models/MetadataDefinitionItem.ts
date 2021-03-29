/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { GeneralDataResponse } from "..";
import { IMetadataDefinitionItem } from "../../../addons/package/base";

export default class MetadataDefinitionItem extends GeneralDataResponse implements IMetadataDefinitionItem {

    // ---- SF Metadata APi response ---- ///
    length: number;
    createdById: string;
    createdByName: string;
    createdDate: Date;
    fileName: string;
    fullName: string;
    id: string;
    lastModifiedById: string;
    lastModifiedByName: string;
    lastModifiedDate: Date;
    manageableState: string;
    namespacePrefix: string;
    type: string;

    // --- Additional ---- //
    readMetadataResult: any;
    updateMetadataResult: any;

    get objectName(): string {
        if (this.readMetadataResult) {
            switch (this.type) {
                case 'Flow':
                    this.readMetadataResult.processMetadataValues = [].concat(this.readMetadataResult.processMetadataValues);
                    let mt = this.readMetadataResult.processMetadataValues.find((item: any) => item.name == 'ObjectType');
                    if (mt) {
                        return mt.value.stringValue;
                    }
                    break;

            }
        }
        return '';
    }

    get triggerType(): string {
        if (this.readMetadataResult) {
            switch (this.type) {
                case 'Flow':
                    this.readMetadataResult.processMetadataValues = [].concat(this.readMetadataResult.processMetadataValues);
                    let mt = this.readMetadataResult.processMetadataValues.find((item: any) => item.name == 'TriggerType');
                    if (mt) {
                        return mt.value.stringValue;
                    }
                    break;
            }
        }
        return '';
    }

    get shortName(): string {
        switch (this.type) {
            default:
                return this.fullName;

        }
    }

    get status(): string {
        if (this.readMetadataResult) {
            switch (this.type) {
                default:
                    return this.readMetadataResult.status;
            }
        }
        return '';
    }

    get activeVersionNumber(): number {
        if (this.data && this.data.length > 0) {
            return +(this.data[0]['ActiveVersion.VersionNumber'] || '0');
        }
    }

    constructor(init?: Partial<MetadataDefinitionItem>) {
        super(init);
        if (init) {
            Object.assign(this, init);
            this.lastModifiedDate = typeof this.lastModifiedDate == 'string'
                && new Date(this.lastModifiedDate) || this.lastModifiedDate;
            this.createdDate = typeof this.createdDate == 'string'
                && new Date(this.createdDate) || this.createdDate;
        }
    }
}
