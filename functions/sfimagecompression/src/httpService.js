import https from 'https';

export class HttpService {
    static async downloadContentVersion(options, body, logger) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(
                        new Error(
                            `Error in GET request: HTTP ${res.statusCode} ${
                                res.statusMessage
                            } - ${JSON.stringify(options)}`
                        )
                    );
                }
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                }).on('end', () => {
                    resolve(Buffer.concat(data));
                });
            });

            req.on('error', (err) => {
                reject(
                    new Error(
                        `Error in GET request: HTTP ${res.statusCode} ${
                            res.statusMessage
                        } - ${JSON.stringify(options)}`,
                        { cause: err }
                    )
                );
            });

            if (body) {
                req.write(body);
            }

            req.end();
        });
    }

    static async uploadCompressedContent(options, body, logger) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode !== 200 && res.statusCode !== 201) {
                    reject(
                        new Error(
                            `Error in POST request: HTTP ${res.statusCode} ${
                                res.statusMessage
                            } - ${JSON.stringify(options)}`
                        )
                    );
                }
                let data = '';
                res.on('data', (chunk) => {
                    data = data + chunk.toString();
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', (err) => {
                logger.error("Error: "+JSON.stringify(err, Object.getOwnPropertyNames(err)));        
                reject(
                    new Error(
                        `Error in POST request: HTTP ${res.statusCode} ${
                            res.statusMessage
                        } - ${JSON.stringify(options)}`,
                        { cause: err }
                    )
                );
            });

            if (body) {
                req.write(body);
            }

            req.end();
        });
    }
}