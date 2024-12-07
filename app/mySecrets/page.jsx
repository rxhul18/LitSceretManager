"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Trash2 } from "lucide-react";

const SecretsListPage = () => {
  const [secrets, setSecrets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  
  useEffect(() => {
    const savedSecrets = localStorage.getItem('secretsHistory');
    if (savedSecrets) {
      setSecrets(JSON.parse(savedSecrets));
    }
  }, []);

  const deleteSecret = (id) => {
    const updatedSecrets = secrets.filter(secret => secret.id !== id);
    setSecrets(updatedSecrets);
    localStorage.setItem('secretsHistory', JSON.stringify(updatedSecrets));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`Copied ${label}!`);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredSecrets = secrets.filter(secret => 
    secret.litActionCid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(secret.secretObject).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SecretCard = ({ secret }) => (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="text-sm text-gray-800">
            Created on {new Date(secret.timestamp).toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => deleteSecret(secret.id)}
          className="text-gray-800 hover:text-red-600 transition-colors duration-200"
          title="Delete secret"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-900">Lit Action CID</label>
          <div className="mt-1 relative">
            <div className="bg-gray-50 rounded p-3 pr-10 font-mono text-sm break-all text-gray-900">
              {secret.litActionCid}
            </div>
            <button
              onClick={() => copyToClipboard(secret.litActionCid, 'CID')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-800 hover:text-gray-900"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">Secret Object</label>
          <div className="mt-1 relative">
            <pre className="bg-gray-50 rounded p-3 pr-10 font-mono text-sm break-all whitespace-pre-wrap text-gray-900">
              {JSON.stringify(secret.secretObject, null, 2)}
            </pre>
            <button
              onClick={() => copyToClipboard(JSON.stringify(secret.secretObject), 'secret object')}
              className="absolute right-2 top-2 text-gray-800 hover:text-gray-900"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 inset-0 h-full w-full bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Secret Objects</h1>
            <a 
              href="/createSecrets"
              className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Secret
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search secrets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Search className="h-5 w-5 text-gray-800 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Copy Status Message */}
        {copyStatus && (
          <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg">
            {copyStatus}
          </div>
        )}

        {/* Secrets Grid */}
        {filteredSecrets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredSecrets.map((secret) => (
              <SecretCard key={secret.id} secret={secret} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-900">
              {searchTerm ? 'No secrets found matching your search.' : 'No secrets created yet.'}
            </div>
            <a
              href="/createSecrets"
              className="inline-flex items-center mt-4 text-orange-600 hover:text-orange-700"
            >
              <Plus className="h-5 w-5 mr-1" />
              Create your first secret
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecretsListPage;