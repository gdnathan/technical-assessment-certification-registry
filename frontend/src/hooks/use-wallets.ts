import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletState {
  address: string | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    signer: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: 'Please install MetaMask' }));
      return;
    }

    setState(s => ({ ...s, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setState({ address, signer, isConnecting: false, error: null });
      localStorage.setItem('walletConnected', 'true');
    } catch (err: any) {
      setState(s => ({ ...s, isConnecting: false, error: err.message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, signer: null, isConnecting: false, error: null });
    localStorage.removeItem('walletConnected');
  }, []);

  useEffect(() => {
    if (localStorage.getItem('walletConnected') === 'true') {
      connect();
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', connect);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      window.ethereum?.removeListener('accountsChanged', connect);
    };
  }, [connect]);

  return { ...state, connect, disconnect };
};
