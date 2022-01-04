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
exports.connection = exports.ConnectionManager = void 0;
const schemas_1 = require("@dcl/schemas");
const connectors_1 = require("./connectors");
const storage_1 = require("./storage");
const types_1 = require("./types");
const configuration_1 = require("./configuration");
const ProviderAdapter_1 = require("./ProviderAdapter");
require("./declarations");
class ConnectionManager {
    constructor(storage) {
        this.storage = storage;
    }
    connect(providerType, chainId = schemas_1.ChainId.ETHEREUM_MAINNET) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setConnectionData(providerType, chainId);
            this.connector = this.buildConnector(providerType, chainId);
            const { provider, account } = yield this.connector.activate();
            return {
                provider: ProviderAdapter_1.ProviderAdapter.adapt(provider),
                providerType,
                account: account || '',
                chainId
            };
        });
    }
    tryPreviousConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionData = this.getConnectionData();
            if (!connectionData) {
                throw new Error('Could not find a valid provider. Make sure to call the `connect` method first');
            }
            return this.connect(connectionData.providerType, connectionData.chainId);
        });
    }
    getAvailableProviders() {
        const available = [types_1.ProviderType.FORTMATIC, types_1.ProviderType.WALLET_CONNECT];
        if (typeof window !== 'undefined' && window.ethereum !== undefined) {
            available.unshift(types_1.ProviderType.INJECTED);
        }
        return available;
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connector) {
                this.connector.deactivate();
                if (this.isClosableConnector()) {
                    yield this.connector.close();
                }
                const { storageKey } = configuration_1.getConfiguration();
                this.storage.remove(storageKey);
                this.connector = undefined;
            }
        });
    }
    getProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connector) {
                throw new Error('No valid connector found. Please .connect() first');
            }
            return this.connector.getProvider();
        });
    }
    createProvider(providerType, chainId = schemas_1.ChainId.ETHEREUM_MAINNET) {
        return __awaiter(this, void 0, void 0, function* () {
            const connector = this.buildConnector(providerType, chainId);
            const provider = yield connector.getProvider();
            return ProviderAdapter_1.ProviderAdapter.adapt(provider);
        });
    }
    buildConnector(providerType, chainId) {
        switch (providerType) {
            case types_1.ProviderType.INJECTED:
                return new connectors_1.InjectedConnector(chainId);
            case types_1.ProviderType.FORTMATIC:
                return new connectors_1.FortmaticConnector(chainId);
            case types_1.ProviderType.WALLET_CONNECT:
                return new connectors_1.WalletConnectConnector();
            case types_1.ProviderType.NETWORK:
                return new connectors_1.NetworkConnector(chainId);
            default:
                throw new Error(`Invalid provider ${providerType}`);
        }
    }
    getConnectionData() {
        const { storageKey } = configuration_1.getConfiguration();
        const connectionData = this.storage.get(storageKey);
        return connectionData ? JSON.parse(connectionData) : undefined;
    }
    setConnectionData(providerType, chainId) {
        const { storageKey } = configuration_1.getConfiguration();
        const connectionData = JSON.stringify({
            providerType,
            chainId
        });
        this.storage.set(storageKey, connectionData);
    }
    isClosableConnector() {
        return this.connector && typeof this.connector['close'] !== 'undefined';
    }
}
exports.ConnectionManager = ConnectionManager;
exports.connection = new ConnectionManager(new storage_1.LocalStorage());
//# sourceMappingURL=ConnectionManager.js.map
