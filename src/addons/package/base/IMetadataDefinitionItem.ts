/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IGeneralDataResponse } from ".";


 export default interface IMetadataDefinitionItem extends IGeneralDataResponse {
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
   
    readMetadataResult: any;
    updateMetadataResult: any;
    
    readonly shortName: string;
    readonly objectName: string;
    readonly triggerType: string;
    readonly activeVersionNumber: number;
 
 }