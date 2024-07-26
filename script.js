const snapId = `npm:@hashgraph/hedera-wallet-snap`;

const connectButton = document.querySelector('button.connect');
connectButton.addEventListener('click', connect);

const snapAPIBtn = document.querySelector('button.snapAPI');
snapAPIBtn.addEventListener('click', handleSnapAPIRequest);

const getProvider = async () => {
  let mmFound = false;
  if ('detected' in window.ethereum) {
    for (const provider of window.ethereum.detected) {
      try {
        // Detect snaps support
        await provider.request({
          method: 'wallet_getSnaps',
        });
        // enforces MetaMask as provider
        window.ethereum.setProvider(provider);

        mmFound = true;
        return provider;
      } catch {
        // no-op
      }
    }
  }

  if (!mmFound && 'providers' in window.ethereum) {
    for (const provider of window.ethereum.providers) {
      try {
        // Detect snaps support
        await provider.request({
          method: 'wallet_getSnaps',
        });

        window.ethereum = provider;

        mmFound = true;
        return provider;
      } catch {
        // no-op
      }
    }
  }

  return window.ethereum;
};

// Get permissions to interact with and install the Hedera Wallet Snap
async function connect() {
  console.log('snap id', snapId);
  const provider = await getProvider();
  let snaps = await provider.request({
    method: 'wallet_getSnaps',
  });
  console.log('Installed snaps: ', snaps);

  try {
    const result = await provider.request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: {},
      },
    });
    console.log('result: ', result);

    snaps = await provider.request({
      method: 'wallet_getSnaps',
    });
    console.log('snaps: ', snaps);

    if (snapId in snaps) {
      // the snap is installed
      console.log('Hedera Wallet Snap is installed');
    } else {
      console.log(
        'Hedera Wallet Snap is not installed. Please install it at https://snaps.metamask.io/snap/npm/hashgraph/hedera-wallet-snap'
      );
      alert(
        'Hedera Wallet Snap is not installed. Please install it at https://snaps.metamask.io/snap/npm/hashgraph/hedera-wallet-snap'
      );
    }
  } catch (e) {
    console.log(
      `Failed to obtain installed snaps: ${JSON.stringify(e, null, 4)}`
    );
    alert(`Failed to obtain installed snaps: ${JSON.stringify(e, null, 4)}`);
  }
}

// Interact with 'hts/createToken' API of Hedera Wallet Snap
async function handleSnapAPIRequest() {
  console.log("Interacting with 'hts/createToken' API of Hedera Wallet Snap");
  try {
    const provider = await getProvider();
    const tokenName = document.getElementById('tokenName').value.toString();
    const tokenSymbol = document.getElementById('tokenSymbol').value.toString();
    const tokenDecimals = parseFloat(
      document.getElementById('tokenDecimals').value
    );

    const response = await provider.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: {
          method: 'hts/createToken',
          params: {
            network: 'testnet',
            assetType: 'TOKEN',
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            supplyType: 'INFINITE',
          },
        },
      },
    });
    const response_str = JSON.stringify(response, null, 4);
    console.log('response: ', response_str);
    if (response_str && response_str != 'null') {
      alert(response_str);
    }
  } catch (err) {
    console.error(err);
    alert('Error while interacting with the snap: ' + err.message || err);
  }
}
