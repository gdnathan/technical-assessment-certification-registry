import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificateRegistryModule", (m) => {
  const registry = m.contract("CertificateRegistry");

  if (process.env.NETWORK == "localhost") {
    m.call(registry, "addAdmin", ["0x70997970c51812dc3a010c7d01b50e0d17dc79c8"])
  } else {
    const public_key = process.env.PUBLIC_KEY
  }

  // PUBLIC DEV ACCOUNT #1

  // m.call(counter, "incBy", [5n]);

  return { registry };
});
