"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConnector = exports.RPC_URLS = void 0;
const schemas_1 = require("@dcl/schemas");
const network_connector_1 = require("@web3-react/network-connector");
exports.RPC_URLS = Object.freeze({
    [schemas_1.ChainId.ETHEREUM_MAINNET]: 'https://mainnet.infura.io/v3/21ee2680fd58460ba96d2b3addd7c38c',
    [schemas_1.ChainId.ETHEREUM_ROPSTEN]: 'https://ropsten.infura.io/v3/21ee2680fd58460ba96d2b3addd7c38c',
    [schemas_1.ChainId.ETHEREUM_RINKEBY]: 'https://rinkeby.infura.io/v3/21ee2680fd58460ba96d2b3addd7c38c',
    [schemas_1.ChainId.ETHEREUM_GOERLI]: 'https://goerli.infura.io/v3/21ee2680fd58460ba96d2b3addd7c38c',
    [schemas_1.ChainId.ETHEREUM_KOVAN]: 'https://kovan.infura.io/v3/21ee2680fd58460ba96d2b3addd7c38c',
    [schemas_1.ChainId.MATIC_MAINNET]: 'https://rpc-mainnet.maticvigil.com/v1/aad675783e3f73a13efbf6e95338d6de7fd5c9b9',
    [schemas_1.ChainId.MATIC_MUMBAI]: 'https://rpc-mumbai.maticvigil.com/v1/aad675783e3f73a13efbf6e95338d6de7fd5c9b9'
});
class NetworkConnector extends network_connector_1.NetworkConnector {
    constructor(chainId) {
        super({ urls: exports.RPC_URLS, defaultChainId: chainId });
    }
}
exports.NetworkConnector = NetworkConnector;
//# sourceMappingURL=NetworkConnector.js.map
