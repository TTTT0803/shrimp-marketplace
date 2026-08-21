const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ShrimpEscrowModule", (m) => {
  const shrimpEscrow = m.contract("ShrimpEscrow");
  return { shrimpEscrow };
});