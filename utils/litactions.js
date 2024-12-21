import LitJsSdk from 'lit-js-sdk';

let litNodeClient = null;
let userAuthSig = null;

// Connect to Lit Protocol Node
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

// Authenticate User (Signs a message to prove wallet ownership)
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

// Sign Transaction (Use Lit Node's MPC to sign transaction data)
const signTransaction = async (transactionData) => {
  try {
    if (!litNodeClient) await connectLit(); // Ensure Lit is connected
    const signedData = await litNodeClient.executeJs({
      code: `
        const go = async () => {
          const sigShare = await LitActions.signEcdsa({
            toSign: [${transactionData}], 
            publicKey: '${userAuthSig.publicKey}', 
            sigName: 'mySig'
          });
        }
      `,
      authSig: userAuthSig,
    });
    console.log('✅ Transaction signed successfully:', signedData);
    return signedData;
  } catch (error) {
    console.error('❌ Error signing transaction:', error);
  }
};

// Disconnect Wallet (Clears user authentication and connection)
const disconnectWallet = () => {
  userAuthSig = null;
  litNodeClient = null;
  console.log('✅ Disconnected from Lit Protocol');
};

export { connectLit, authenticateUser, signTransaction, disconnectWallet };
