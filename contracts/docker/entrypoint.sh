#!/bin/sh

# cd ..
# print the path of the current working dir
echo "Current working directory: $(pwd)"

if [ "$NETWORK" = "localhost" ]; then
    echo "Current working directory: $(pwd)"
    npx hardhat node &

    while ! wget -q --spider http://0.0.0.0:8545; do   
      sleep 1
    done

    npx hardhat ignition deploy ignition/modules/CertificateRegistry.ts --network localhost
    cp ignition/deployments/chain-31337/deployed_addresses.json /shared/.
    cp ignition/deployments/chain-31337/artifacts/CertificateRegistryModule#CertificateRegistry.json /shared/CertificateRegistry.json
    touch /shared/.ready
    wait

else 
    npx hardhat ignition deploy ignition/modules/CertificateRegistry.ts --network $NETWORK
    cp ignition/deployments/chain-${NETWORK_ID}/deployed_addresses.json /shared/.
    cp ignition/deployments/chain-${NETWORK_ID}/artifacts/CertificateRegistryModule#CertificateRegistry.json /shared/CertificateRegistry.json
    touch /shared/.ready
fi
