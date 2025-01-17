"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const stream_buffers_1 = require("stream-buffers");
const api_1 = require("./api");
const config_1 = require("./config");
const web_socket_handler_1 = require("./web-socket-handler");
describe('WebSocket', () => {
    it('should throw on unknown code', () => {
        const osStream = new stream_buffers_1.WritableStreamBuffer();
        const errStream = new stream_buffers_1.WritableStreamBuffer();
        const buff = Buffer.alloc(30, 20);
        const badStream = 10;
        chai_1.expect(() => web_socket_handler_1.WebSocketHandler.handleStandardStreams(badStream, buff, osStream, errStream)).to.throw(`Unknown stream: ${badStream}`);
    });
    it('should handle a status to end', () => {
        const osStream = new stream_buffers_1.WritableStreamBuffer();
        const errStream = new stream_buffers_1.WritableStreamBuffer();
        const status = new api_1.V1Status();
        status.message = 'Some message';
        status.reason = 'Some Reason';
        const data = JSON.stringify(status);
        const buff = Buffer.alloc(data.length);
        buff.write(data);
        const output = web_socket_handler_1.WebSocketHandler.handleStandardStreams(web_socket_handler_1.WebSocketHandler.StatusStream, buff, osStream, errStream);
        chai_1.expect(osStream.size()).to.equal(0);
        chai_1.expect(errStream.size()).to.equal(0);
        /* tslint:disable:no-unused-expression */
        chai_1.expect(output).to.not.be.null;
    });
    it('should handle empty buffers', () => {
        const osStream = new stream_buffers_1.WritableStreamBuffer();
        const errStream = new stream_buffers_1.WritableStreamBuffer();
        const buff = Buffer.alloc(0, 20);
        web_socket_handler_1.WebSocketHandler.handleStandardStreams(web_socket_handler_1.WebSocketHandler.StdoutStream, buff, osStream, errStream);
        chai_1.expect(osStream.size()).to.equal(0);
        chai_1.expect(errStream.size()).to.equal(0);
    });
    it('should handle output streams', () => {
        const osStream = new stream_buffers_1.WritableStreamBuffer();
        const errStream = new stream_buffers_1.WritableStreamBuffer();
        const fill1 = 1;
        const fill2 = 2;
        const buff1 = Buffer.alloc(1024, fill1);
        const buff2 = Buffer.alloc(512, fill2);
        web_socket_handler_1.WebSocketHandler.handleStandardStreams(web_socket_handler_1.WebSocketHandler.StdoutStream, buff1, osStream, errStream);
        chai_1.expect(osStream.size()).to.equal(1024);
        chai_1.expect(errStream.size()).to.equal(0);
        web_socket_handler_1.WebSocketHandler.handleStandardStreams(web_socket_handler_1.WebSocketHandler.StderrStream, buff2, osStream, errStream);
        chai_1.expect(osStream.size()).to.equal(1024);
        chai_1.expect(errStream.size()).to.equal(512);
        const outputBuffer1 = osStream.getContents();
        for (let i = 0; i < 1024; i++) {
            chai_1.expect(outputBuffer1[i]).to.equal(fill1);
        }
        const outputBuffer2 = errStream.getContents();
        for (let i = 0; i < 512; i++) {
            chai_1.expect(outputBuffer2[i]).to.equal(fill2);
        }
    });
    it('should throw on a config with no cluster', () => {
        const config = new config_1.KubeConfig();
        const handler = new web_socket_handler_1.WebSocketHandler(config);
        chai_1.expect(() => handler.connect('/some/path', null, null)).to.throw('No cluster is defined.');
    });
    it('should error on bad connection', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const kc = new config_1.KubeConfig();
        const server = 'foo.company.nonexistent';
        kc.clusters = [
            {
                name: 'cluster',
                server,
            },
        ];
        kc.contexts = [
            {
                cluster: 'cluster',
                user: 'user',
            },
        ];
        kc.users = [
            {
                name: 'user',
            },
        ];
        const mockWs = {};
        let uriOut = '';
        const handler = new web_socket_handler_1.WebSocketHandler(kc, (uri, opts) => {
            uriOut = uri;
            return mockWs;
        });
        const path = '/some/path';
        const promise = handler.connect(path, null, null);
        mockWs.onerror({
            error: 'some error',
            message: 'some message',
            type: 'type',
            target: mockWs,
        });
        let rejected = false;
        try {
            const val = yield promise;
        }
        catch (err) {
            rejected = true;
        }
        chai_1.expect(rejected).to.equal(true);
    }));
    it('should connect properly', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const kc = new config_1.KubeConfig();
        const host = 'foo.company.com';
        const server = `https://${host}`;
        kc.clusters = [
            {
                name: 'cluster',
                server,
            },
        ];
        kc.contexts = [
            {
                cluster: 'cluster',
                user: 'user',
            },
        ];
        kc.users = [
            {
                name: 'user',
            },
        ];
        const mockWs = {};
        let uriOut = '';
        const handler = new web_socket_handler_1.WebSocketHandler(kc, (uri, opts) => {
            uriOut = uri;
            return mockWs;
        });
        const path = '/some/path';
        const promise = handler.connect(path, null, null);
        chai_1.expect(uriOut).to.equal(`wss://${host}${path}`);
        const event = {
            target: mockWs,
        };
        mockWs.onopen(event);
        const errEvt = {
            error: {},
            message: 'some message',
            type: 'some type',
            target: mockWs,
        };
        mockWs.onmessage({
            data: 'string data',
            type: 'type',
            target: mockWs,
        });
        const buff = Buffer.alloc(10, 100);
        mockWs.onmessage({
            data: buff,
            type: 'type',
            target: mockWs,
        });
        mockWs.onerror(errEvt);
        yield promise;
    }));
    it('should connect properly with handlers', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const kc = new config_1.KubeConfig();
        const host = 'foo.company.com';
        const server = `https://${host}`;
        kc.clusters = [
            {
                name: 'cluster',
                server,
            },
        ];
        kc.contexts = [
            {
                cluster: 'cluster',
                user: 'user',
            },
        ];
        kc.users = [
            {
                name: 'user',
            },
        ];
        let closeCount = 0;
        const mockWs = {
            close: () => {
                closeCount++;
            },
        };
        let uriOut = '';
        const handler = new web_socket_handler_1.WebSocketHandler(kc, (uri, opts) => {
            uriOut = uri;
            return mockWs;
        });
        const path = '/some/path';
        let textReceived = '';
        const textHandler = (text) => {
            textReceived = text;
            return false;
        };
        let dataReceived = Buffer.alloc(0, 0);
        let streamNumber = -1;
        const binaryHandler = (stream, data) => {
            streamNumber = stream;
            dataReceived = data;
            return false;
        };
        const promise = handler.connect(path, textHandler, binaryHandler);
        chai_1.expect(uriOut).to.equal(`wss://${host}${path}`);
        const event = {
            target: mockWs,
        };
        mockWs.onopen(event);
        const errEvt = {
            error: {},
            message: 'some message',
            type: 'some type',
            target: mockWs,
        };
        mockWs.onmessage({
            data: 'string data',
            type: 'type',
            target: mockWs,
        });
        const fill = 100;
        const size = 10;
        const buff = Buffer.alloc(size, fill);
        mockWs.onmessage({
            data: buff,
            type: 'type',
            target: mockWs,
        });
        mockWs.onerror(errEvt);
        yield promise;
        chai_1.expect(closeCount).to.equal(2);
        chai_1.expect(textReceived).to.equal('string data');
        chai_1.expect(streamNumber).to.equal(fill);
        chai_1.expect(dataReceived.length).to.equal(size - 1);
        for (const datum of dataReceived) {
            chai_1.expect(datum).to.equal(fill);
        }
    }));
});
//# sourceMappingURL=web-socket-handler_test.js.map