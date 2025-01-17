"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const WebSocket = require("isomorphic-ws");
const stream_buffers_1 = require("stream-buffers");
const ts_mockito_1 = require("ts-mockito");
const test_1 = require("../test");
const attach_1 = require("./attach");
const config_1 = require("./config");
const web_socket_handler_1 = require("./web-socket-handler");
describe('Attach', () => {
    describe('basic', () => {
        it('should correctly attach to a url', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const kc = new config_1.KubeConfig();
            const fakeWebSocket = ts_mockito_1.mock(web_socket_handler_1.WebSocketHandler);
            const attach = new attach_1.Attach(kc, ts_mockito_1.instance(fakeWebSocket));
            const osStream = new stream_buffers_1.WritableStreamBuffer();
            const errStream = new stream_buffers_1.WritableStreamBuffer();
            const isStream = new stream_buffers_1.ReadableStreamBuffer();
            const namespace = 'somenamespace';
            const pod = 'somepod';
            const container = 'somecontainer';
            yield attach.attach(namespace, pod, container, osStream, errStream, isStream, false);
            const path = `/api/v1/namespaces/${namespace}/pods/${pod}/attach`;
            let args = `container=${container}&stderr=true&stdin=true&stdout=true&tty=false`;
            ts_mockito_1.verify(fakeWebSocket.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).called();
            yield attach.attach(namespace, pod, container, null, null, null, false);
            args = `container=${container}&stderr=false&stdin=false&stdout=false&tty=false`;
            ts_mockito_1.verify(fakeWebSocket.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).called();
            yield attach.attach(namespace, pod, container, osStream, null, null, false);
            args = `container=${container}&stderr=false&stdin=false&stdout=true&tty=false`;
            ts_mockito_1.verify(fakeWebSocket.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).called();
            yield attach.attach(namespace, pod, container, osStream, errStream, null, false);
            args = `container=${container}&stderr=true&stdin=false&stdout=true&tty=false`;
            ts_mockito_1.verify(fakeWebSocket.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).called();
            yield attach.attach(namespace, pod, container, osStream, errStream, null, true);
            args = `container=${container}&stderr=true&stdin=false&stdout=true&tty=true`;
            ts_mockito_1.verify(fakeWebSocket.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).called();
        }));
        it('should correctly attach to streams', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const kc = new config_1.KubeConfig();
            const fakeWebSocketInterface = ts_mockito_1.mock(web_socket_handler_1.WebSocketHandler);
            const fakeWebSocket = ts_mockito_1.mock(WebSocket);
            const callAwaiter = new test_1.CallAwaiter();
            const attach = new attach_1.Attach(kc, ts_mockito_1.instance(fakeWebSocketInterface));
            const osStream = new test_1.ResizableWriteableStreamBuffer();
            const errStream = new stream_buffers_1.WritableStreamBuffer();
            const isStream = new stream_buffers_1.ReadableStreamBuffer();
            const namespace = 'somenamespace';
            const pod = 'somepod';
            const container = 'somecontainer';
            const path = `/api/v1/namespaces/${namespace}/pods/${pod}/attach`;
            const args = `container=${container}&stderr=true&stdin=true&stdout=true&tty=false`;
            const fakeConn = ts_mockito_1.instance(fakeWebSocket);
            ts_mockito_1.when(fakeWebSocketInterface.connect(`${path}?${args}`, null, ts_mockito_1.anyFunction())).thenResolve(fakeConn);
            ts_mockito_1.when(fakeWebSocket.send(ts_mockito_1.anything())).thenCall(callAwaiter.resolveCall('send'));
            ts_mockito_1.when(fakeWebSocket.close()).thenCall(callAwaiter.resolveCall('close'));
            yield attach.attach(namespace, pod, container, osStream, errStream, isStream, false);
            const [, , outputFn] = ts_mockito_1.capture(fakeWebSocketInterface.connect).last();
            /* tslint:disable:no-unused-expression */
            chai_1.expect(outputFn).to.not.be.null;
            // this is redundant but needed for the compiler, sigh...
            if (!outputFn) {
                return;
            }
            let buffer = Buffer.alloc(1024, 10);
            outputFn(web_socket_handler_1.WebSocketHandler.StdoutStream, buffer);
            chai_1.expect(osStream.size()).to.equal(1024);
            let buff = osStream.getContents();
            for (let i = 0; i < 1024; i++) {
                chai_1.expect(buff[i]).to.equal(10);
            }
            buffer = Buffer.alloc(1024, 20);
            outputFn(web_socket_handler_1.WebSocketHandler.StderrStream, buffer);
            chai_1.expect(errStream.size()).to.equal(1024);
            buff = errStream.getContents();
            for (let i = 0; i < 1024; i++) {
                chai_1.expect(buff[i]).to.equal(20);
            }
            const initialTerminalSize = { height: 0, width: 0 };
            yield callAwaiter.awaitCall('send');
            ts_mockito_1.verify(fakeWebSocket.send(test_1.matchBuffer(web_socket_handler_1.WebSocketHandler.ResizeStream, JSON.stringify(initialTerminalSize)))).called();
            const msg = 'This is test data';
            const inputPromise = callAwaiter.awaitCall('send');
            isStream.put(msg);
            yield inputPromise;
            ts_mockito_1.verify(fakeWebSocket.send(test_1.matchBuffer(web_socket_handler_1.WebSocketHandler.StdinStream, msg))).called();
            const terminalSize = { height: 80, width: 120 };
            const resizePromise = callAwaiter.awaitCall('send');
            osStream.rows = terminalSize.height;
            osStream.columns = terminalSize.width;
            osStream.emit('resize');
            yield resizePromise;
            ts_mockito_1.verify(fakeWebSocket.send(test_1.matchBuffer(web_socket_handler_1.WebSocketHandler.ResizeStream, JSON.stringify(terminalSize)))).called();
            const closePromise = callAwaiter.awaitCall('close');
            isStream.stop();
            yield closePromise;
            ts_mockito_1.verify(fakeWebSocket.close()).called();
        }));
    });
});
//# sourceMappingURL=attach_test.js.map