"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WalletConnectConnector = exports.BaseWalletConnectConnector = exports.UserRejectedRequestError = exports.URI_AVAILABLE = void 0;
const abstract_connector_1 = require("@web3-react/abstract-connector");
const configuration_1 = require("../configuration");
const types_1 = require("../types");
exports.URI_AVAILABLE = 'URI_AVAILABLE';
class UserRejectedRequestError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = 'The user rejected the request.';
    }
}
exports.UserRejectedRequestError = UserRejectedRequestError;
function getSupportedChains({ supportedChainIds, rpc }) {
    if (supportedChainIds) {
        return supportedChainIds;
    }
    return rpc ? Object.keys(rpc).map(k => Number(k)) : undefined;
}
class BaseWalletConnectConnector extends abstract_connector_1.AbstractConnector {
    constructor(config) {
        super({ supportedChainIds: getSupportedChains(config) });
        this.config = config;
        this.handleChainChanged = this.handleChainChanged.bind(this);
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.handleDisconnect = this.handleDisconnect.bind(this);
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.walletConnectProvider) {
                const WalletConnectProvider = yield Promise.resolve().then(() => __importStar(require('@walletconnect/web3-provider'))).then(m => { var _a; return (_a = m === null || m === void 0 ? void 0 : m.default) !== null && _a !== void 0 ? _a : m; });
                this.walletConnectProvider = new WalletConnectProvider(this.config);
            }
            let account = '';
            if (!BaseWalletConnectConnector.isEnabling) {
                BaseWalletConnectConnector.isEnabling = true;
                account = yield this.walletConnectProvider
                    .enable()
                    .then((accounts) => accounts[0])
                    .catch((error) => {
                    // TODO ideally this would be a better check
                    if (error.message === 'User closed modal') {
                        throw new UserRejectedRequestError();
                    }
                    throw error;
                })
                    .finally(() => {
                    BaseWalletConnectConnector.isEnabling = false;
                });
            }
            this.walletConnectProvider.on('disconnect', this.handleDisconnect);
            this.walletConnectProvider.on('chainChanged', this.handleChainChanged);
            this.walletConnectProvider.on('accountsChanged', this.handleAccountsChanged);
            return { provider: this.walletConnectProvider, account };
        });
    }
    getProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnectProvider;
        });
    }
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnectProvider.send('eth_chainId');
        });
    }
    getAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnectProvider
                .send('eth_accounts')
                .then((accounts) => accounts[0]);
        });
    }
    deactivate() {
        if (this.walletConnectProvider) {
            this.walletConnectProvider.stop();
            this.walletConnectProvider.removeListener('disconnect', this.handleDisconnect);
            this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged);
            this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged);
        }
    }
    close() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.walletConnectProvider) === null || _a === void 0 ? void 0 : _a.close());
        });
    }
    handleChainChanged(chainId) {
        this.emitUpdate({ chainId });
    }
    handleAccountsChanged(accounts) {
        this.emitUpdate({ account: accounts[0] });
    }
    handleDisconnect() {
        this.emitDeactivate();
        // we have to do this because of a @walletconnect/web3-provider bug
        if (this.walletConnectProvider) {
            this.walletConnectProvider.stop();
            this.walletConnectProvider.removeListener('chainChanged', this.handleChainChanged);
            this.walletConnectProvider.removeListener('accountsChanged', this.handleAccountsChanged);
            this.walletConnectProvider = undefined;
        }
        this.emitDeactivate();
    }
}
exports.BaseWalletConnectConnector = BaseWalletConnectConnector;
BaseWalletConnectConnector.isEnabling = false;
class WalletConnectConnector extends BaseWalletConnectConnector {
    constructor() {
        const { urls } = configuration_1.getConfiguration()[types_1.ProviderType.WALLET_CONNECT];
        const params = {
            rpc: urls,
            qrcode: true,
            pollingInterval: 150000
        };
        super(params);
        this.params = params;
    }
    getRpc() {
        return __awaiter(this, void 0, void 0, function* () {
            const chainId = yield this.getChainId();
            return this.params.rpc[chainId];
        });
    }
    getQrCode() {
        return this.params.qrcode;
    }
    getPollingInterval() {
        return this.params.pollingInterval;
    }
}
exports.WalletConnectConnector = WalletConnectConnector;
//# sourceMappingURL=WalletConnectConnector.js.map
