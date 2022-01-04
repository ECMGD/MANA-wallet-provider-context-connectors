"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderAdapter = void 0;
/**
 * Adapt popular provider methods to they can work across different popular web3 libs (such as web3x and ethers).
 * `sendAsync`, another popular method, is not being adapted here as we didn't find it necessary in our testing.
 * In case you need to adapt it, please create and issue or send a PR
 */
class ProviderAdapter {
    constructor(provider) {
        this.provider = provider;
        this.id = 0;
        this.on = (event, listener) => {
            return this.provider.on(event, listener);
        };
        this.emit = (event, ...args) => {
            return this.provider.emit(event, args);
        };
        this.removeListener = (event, listener) => {
            return this.provider.removeListener(event, listener);
        };
        this.request = ({ method, params }) => __awaiter(this, void 0, void 0, function* () {
            return this.isModernProvider()
                ? this.provider.request({ method, params })
                : this.send(method, params);
        });
        this.sendAsync = (args, callback) => __awaiter(this, void 0, void 0, function* () {
            return this.hasSendAsync()
                ? this.provider.sendAsync(args, callback)
                : this.send(args, callback);
        });
    }
    static adapt(provider) {
        const providerAdapter = new ProviderAdapter(provider);
        return Object.assign(Object.assign({}, provider), { on: providerAdapter.on, emit: providerAdapter.emit, removeListener: providerAdapter.removeListener, request: providerAdapter.request, sendAsync: providerAdapter.sendAsync, send: providerAdapter.send.bind(providerAdapter) });
    }
    send(methodOrArgs, paramsOrCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let method;
            let params;
            let callback;
            const hasCallback = typeof paramsOrCallback === 'function';
            if (hasCallback) {
                const args = methodOrArgs; // if sendParams is a function, the first argument has all the other data
                params = args.params || [];
                method = args.method;
                callback = paramsOrCallback;
            }
            else {
                method = methodOrArgs;
                params = paramsOrCallback || [];
                callback = (err, value) => {
                    if (err) {
                        throw err;
                    }
                    return value;
                };
            }
            if (this.isModernProvider()) {
                const [err, result] = yield this.provider
                    .request({
                    method,
                    params
                })
                    .then(result => [null, result])
                    .catch(error => [error, undefined]);
                const returnValue = hasCallback
                    ? { id: '', jsonrpc: '2.0', result }
                    : result;
                return callback(err, returnValue);
            }
            else {
                this.patchOldMobile();
                const [err, value] = hasCallback
                    ? yield new Promise(resolve => this.provider.send(methodOrArgs, (err, value) => {
                        resolve([err, value]);
                    }))
                    : yield new Promise(resolve => this.provider.send({
                        jsonrpc: '2.0',
                        id: ++this.id,
                        method,
                        params
                    }, (err, value) => {
                        resolve([
                            value && value.hasOwnProperty('error') ? value.error : err,
                            value && value.hasOwnProperty('result') ? value.result : value
                        ]);
                    }));
                return callback(err, value);
            }
        });
    }
    isModernProvider() {
        return typeof this.provider['request'] === 'function';
    }
    hasSendAsync() {
        return typeof this.provider['sendAsync'] === 'function';
    }
    patchOldMobile() {
        // Patch for old providers and mobile providers which do not use promises at send as sendAsync
        if (this.provider &&
            !this.provider.isDapper &&
            !this.provider.isFortmatic &&
            !this.provider.isMetamask &&
            this.hasSendAsync() &&
            this.provider.send !== this.provider.sendAsync) {
            // send has to be replaced by sendAsync for old providers
            this.provider.send = this.provider.sendAsync;
        }
    }
}
exports.ProviderAdapter = ProviderAdapter;
//# sourceMappingURL=ProviderAdapter.js.map
