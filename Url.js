const net = require('node:net');
const tls = require('node:tls');
const fs = require('node:fs');

class Url {
    /**
     * Splits url into scheme, hostname, path and port
     * @param {string} url 
     */
    constructor(url) {
        console.assert(typeof (url) == 'string' && url.trim() != '', `passed url not a string: ${url}`);
        this.url = url;

        //handle the data scheme here because its quite different than the others
        if(url.indexOf('data:') == 0){
            this.scheme = 'data';
            let [_, rest] = url.split(':');
            console.assert(typeof(rest) == 'string' && rest.trim() != '');
            let [contentType, content] = rest.split(',');
            this.contentType = contentType;
            this.content = content;
            return;
        }
        else if(url.indexOf('view-source:') == 0){
            this.scheme = 'view-source';   
            url = url.substring(12);
        }

        let [scheme, rest] = url.split('://');

        console.assert(typeof (scheme) == 'string' && typeof rest == 'string', `malformed scheme/rest: ${scheme}://${rest}`);

        //handle file urls
        if (scheme == 'file') {
            this.scheme = scheme;
            this.path = rest;
        }
        else {
            if (!rest.includes('/'))
                rest += '/';

            let [hostname, ...path] = rest.split('/');
            console.assert(typeof (hostname) == 'string' && hostname.trim() != '', `Malformed url: ${rest}`);

            path = path.length > 1 ? path.join('/') : path[0];

            if (hostname.includes(':'))
                [hostname, this.port] = hostname.split(':');
            else
                this.port = scheme == 'https' ? 443 : 80;

            if(this.scheme != 'view-source')
                this.scheme = scheme;
            
            this.hostname = hostname;
            this.path = '/' + path;
        }

    }

    /**
     * Prints the scheme, hostname, port and path separately
     */
    print() {
        console.log(this.scheme);
        console.log(this.hostname);
        console.log(this.port);
        console.log(this.path);
    }

    /**
     * Makes a request to the url
     * @returns {Promise<object>} a promise that resolves with the response headers and content, or rejects with the error
     */
    request() {
        if (this.scheme == 'file') {
            return new Promise((resolve, reject) => {
                fs.readFile(this.path,(err,data) => {
                    if(err || !data)
                        reject({err});
                    else
                        resolve({headers: {}, response: data.toString()});
                });
            });
        }
        else if(this.scheme == 'data'){
            return new Promise((resolve,_) => {
                resolve({headers: {}, response: this.content});
            });
        }
        else {
            return new Promise((resolve, reject) => {

                let socket;

                if (this.scheme == 'https')
                    socket = new tls.TLSSocket();
                else
                    socket = new net.Socket();

                let response = [];

                socket.on('error', (err) => {
                    reject({err});
                });
                socket.on('data', (d) => {
                    response.push(...d.toString().split('\r\n'));
                });
                socket.on('end', () => {
                    socket.destroy();
                    
                    let [version, status, msg] = response.shift().split(' ');

                    let headers = {
                        [`http-version`]: version,
                        status: +status, 
                        msg
                    };
                    while (response[0] != '') {
                        let [key, ...val] = response.shift().split(':');

                        console.assert(typeof (key) == 'string' && key.trim() != '', `Weirdly formatted key/value: ${key}: ${val}`);
                        
                        val = val.length > 1 ? val.join(':') : val[0]

                        headers[key.toLowerCase()] = val.trim();

                    }
                    console.log(headers);

                    console.assert(!headers.hasOwnProperty('transfer-encoding') && !headers.hasOwnProperty('content-encoding'));
                    
                    resolve({headers,response: response.join('')});
                });

                socket.connect(
                    this.port,
                    this.hostname,
                    () => {
                        let request = `GET ${this.path} HTTP/1.1\r\n`;

                        request += `Host: ${this.hostname}\r\n`;
                        request += `Connection: close\r\n`;
                        request += `User-Agent: Moose\r\n`
                        request += '\r\n';

                        socket.write(request, (err) => {

                            if (err)
                                reject({err});

                        });
                    });

            });
        }


    }
}

module.exports = { Url };