"use client"
import { LockIcon, ShieldIcon, KeyIcon, ServerIcon, UserIcon, CodeIcon } from 'lucide-react'
import * as ethers from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { blockImg} from "../public/block.svg"
import Image from 'next/image';

export default function LandingPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          router.push("/mySecrets");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      if(address) {
        router.push("/mySecrets");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  }

  const connectWallet2 = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(account[0]); 
      if(account) {
        router.push("/mySecrets");
      }
    } catch (error) {
      console.error('Wallet connection failed:', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const ConnectButton = ({ className = "", size = "default" }) => (
    <button 
      onClick={connectWallet2}
      disabled={isConnecting}
      className={`${className} relative inline-flex items-center justify-center transition-all duration-300 ${
        isConnecting ? 'bg-orange-400 cursor-not-allowed' : 'bg-[#0000ff] hover:bg-[#0000ff9e]'
      } ${size === "large" ? 'text-lg px-8 py-4' : 'px-4 py-2'}`}
    >
      {isConnecting ? (
        <>
          <span className="animate-pulse mr-2">Connecting...</span>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </>
      ) : walletAddress ? (
        shortenAddress(walletAddress)
      ) : (
        "Connect Wallet"
      )}
    </button>
  );

  const features = [
    { 
      title: "Encrypted Storage", 
      description: "Your secrets are encrypted using Lit Protocol's advanced cryptographic network. Each secret is encrypted with unique access conditions that you define.", 
      icon: <LockIcon className="w-8 h-8 mb-4 text-orange-600" color='#ea580b'/> 
    },
    { 
      title: "Decentralized Security", 
      description: "Leverage Lit Protocol's decentralized node network for encryption and access control. No single point of failure and no central authority.", 
      icon: <ShieldIcon className="w-8 h-8 mb-4 text-orange-600" color='#ea580b'/> 
    },
    { 
      title: "Programmable Access", 
      description: "Define complex access conditions using Lit Actions. Control who can access your secrets based on wallet addresses, token ownership, or custom logic.", 
      icon: <KeyIcon className="w-8 h-8 mb-4 text-orange-600" color='#ea580b'/> 
    },
  ];

  const whyChooseItems = [
    {
      title: "Safe Encryption",
      description: "Your secrets are protected using advanced cryptographic techniques that are resistant to attacks."
    },
    {
      title: "Conditional Access",
      description: "Grant access to secrets based on on-chain conditions, NFT ownership, DAO membership, or custom criteria."
    },
    {
      title: "Cross-Chain Compatibility",
      description: "Works seamlessly across multiple blockchain networks with unified access control."
    }
  ];

  const useCases = [
    {
      title: "Secure Key Management",
      description: "Store API keys, private keys, and sensitive credentials with programmatic access control."
    },
    {
      title: "DAO Governance",
      description: "Manage privileged access to DAO resources and sensitive organizational information."
    },
    {
      title: "DApp Security",
      description: "Protect user data and application secrets in decentralized applications."
    }
  ];

  return (
    <div className="bg-zinc-900 dark:bg-white inset-0 h-full w-full bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
      <header className="bg-black/50 backdrop-blur-sm fixed top-0 w-full z-50 shadow-sm" style={{
        borderBottom:"0.1px solid #ffffff45"
      }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            {/* <LockIcon className="w-6 h-6 text-orange-600" /> */}
            <Image src='./block.svg' height="40" width="40" alt="Block Image" style={{color:"orange"}}/>
            Lit Secrets manager
          </h1>
          <ConnectButton className="text-white rounded-md shadow-md hover:shadow-lg" />
        </div>
      </header>

      <main className="container mx-auto px-4 pt-36 pb-12">
        <section className="text-center mb-20 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-blue-600 leading-tight">
            Secure Your Secrets with{" "}
            <span className="text-orange-600/90 relative">
              Lit Protocol
              <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-600/20"></span>
            </span>
          </h2>
          <p className="text-xl mb-8 text-white/65 leading-relaxed">
            The decentralized secret manager powered by Lit Protocol encryption network.
            Store, manage, and share your sensitive data with confidence.
          </p>
          <ConnectButton 
            className="text-white rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1" 
            size="large"
          />
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#0000ff]/85 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* <section className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Choose Lit Protocol?</h3>
            <ul className="space-y-6">
              {whyChooseItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-orange-600 mr-3">•</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Use Cases</h3>
            <ul className="space-y-6">
              {useCases.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-orange-600 mr-3">•</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section> */}

        <section className="bg-[#0000ff]/90 p-12 rounded-xl shadow-xl mb-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-white/85">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90 text-white/80">
              Join the growing community of developers and organizations securing their secrets with Lit Protocol.
            </p>
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className={`px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-white hover:text-orange-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
                isConnecting ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              {isConnecting ? (
                <span className="flex items-center">
                  <span className="animate-pulse mr-2">Connecting...</span>
                  <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                </span>
              ) : (
                "Connect Wallet to Begin"
              )}
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-black/50 shadow-md mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-white">
            <p className="mb-2 flex text-white items-center justify-center gap-2">
              <ShieldIcon className="w-4 h-4 text-orange-600" />
              Built on Lit Protocol
            </p>
            <p className="text-sm text-white">© 2024 Lit Secrets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}