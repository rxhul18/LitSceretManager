"use client"
import React, { useState, useEffect } from 'react'
import { Copy, Trash2 } from "lucide-react";
import { encryptApiKey, decryptApiKey } from "../../config/decrypAPI";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Secrets() {
  const [currentSecret, setCurrentSecret] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [litActionCid, setLitActionCid] = useState("");
  const [encryptedHistory, setEncryptedHistory] = useState([]);
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState(""); 
  const [ciphertext, setCiphertext] = useState("");
  const [dataToEncryptHash, setDataToEncryptHash] = useState("");

  const router = useRouter();

  useEffect(() => {
    const savedHistory = localStorage.getItem('secretsHistory');
    if (savedHistory) {
      setEncryptedHistory(JSON.parse(savedHistory));
    }
  }, []);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`Copied ${label}!`);
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      setError(`Failed to copy ${label} to clipboard`);
    }
  };

  const saveToHistory = (secretObject) => {
    const newSecret = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      litActionCid,
      secretObject
    };
    
    const updatedHistory = [...encryptedHistory, newSecret];
    setEncryptedHistory(updatedHistory);
    localStorage.setItem('secretsHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setEncryptedHistory([]);
    localStorage.removeItem('secretsHistory');
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = encryptedHistory.filter(item => item.id !== id);
    setEncryptedHistory(updatedHistory);
    localStorage.setItem('secretsHistory', JSON.stringify(updatedHistory));
  };

  const encryption = async (text) => {
    setIsLoading(true);
    setError("");
    try {
      const {ciphertext, dataToEncryptHash} = await encryptApiKey(text);
      setCiphertext(ciphertext);
      setDataToEncryptHash(dataToEncryptHash);
      setCurrentSecret({ciphertext, dataToEncryptHash});
      saveToHistory({ciphertext, dataToEncryptHash});
    } catch (err) {
      setError("Failed to encrypt secret: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const decryptData = async (encryptedData, dataToEncryptHash) => {
    setIsLoading(true);
    setError("");
    try {
      alert("decrypting data", encryptedData, dataToEncryptHash);
      const decryptedData = await decryptApiKey(encryptedData, dataToEncryptHash);
      return decryptedData;
    } catch (err) {
      setError("Failed to decrypt data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };




  const ResultBox = ({ title, content, label }) => (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-900 mb-2">{title}</div>
      <div className="relative bg-orange-50 p-4 rounded-lg break-all border border-[#0000ffb3]/20">
        <div className="pr-10 font-mono text-gray-900">{content}</div>
        <button
          onClick={() => copyToClipboard(content, label)}
          className="absolute top-2 right-2 p-2 hover:bg-orange-100 rounded"
          title={`Copy ${label}`}
        >
          <Copy className="h-4 w-4 text-gray-800" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 inset-0 h-full w-full bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] p-8">
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
              router.push("/ai-agent");
            }}
            > Crypto AI</button>
            <button className="text-white bg-[#0000ff] px-5 py-2 hover:bg-[#0000ff9e] rounded-md shadow-md hover:shadow-lg"
            onClick={()=>{
              router.push("/");
            }}
            > Home </button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl pt-20 mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-[#0000ffb3] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Encrypt Secrets</h1>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lit Action CID
              </label>
              <input
                type="text"
                placeholder="Enter Lit Action CID..."
                value={litActionCid}
                onChange={(e) => setLitActionCid(e.target.value)}
                className="w-full p-3 border border-[#0000ffb3]/20 rounded focus:ring-2 focus:ring-[#0000ffb3]/70 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Secret to Encrypt
              </label>
              <textarea
                placeholder="Enter text to encrypt..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-[#0000ffb3]/20 rounded focus:ring-2 focus:ring-[#0000ffb3]/70 focus:border-transparent outline-none text-gray-900"
                rows="3"
              />
            </div>

            <button
              onClick={() => encryption(inputText)}
              disabled={!inputText || isLoading}
              className={`w-full bg-[#0000ffb3] hover:bg-[#0000ffb3] text-white py-3 px-4 rounded transition-colors duration-200 font-medium ${
                !inputText || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Encrypt Secret"
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {copyStatus && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {copyStatus}
              </div>
            )}

            {currentSecret && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-[#0000ffb3]/20">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Secret Object:</h3>
                  <div className="relative">
                    <pre className="font-mono text-sm text-gray-900 break-all whitespace-pre-wrap">
                      {JSON.stringify(currentSecret, null, 2)}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(currentSecret), 'secret object')}
                      className="absolute top-2 right-2 p-2 hover:bg-orange-100 rounded"
                      title="Copy secret object"
                    >
                      <Copy className="h-4 w-4 text-gray-800" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {encryptedHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#0000ffb3] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Encryption History</h2>
              <button
                onClick={clearHistory}
                className="text-white hover:text-orange-100 transition-colors duration-200"
                title="Clear all history"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {encryptedHistory.map((item) => (
                <div key={item.id} className="bg-[#0000ffb3]/10 p-4 rounded-lg border border-[#0000ffb3]/20 relative">
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="absolute top-2 right-2 text-orange-800 hover:text-orange-900 transition-colors duration-200"
                    title="Delete this entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="text-sm text-gray-900 mb-2 font-medium">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">Lit Action CID:</div>
                    <div className="font-mono text-sm text-gray-900 break-all bg-white p-2 rounded">
                      {item.litActionCid}
                    </div>
                    <div className="font-semibold text-gray-900 mt-4">Secret Object:</div>
                    <pre className="font-mono text-sm text-gray-900 break-all whitespace-pre-wrap bg-white p-3 rounded">
                      {JSON.stringify(item.secretObject, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-[#0000ffb3] px-6 py-4">
            <h2 className="text-xl font-bold text-white">Decrypt Data</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Encrypted Data
              </label>
              <textarea
                placeholder="Enter encrypted data..."
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
                className="w-full p-3 border border-[#0000ffb3]/20 rounded focus:ring-2 focus:ring-[#0000ffb3]/70 focus:border-transparent outline-none text-gray-900"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Data to Encrypt Hash
              </label>
              <textarea
                placeholder="Enter data to encrypt hash..."
                value={dataToEncryptHash}
                onChange={(e) => setDataToEncryptHash(e.target.value)}
                className="w-full p-3 border border-[#0000ffb3]/20 rounded focus:ring-2 focus:ring-[#0000ffb3]/70 focus:border-transparent outline-none text-gray-900"
                rows="3"
              />
            </div>
            <button
              onClick={async () => {
                const decryptedData = await decryptData(encryptedData, dataToEncryptHash);
                if (decryptedData) {
                  setDecryptedData(decryptedData);
                } else {
                  setError("Failed to decrypt data");
                }
              }}
              disabled={!encryptedData || !dataToEncryptHash || isLoading}
              className={`w-full bg-[#0000ffb3] hover:bg-[#0000ffb3] text-white py-3 px-4 rounded transition-colors duration-200 font-medium ${
                !encryptedData || !dataToEncryptHash || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Decrypt Data"
              )}
            </button>
            {decryptedData && (
              <div className="bg-orange-50 p-4 rounded-lg border border-[#0000ffb3]/20 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Decrypted Data:</h3>
                <pre className="font-mono text-sm text-gray-900 break-all whitespace-pre-wrap">
                  {decryptedData}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}