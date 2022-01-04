"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectedConnector = void 0;
const injected_connector_1 = require("@web3-react/injected-connector");
class InjectedConnector extends injected_connector_1.InjectedConnector {
    constructor(chainId) {
        super({
            supportedChainIds: [chainId]
        });
    }
}
exports.InjectedConnector = InjectedConnector;
//# sourceMappingURL=InjectedConnector.js.map
