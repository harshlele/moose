const net = require('node:net');


class Url {
    /**
     * Splits url into scheme, hostname and path
     * @param {string} url 
     */
    constructor(url) {
        console.assert(typeof (url) == 'string');
        this.url = url;

        let [scheme, rest] = url.split('://');
        console.assert(typeof (scheme) == 'string' && typeof rest == 'string');


        if (!rest.includes('/'))
            rest += '/';

        let [hostname, path] = rest.split('/');
        console.assert(typeof (hostname) == 'string' && hostname != '');

        this.scheme = scheme;
        this.hostname = hostname;
        this.path = '/' + path;
    }

    /**
     * Prints the scheme, hostname and path separately
     */
    print() {
        console.log(this.scheme);
        console.log(this.hostname);
        console.log(this.path);
    }

    /**
     * Makes a request to the url
     * @returns a promise that resolves with the response, or rejects with the error
     */
    request() {
        return new Promise((resolve, reject) => {
            let socket = new net.Socket();
            let response = [];

            socket.on('error', (err) => {
                reject(err);
            });
            socket.on('data', (d) => {
                response.push(...d.toString().split('\r\n'));
            });
            socket.on('end', () => {
                socket.destroy();

                let [version, status, exp] = response.shift().split(' ');
                
                let headers = {};
                while(response[0] != ''){
                    let [key,val] = response.shift().split(':');
                    
                    console.assert(typeof(key) == 'string' && key != '' && typeof(val) == 'string' && val != '', `Weirdly formatted key/value: ${key}: ${val}`);
                    
                    headers[key.toLowerCase()] = val.trim();
                 
                }
                console.log(headers);
                
                console.assert(!headers.hasOwnProperty('transfer-encoding') && !headers.hasOwnProperty('content-encoding'));
                
                resolve(response.join(''));
            });

            if (this.scheme == 'http') {
                socket.connect(
                    80,
                    this.hostname,
                    () => {
                        let request = `GET ${this.path} HTTP/1.0\r\n`;
                        request += `Host: ${this.hostname}\r\n`;
                        request += '\r\n';

                        socket.write(request, (err) => {
                            if (err)
                                reject(err);
                        });
                    });
            }
        });
    }
}

module.exports = { Url };