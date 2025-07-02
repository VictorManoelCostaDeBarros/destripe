import { useEffect, useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, usePublicClient } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { ethers } from 'ethers';
import destripeCollectionAbi from './abi/DestripeCollection.json';
import destripeAbi from './abi/Destripe.json';

const DESTRIPE_COLLECTION_ADDRESS = '0x4b0472D7fA02bBf89800CBdD32cD172BF11310a7';
const DESTRIPE_ADDRESS = '0x2873A25f24EB9DF14dCfEa31C75bCda32FB6fa57';

const config = getDefaultConfig({
  appName: 'Destripe',
  projectId: 'destripe-app',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

function getTimeLeft(targetTimestamp: number) {
  const now = Math.floor(Date.now() / 1000);
  let diff = targetTimestamp - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (60 * 60 * 24));
  const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds };
}

function AppContent() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [hasNft, setHasNft] = useState<boolean | null>(null);
  const [nextPayment, setNextPayment] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const checkNftAndPayment = async () => {
      if (!isConnected || !address || !publicClient) {
        setHasNft(null);
        setNextPayment(null);
        return;
      }
      setLoading(true);
      try {
        const ethersProvider = new ethers.JsonRpcProvider(publicClient.transport.url);
        const nftContract = new ethers.Contract(
          DESTRIPE_COLLECTION_ADDRESS,
          destripeCollectionAbi,
          ethersProvider
        );
        const balance = await nftContract.balanceOf(address);
        if (balance > 0) {
          setHasNft(true);
          const destripeContract = new ethers.Contract(
            DESTRIPE_ADDRESS,
            destripeAbi,
            ethersProvider
          );
          const paymentInfo = await destripeContract.payments(address);
          setNextPayment(Number(paymentInfo.nextPayment));
        } else {
          setHasNft(false);
          setNextPayment(null);
        }
      } catch (err) {
        setHasNft(false);
        setNextPayment(null);
      }
      setLoading(false);
    };
    checkNftAndPayment();
  }, [isConnected, address, publicClient]);

  // Countdown timer for next payment
  useEffect(() => {
    if (!nextPayment) {
      setTimeLeft(null);
      return;
    }
    const update = () => setTimeLeft(getTimeLeft(nextPayment));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPayment]);

  if (!publicClient) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
      <div style={{ maxWidth: 400, width: '100%', padding: 32, border: '1px solid #333', borderRadius: 16, background: '#18181b', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)', color: '#f3f4f6' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: 28, letterSpacing: -1, color: '#fff' }}>Destripe Login</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
        {loading && <p style={{ textAlign: 'center', color: '#cbd5e1' }}>Loading...</p>}
        {!loading && isConnected && hasNft === false && (
          <p style={{ color: '#f87171', marginTop: 24, textAlign: 'center' }}>You do not have an account.</p>
        )}
        {!loading && isConnected && hasNft && nextPayment && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: '#4ade80', fontWeight: 600 }}>You have an account!</p>
            <p style={{ color: '#cbd5e1' }}>Next payment due:</p>
            <b style={{ color: '#fff' }}>{new Date(nextPayment * 1000).toLocaleString()}</b>
            {timeLeft && (
              <div style={{ marginTop: 12, fontSize: 16, color: '#cbd5e1' }}>
                <span>Time left: </span>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
