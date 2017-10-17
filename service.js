// note:
// - versionable ns in CS router

const axios = require('axios');
const http = require('http');

const server = http
    .createServer((req, res) => {
        if (req.url === '/rpc') {
            const rpcResponse = {
                jsonrpc: '2.0',
                result: 'succesful oh yeah',
                id: '123',
                error: null
            };
            res.write(JSON.stringify(rpcResponse));
            return res.end();
        }
    })
    .listen(3000);

class CoreClient {
    constructor(resourceURI) {
        this._httpClient = axios.create({
            baseURL: resourceURI
        });
        for (let m of ['get', 'list', 'create', 'update', 'delete']) {
            this[m] = this.invoke.bind(this, m);
        }
    }
    custom(method, meta, params = null) {
        return this.invoke(method, meta, params);
    }
    invoke(method, meta, params = null) {
        return new Promise((resolve, reject) => {
            const { requestID } = meta;
            let payload;
            try {
                payload = JSON.stringify({
                    method,
                    params,
                    id: requestID,
                    jsonrpc: '2.0'
                });
            } catch (err) {
                reject(err);
            }
            this._httpClient
                .post('/rpc', payload)
                .then(({ data }) => {
                    const { result } = data;
                    resolve(result);
                })
                .catch(err => {
                    const rpcResponse = {
                        result: data,
                        id: requestID,
                        error: {
                            code: 'standard error code',
                            message: 'error message',
                            data: new Error('this should be a stan')
                        }
                    };
                    resolve(rpcResponse);
                });
        });
    }
}

client.request('myMethodName', args);

const client = new CoreClient('http://localhost:3000');
client.list({ _id: 'a' }).then(res => console.log(res));
client.custom('doStuff', {}).then(res => console.log(res));
