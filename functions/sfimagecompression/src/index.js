/**
 * Describe Sfcompressfiles here.
 *
 * The exported method is the entry point for your code when the function is invoked. 
 *
 * Following parameters are pre-configured and provided to your function on execution: 
 * @param event: represents the data associated with the occurrence of an event, and  
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */

 import 'dotenv/config';
 import { HttpService } from './httpService.js';
 import { sharp } from "sharp";
 
export default async function (event, context, logger) {
    logger.info(`Invoking Sfcompressfiles with payload ${JSON.stringify(event.data || {})}`);

    try {
        const files = event.data || [];
        const salesforceDocIds = [];
        for (const file of files) {
            salesforceDocIds.push(await getFileContent(file, context, logger));
        }
        return { salesforceDocIds };
    } catch (err) {
        const newError = new Error(`Failed to process documents`, {
            cause: err
        });
        logger.error(newError.toString());
        throw newError;
    }
}

async function getFileContent( file, context, logger ){
    try {
        // Download document from Salesforce
        const fileContent = await downloadSalesforceFile(
            file.contentVersionId,
            context
        );
        sharp(fileContent)
            .webp({ quality: 20 })
            .toBuffer()
            .then(data => { /* Send to salesforce */ 
            
            }).catch(err => { logger.info("Error: "+JSON.stringify(err)) });
    
    }catch (err) {
        throw new Error(`Failed to process file ${JSON.stringify(file)}`, {
            cause: err
        });
    }
}


/**
 * Downloads a document using Salesforce REST API
 * @param {string} contentVersionId
 * @param {*} context function context
 * @returns byte buffer that contains document content
 */
async function downloadSalesforceFile(contentVersionId, context) {
    const { apiVersion, domainUrl } = context.org;
    const { accessToken } = context.org.dataApi;
    const options = {
        hostname: domainUrl.substring(8), // Remove https://
        path: `/services/data/v${apiVersion}/sobjects/ContentVersion/${contentVersionId}/VersionData`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    try {
        return await HttpService.request(options);
    } catch (err) {
        throw new Error(`Failed to download Salesforce doc`, { cause: err });
    }
}
