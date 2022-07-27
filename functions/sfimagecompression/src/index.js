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

import { HttpService } from './httpService.js';
import sharp from "sharp"; 

const OriginalError = global.Error;
class Error extends OriginalError {
    constructor(msg, options) {
        super(msg);
        if (options?.cause) {
            this.cause = options.cause;
        }
    }

    toString() {
        let value = this.message;
        if (this.cause) {
            value += `\nCaused by: ${this.cause}`;
        }
        return value;
    }
}

const sharpConfiguration = { "quality": 50 };

export default async function (event, context, logger) {
    try {
        const files = event.data.files || [];
        let sharpOptions = event.data.sharpConfiguration || sharpConfiguration;
        const successCVIds = [];
        const failedCVIds = [];
        for (const file of files) {
            try{
                const contentBody = await readContentVersionData( file, context );
                const bufferResponse = await compressContentBody( file, contentBody, sharpOptions ); 
                await updateDocumentWithCompressedContent( file, bufferResponse, context, logger );
                successCVIds.push( file.contentVersionId );
            }catch(err){
                failedCVIds.push( file.contentVersionId );
            }
        }
        return { "successCVIds" : successCVIds, "failedCVIds" : failedCVIds };
    } catch (err) {
        const newError = new Error(`Failed to process documents`, {
            cause: err
        });
        logger.error(newError.toString());
        throw newError;
    }
}

async function readContentVersionData( file, context ){
    const { apiVersion, domainUrl } = context.org;
    const { accessToken } = context.org.dataApi;
    const options = {
        hostname: domainUrl.substring(8), // Remove https://
        path: `/services/data/v${apiVersion}/sobjects/ContentVersion/${file.contentVersionId}/VersionData`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    try {
        return await HttpService.downloadContentVersion(options);
    } catch (err) {
        throw new Error(`Failed to download Salesforce doc`, { cause: err });
    }
}  

async function compressContentBody( file, contentBody, sharpOptions ){
    if( file.fileExtesion === "jpg" || file.fileExtesion === "jpeg" ){
        return await sharp(contentBody).jpeg(sharpOptions).toBuffer();
    }else if( file.fileExtesion === "png" ){
        return await sharp(contentBody).png(sharpOptions).toBuffer();
    }
}

async function updateDocumentWithCompressedContent(file, bufferData, context, logger) {
    const { apiVersion, domainUrl } = context.org;
    const { accessToken } = context.org.dataApi;
    const options = {
        hostname: domainUrl.substring(8), // Remove https://
        path: `/services/data/v${apiVersion}/sobjects/ContentVersion`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json' 
        }
    };

    const contentBody = {
        "Title": file.title,
        "PathOnClient": file.title,
        "VersionData": bufferData.toString('base64'),
        "ContentDocumentId" : file.contentDocumentId,
        "IsMajorVersion" : true,
        "ReasonForChange" : "Compressed file"
      };

    try {
        const response = await HttpService.uploadCompressedContent(options, JSON.stringify( contentBody ), logger);
        logger.info( "Upload Response: "+JSON.stringify( response ) );
        return response;
    } catch (err) {
        throw new Error(`Failed to create new salesforce content version`, { cause: err });
    }
}
