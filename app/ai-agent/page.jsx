'use client'
import React, { useEffect, useState } from 'react';
import LitJsSdk from 'lit-js-sdk';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Registering chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

let litNodeClient = null;
let userAuthSig = null;

// Connect to Lit Protocol
const connectLit = async () => {
    try {
        if (!litNodeClient) {
            console.log('Attempting to connect to Lit Node...');
            litNodeClient = new LitJsSdk.LitNodeClient();
            await litNodeClient.connect();
            console.log('✅ Lit Node connected successfully!');
        }
    } catch (error) {
        console.error('❌ Error connecting to Lit Node:', error);
    }
};

// Authenticate user via Lit Protocol
const authenticateUser = async () => {
    try {
        if (!window.ethereum) {
            console.error('❌ Ethereum provider is not available');
            return;
        }

        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' });
        userAuthSig = authSig;
        console.log('✅ User authenticated successfully!');
        return authSig;
    } catch (error) {
        console.error('❌ Error authenticating user:', error);
    }
};

// Crypto-related logic
const cryptoSymbolMappings = {
    btc: 'bitcoin',
    eth: 'ethereum',
    doge: 'dogecoin',
    ada: 'cardano',
    xrp: 'ripple',
    matic: 'polygon',
    sol: 'solana',
    bnb: 'binancecoin',
    dot: 'polkadot'
};

const extractCryptoSymbol = (query) => {
    const match = query.match(/price of (\w+)/i);
    if (!match) return null;
    const userSymbol = match[1].toLowerCase();
    return cryptoSymbolMappings[userSymbol] || userSymbol;
};

const AIResponse = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const router = useRouter();

    // Handle user query
    const handleQuery = async () => {
        try {
            setLoading(true);
            setResponse('');
            if (!query.trim()) {
                setResponse('Please enter a query');
                setLoading(false);
                return;
            }

            setChatHistory((prev) => [...prev, { text: query, sender: 'user' }]);

            if (query.toLowerCase() === 'connect') {
                await handleConnect();
                return;
            }

            if (query.toLowerCase().includes('price of')) {
                const cryptoSymbol = extractCryptoSymbol(query);
                if (!cryptoSymbol) {
                    setResponse('Please provide a valid cryptocurrency name or symbol.');
                    setLoading(false);
                    return;
                }
                const cryptoPrice = await fetchCryptoPrice(cryptoSymbol);
                setResponse(`The current price of ${cryptoSymbol} is $${cryptoPrice}`);
                setChatHistory((prev) => [
                    ...prev,
                    { text: `The current price of ${cryptoSymbol} is $${cryptoPrice}`, sender: 'ai' },
                ]);
                return;
            }

            await handleOllamaQuery(query);
        } catch (error) {
            console.error('Error in AI query:', error);
            setResponse('Failed to get a response');
        } finally {
            setLoading(false);
        }
    };

    // Fetch price of a cryptocurrency
    const fetchCryptoPrice = async (symbol) => {
        try {
            const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
            if (res.data && res.data[symbol]) {
                return res.data[symbol].usd || 'Price not found';
            } else {
                return 'Price not found';
            }
        } catch (error) {
            console.error('Error fetching crypto price:', error);
            return 'Error fetching price';
        }
    };

    // Connect to Ethereum wallet
    const handleConnect = async () => {
        setResponse('Connecting to wallet...');
        try {
            if (!window.ethereum) {
                setResponse('No Ethereum provider detected.');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length === 0) {
                setResponse('No wallet connected');
                return;
            }

            const connectedAddress = accounts[0];
            setResponse(`Connected to wallet: ${connectedAddress}`);
            await authenticateUser();
            setResponse(`Connected to wallet: ${connectedAddress} and authenticated successfully!`);
        } catch (error) {
            setResponse('Failed to connect wallet or authenticate.');
            console.error('Error connecting wallet or authenticating:', error);
        }
    };

    // Query AI agent via Ollama
    const handleOllamaQuery = async (query) => {
        try {
            const apiResponse = await fetch('http://127.0.0.1:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama3.2', prompt: query }),
            });

            if (!apiResponse.ok) {
                setResponse('Failed to get AI response');
                return;
            }

            const reader = apiResponse.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                try {
                    const parsedChunk = JSON.parse(chunk);
                    fullResponse += parsedChunk.response || '';
                    setResponse((prev) => prev + (parsedChunk.response || ''));
                } catch (error) {
                    console.error('Error parsing chunk:', error.message);
                }
            }
            setChatHistory((prev) => [...prev, { text: fullResponse, sender: 'ai' }]);
        } catch (error) {
            setResponse('Failed to get a response from Ollama');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 min-h-screen pt-24">
            <header className="bg-black/9 backdrop-blur-sm fixed top-0 w-full z-50 shadow-sm" style={{
                borderBottom:"0.1px solid #ffffff45"
            }}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    {/* <LockIcon className="w-6 h-6 text-orange-600" /> */}
                    <Image src='./block.svg' height="40" width="40" alt="Block Image" style={{color:"orange"}}/>
                    Lit Secrets manager
                </h1>
                <div className='flex gap-2'>
                    <button className="text-white bg-[#0000ff] px-5 py-2   hover:bg-[#0000ff9e] rounded-md shadow-md hover:shadow-lg"
                    onClick={()=>{
                    router.push("/mySecrets");
                    }}
                    > My Secret</button>
                    <button className="text-white bg-[#0000ff] px-5 py-2 hover:bg-[#0000ff9e] rounded-md shadow-md hover:shadow-lg"
                    onClick={()=>{
                    router.push("/");
                    }}
                    > Home </button>
                </div>
                </div>
            </header>
            <h1 className="text-4xl font-bold text-center mb-6 text-[#0000ffb3]">Chat with AI Agent</h1>
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Chat History Container */}
                <div className="space-y-6 h-[500px] overflow-y-auto mb-6 p-6 bg-gradient-to-b from-gray-50 to-white">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`relative px-6 py-4 rounded-2xl max-w-[80%] ${
                                    msg.sender === 'user' 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-black shadow-blue-100'
                                        : 'bg-gray-100 text-gray-800 shadow-gray-100'
                                } shadow-lg`}
                            >
                                <div className="text-sm md:text-base leading-relaxed text-black">
                                    {msg.text}
                                </div>
                                <div 
                                    className={`absolute bottom-0 ${
                                        msg.sender === 'user' ? 'right-0' : 'left-0'
                                    } transform translate-y-1/2 w-4 h-4 rotate-45 ${
                                        msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-center">
                            <div className="animate-pulse flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    )}
                    {response && !loading && (
                        <div className="text-center text-gray-600 italic">{response}</div>
                    )}
                </div>

                {/* Input Container */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 p-4 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                        />
                        <button
                            onClick={handleQuery}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <CryptoDashboard />
        </div>
    );
};

const CryptoDashboard = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [topGainers, setTopGainers] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch crypto data from CoinGecko
    const fetchCryptoData = async () => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                },
            });
            setCryptoData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            setLoading(false);
        }
    };

    // Fetch top gainers and losers
    const fetchTopGainers = async () => {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    order: 'percent_change_24h',
                    per_page: 5,
                    page: 1,
                },
            });
            setTopGainers(response.data);
        } catch (error) {
            console.error('Error fetching top gainers:', error);
        }
    };

    // Fetch price history for the chart
    const fetchPriceHistory = async (symbol = 'bitcoin') => {
        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: '7',
                },
            });
            setPriceHistory(response.data.prices);
        } catch (error) {
            console.error('Error fetching price history:', error);
        }
    };

    // Format price history for chart.js
    const formatChartData = (data) => {
        return {
            labels: data.map(item => new Date(item[0]).toLocaleDateString()),
            datasets: [{
                label: 'Price',
                data: data.map(item => item[1]),
                borderColor: '#00f',
                tension: 0.1,
                fill: false,
            }],
        };
    };

    useEffect(() => {
        fetchCryptoData();
        fetchTopGainers();
        fetchPriceHistory();
    }, []);

    const chartData = formatChartData(priceHistory);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-semibold mb-8 text-center">Crypto Dashboard</h1>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-black">Market Overview</h2>
                {loading ? (
                    <p className="text-xl text-gray-500 text-center">Loading...</p>
                ) : (
                    <div className="flex flex-wrap justify-center">
                        {cryptoData.map(coin => (
                            <div key={coin.id} className="m-4 p-6 border rounded-lg shadow-md w-72 bg-gray-100">
                                <h3 className="text-xl text-black font-bold">{coin.name}</h3>
                                <p className="text-lg text-black">Price: ${coin.current_price}</p>
                                <p className="text-lg text-green-500">24h Change: {coin.price_change_percentage_24h}%</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-black">Top Gainers (24h)</h2>
                <div className="flex flex-wrap justify-center">
                    {topGainers.map(coin => (
                        <div key={coin.id} className="m-4 p-6 border rounded-lg shadow-md w-72 bg-gray-100">
                            <h3 className="text-xl font-bold text-black">{coin.name}</h3>
                            <p className="text-lg text-black">Price: ${coin.current_price}</p>
                            <p className="text-lg text-green-500">24h Change: {coin.price_change_percentage_24h}%</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Price History (7 Days)</h2>
                <Line data={chartData} />
            </div>
        </div>
    );
};

export default AIResponse;
