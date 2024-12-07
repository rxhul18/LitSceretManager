"use client"
import React, { useState, useEffect } from 'react'
import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { Copy, Trash2 } from "lucide-react";

export default function Secrets() {
  const [litNodeClient, setLitNodeClient] = useState();
  const [currentSecret, setCurrentSecret] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [litActionCid, setLitActionCid] = useState("");
  const [encryptedHistory, setEncryptedHistory] = useState([]);

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

  const encryptKey = async (dataToEncrypt) => {
    try {
      setIsLoading(true);
      setError("");
      
      const accessControlConditions = [
        {
          contractAddress: "ipfs://QmVhccY3ucrAsNx1LfGSMrYrBukDGKHgLtuCqygUzfTdTk",
          standardContractType: "LitAction",
          chain: "ethereum", 
          method: "checkVal",
          parameters: [litActionCid],
          returnValueTest: {
            comparator: "=",
            value: "true",
          },
        },
      ];

      const { ciphertext, dataToEncryptHash } = await encryptString(
        {
          accessControlConditions,
          dataToEncrypt,
        },
        litNodeClient
      );
      
      const secretObject = {
        encryptedData: ciphertext,
        dataToEncryptHash
      };

      setCurrentSecret(secretObject);
      saveToHistory(secretObject);

    } catch (err) {
      setError("Failed to encrypt: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const litNodeClient = new LitNodeClient({
          litNetwork: LitNetwork.DatilDev,
          debug: false
        });
        await litNodeClient.connect();
        setLitNodeClient(litNodeClient);
      } catch (err) {
        setError("Failed to initialize: " + err.message);
      }
    };

    init();
  }, []);

  const ResultBox = ({ title, content, label }) => (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-900 mb-2">{title}</div>
      <div className="relative bg-orange-50 p-4 rounded-lg break-all border border-orange-200">
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
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-orange-600 px-6 py-4">
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
                className="w-full p-3 border border-orange-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
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
                className="w-full p-3 border border-orange-200 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                rows="3"
              />
            </div>

            <button
              onClick={() => encryptKey(inputText)}
              disabled={!inputText || isLoading}
              className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded transition-colors duration-200 font-medium ${
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
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
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
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center">
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
                <div key={item.id} className="bg-orange-50 p-4 rounded-lg border border-orange-200 relative">
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
      </div>
    </div>
  );
}