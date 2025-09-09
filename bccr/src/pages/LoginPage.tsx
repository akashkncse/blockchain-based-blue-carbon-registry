import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define a type for our expected API response
type AuthResponse = {
  role: 'admin' | 'ngo' | null;
  token?: string;
};

function LoginPage(): JSX.Element {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && address) {
      const authenticate = async () => {
        try {
          // Tell axios what type of data to expect back
          const { data } = await axios.post<AuthResponse>('/api/auth/login', {
            walletAddress: address,
          });

          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }

          // Redirect based on the typed role
          if (data.role === 'admin') {
            navigate('/admin');
          } else if (data.role === 'ngo') {
            navigate('/ngo');
          } else {
            navigate('/apply');
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            navigate('/apply');
          }
        }
      };

      authenticate();
    }
  }, [isConnected, address, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Carbon Credit Platform</h1>
      <p>Connect your wallet to begin.</p>
      <ConnectButton />
    </div>
  );
}

export default LoginPage;