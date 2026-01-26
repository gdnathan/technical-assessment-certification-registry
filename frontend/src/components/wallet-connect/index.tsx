import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { useWallet } from '../../hooks/use-wallets';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const WalletConnect = () => {
  const { address, isConnecting, connect, disconnect } = useWallet();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!address) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={connect}
        disabled={isConnecting}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ ml: 2 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ ml: 2 }}
      >
        {formatAddress(address)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <Typography variant="caption">{address}</Typography>
        </MenuItem>
        <MenuItem onClick={() => { disconnect(); setAnchorEl(null); }}>
          Disconnect
        </MenuItem>
      </Menu>
    </>
  );
};
