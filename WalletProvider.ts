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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const eth_1 = require("../../lib/eth");
const utils_1 = require("../../modules/wallet/utils");
class WalletProvider extends react_1.default.PureComponent {
    constructor() {
        super(...arguments);
        this.handleChangeAccount = () => __awaiter(this, void 0, void 0, function* () {
            const { isConnected, isConnecting, address, onChangeAccount } = this.props;
            try {
                const wallet = yield utils_1.buildWallet();
                if (isConnected && !isConnecting && wallet.address !== address) {
                    onChangeAccount(wallet);
                }
            }
            catch (error) {
                // do nothing
            }
        });
        this.handleChangeNetwork = () => __awaiter(this, void 0, void 0, function* () {
            const { isConnected, isConnecting, chainId, onChangeNetwork } = this.props;
            try {
                const wallet = yield utils_1.buildWallet();
                if (isConnected && !isConnecting && wallet.chainId !== chainId) {
                    onChangeNetwork(wallet);
                }
            }
            catch (error) {
                // do nothing
            }
        });
    }
    handle(method, type, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            // try to use web3x abstraction
            const provider = yield eth_1.getConnectedProvider();
            if (provider) {
                try {
                    switch (type) {
                        case 'accountsChanged':
                            provider[method](type, handler);
                            break;
                        case 'chainChanged':
                            provider[method](type, handler);
                            break;
                        default:
                            // do nothing
                            break;
                    }
                    return; // all good, early return
                }
                catch (error) {
                    // it fails if there's legacy provider (ie. metamask legacy provider) but it shouldn't happen
                }
            }
        });
    }
    on(type, handler) {
        this.handle('on', type, handler).catch(error => console.error(error.message));
    }
    off(type, handler) {
        this.handle('removeListener', type, handler).catch(error => console.error(error.message));
    }
    componentDidMount() {
        // try to connect wallet
        const { onConnect } = this.props;
        onConnect();
        // add listeners
        this.on('accountsChanged', this.handleChangeAccount);
        this.on('chainChanged', this.handleChangeNetwork);
    }
    componentWillUnmount() {
        // remove listeners
        this.off('accountsChanged', this.handleChangeAccount);
        this.off('chainChanged', this.handleChangeNetwork);
    }
    render() {
        const { children } = this.props;
        return children;
    }
}
exports.default = WalletProvider;
//# sourceMappingURL=WalletProvider.js.map
