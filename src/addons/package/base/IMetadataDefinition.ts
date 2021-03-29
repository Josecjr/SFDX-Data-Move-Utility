/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { IGeneralDataResponse, IMetadataDefinitionItem } from ".";

/**
 * Holds metadata description
 *
 * @export
 * @interface IMetadataDescription
 */
export default interface IMetadataDefinition extends IGeneralDataResponse {
   

    /**
     * The metadata type name, like Flow, ApexTrigger etc
     *
     * @type {string}
     */
    type: string;


    /**
     * The metadata array
     *
     * @type {*}
     */
    data: IMetadataDefinitionItem[];


}


