import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DestripeModule = buildModule("DestripeModule", (m) => {
    const destripeCoin = m.contract("DestripeCoin", [m.getAccount(0)]);
    const destripeCollection = m.contract("DestripeCollection", [m.getAccount(0)]);
    const destripe = m.contract("Destripe", [destripeCoin, destripeCollection, m.getAccount(0)]);

    m.call(destripeCollection, "setAuthorizedContract", [destripe]);

    return { destripe, destripeCoin, destripeCollection };
});

export default DestripeModule;