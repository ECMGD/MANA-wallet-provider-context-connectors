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
exports.getAddEthereumChainParameters = exports.sendTransaction = exports.getTargetNetworkProvider = exports.buildWallet = exports.fetchManaBalance = exports.setTransactionsApiUrl = exports.getTransactionsApiUrl = void 0;
const eth_1 = require("web3x/eth");
const decentraland_transactions_1 = require("decentraland-transactions");
const schemas_1 = require("@dcl/schemas");
const ethers_1 = require("ethers");
const eth_2 = require("../../lib/eth");
const chainConfiguration_1 = require("../../lib/chainConfiguration");
let TRANSACTIONS_API_URL = 'https://transactions-api.decentraland.co/v1';
const getTransactionsApiUrl = () => TRANSACTIONS_API_URL;
exports.getTransactionsApiUrl = getTransactionsApiUrl;
const setTransactionsApiUrl = (url) => (TRANSACTIONS_API_URL = url);
exports.setTransactionsApiUrl = setTransactionsApiUrl;
function fetchManaBalance(chainId, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = yield eth_2.getNetworkProvider(chainId);
            const contract = decentraland_transactions_1.getContract(decentraland_transactions_1.ContractName.MANAToken, chainId);
            const mana = new ethers_1.Contract(contract.address, contract.abi, new ethers_1.providers.Web3Provider(provider));
            const balance = yield mana.balanceOf(address);
            return parseFloat(ethers_1.utils.formatEther(balance));
        }
        catch (error) {
            return 0;
        }
    });
}
exports.fetchManaBalance = fetchManaBalance;
function buildWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield eth_2.getConnectedProvider();
        if (!provider) {
            // This could happen if metamask is not installed
            throw new Error('Could not connect to Ethereum');
        }
        const eth = new eth_1.Eth(provider);
        const accounts = yield eth.getAccounts();
        if (accounts.length === 0) {
            // This could happen if metamask was not enabled
            throw new Error('Could not get address');
        }
        const address = accounts[0].toString();
        const chainId = yield eth.getId();
        const chainConfig = chainConfiguration_1.getChainConfiguration(chainId);
        const expectedChainId = eth_2.getConnectedProviderChainId();
        const expectedChainConfig = chainConfiguration_1.getChainConfiguration(expectedChainId);
        const networks = {};
        for (const network of Object.keys(expectedChainConfig.networkMapping)) {
            const networkChainId = expectedChainConfig.networkMapping[network];
            networks[network] = {
                chainId: networkChainId,
                mana: yield fetchManaBalance(networkChainId, address)
            };
        }
        return {
            address: address.toLowerCase(),
            providerType: eth_2.getConnectedProviderType(),
            networks: networks,
            network: chainConfig.network,
            chainId
        };
    });
}
exports.buildWallet = buildWallet;
function getTargetNetworkProvider(chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const networkProvider = yield eth_2.getNetworkProvider(chainId);
        return new ethers_1.providers.Web3Provider(networkProvider);
    });
}
exports.getTargetNetworkProvider = getTargetNetworkProvider;
function sendTransaction(contract, getPopulatedTransaction) {
    return __awaiter(this, void 0, void 0, function* () {
        // get connected provider
        const connectedProvider = yield eth_2.getConnectedProvider();
        if (!connectedProvider) {
            throw new Error('Provider not connected');
        }
        // get current chain id
        const chainIdHex = yield connectedProvider.request({
            method: 'eth_chainId',
            params: []
        });
        const chainId = parseInt(chainIdHex, 16);
        // get a provider for the target network
        const targetNetworkProvider = yield getTargetNetworkProvider(contract.chainId);
        // intantiate the contract
        const contractInstance = new ethers_1.Contract(contract.address, contract.abi, targetNetworkProvider);
        // populate the transaction data
        const unsignedTx = yield getPopulatedTransaction(contractInstance.populateTransaction);
        // if the connected provider is in the target network, use it to sign and send the tx
        if (chainId === contract.chainId) {
            const signer = targetNetworkProvider.getSigner();
            const tx = yield signer.sendTransaction(unsignedTx);
            return tx.hash;
        }
        else {
            // otherwise, send it as a meta tx
            const hash = yield decentraland_transactions_1.sendMetaTransaction(connectedProvider, targetNetworkProvider, unsignedTx.data, contract, {
                serverURL: exports.getTransactionsApiUrl()
            });
            return hash;
        }
    });
}
exports.sendTransaction = sendTransaction;
function getAddEthereumChainParameters(chainId) {
    const hexChainId = '0x' + chainId.toString(16);
    const chainName = schemas_1.getChainName(chainId);
    const config = chainConfiguration_1.getChainConfiguration(chainId);
    switch (chainId) {
        case schemas_1.ChainId.MATIC_MAINNET:
            return {
                chainId: hexChainId,
                chainName,
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
            };
        case schemas_1.ChainId.MATIC_MUMBAI:
            return {
                chainId: hexChainId,
                chainName,
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            };
        case schemas_1.ChainId.ETHEREUM_MAINNET:
        case schemas_1.ChainId.ETHEREUM_ROPSTEN:
        case schemas_1.ChainId.ETHEREUM_RINKEBY:
        case schemas_1.ChainId.ETHEREUM_KOVAN:
        case schemas_1.ChainId.ETHEREUM_GOERLI:
            return {
                chainId: hexChainId,
                chainName,
                nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: [config.rpcURL],
                blockExplorerUrls: ['https://etherscan.io']
            };
    }
}
exports.getAddEthereumChainParameters = getAddEthereumChainParameters;
//# sourceMappingURL=utils.js.map