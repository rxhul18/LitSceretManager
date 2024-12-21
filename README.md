# 🔐 Hackathon Project at ETHIndia 2024: **Secure AI Crypto Solutions**

Welcome to our project repository! 🚀 At ETHIndia 2024, we tackled some exciting challenges in the world of crypto and AI integration. Here's a quick overview of our journey, challenges, and solutions.

---

## 🛠️ **Tech Stack**

We built this solution using the following technologies:

- **Frontend:** [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Crypto Integration:** [MetaMask](https://metamask.io/)
- **AI Processing:** [Ollama](https://ollama.com/)
- **Encryption Tools:** [Lit Protocol](https://litprotocol.com/)

---
## 🌐 **How to Run Locally**

1. Clone the repository:
   ```bash
   git clone https://github.com/rxhul18/LitSceretManager.git
   cd LitSceretManager
   npm install
   npm run dev
   ``` 
2. Ollama must be install and runing in background to get access of AI agent

3. **Environment Configuration:**

   Create a `.env` file in the root directory and add your configuration:

   ```env
   NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY = <Your private Key of connected public key>
   NEXT_APP_PUBLIC_LIT_CAPACITY_CREDIT_TOKEN_ID= (optional)
   ```
**Start the Project:**

   ```bash
   npm run dev
   ```
---

## ⚡ **Key Challenges and Solutions**

### 1. **Key Encryption and Decryption Not Matching**
**What Happened:**  
While using Lit Protocol’s encryption tools, the secret key we encrypted didn’t match the original once decrypted.  

**How We Fixed It:**  
- Discovered that incompatible key formats caused the mismatch.  
- Aligned encryption and decryption processes to use compatible formats.  
- Adopted Lit Protocol’s recommended encryption methods for seamless functionality.

---

### 2. **Slow AI Performance with Crypto Transactions**
**What Happened:**  
Integrating AI models to optimize crypto transactions led to significant slowdowns, with real-time analysis causing delays.  

**How We Fixed It:**  
- Introduced **parallel processing** for AI tasks.  
- Streamlined data flow and simplified AI models to maintain accuracy while boosting speed.  
- Achieved faster responses without compromising crypto analytics quality.

---

### 3. **Datil Testnet Connectivity Issues**
**What Happened:**  
Intermittent connectivity with the Datil testnet created difficulties in testing key management and transactions.  

**How We Fixed It:**  
- Identified **API rate limits** and slow server responses as the primary issues.  
- Implemented **retry mechanisms** and robust error handling to stabilize the system during testing.

---

# 🏆 **Our ETHIndia Journey**

This project was a collaborative effort, where we explored innovative ways to merge AI and crypto technologies while ensuring security and efficiency. We’re proud of the solutions we built, the challenges we overcame, and the recognition we received!  

💡 **Milestones Achieved:**  
- We were one of the **first teams to use Lit Protocol** at the event.  
- Won a **hoodie** as part of our achievements and contributions.  

ETHIndia 2024 provided a fantastic platform to innovate, learn, and showcase cutting-edge solutions in the Web3 space. 🚀  

## Contributing 🤝

We welcome contributions! Please fork the repository and create a new branch for your contributions. Submit a pull request once you're done.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request

## 👥 **Contributors**

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://avatars.githubusercontent.com/u/115892452?v=4" width="100" height="100" alt="Contributor 1">
        <br />
        <b>Divesh Kankani</b>
        <br />
        <a href="https://github.com/Diveshdk">Diveshdk</a>
      </td>
      <td align="center">
        <img src="https://avatars.githubusercontent.com/u/133791708?v=4" width="100" height="100" alt="Contributor 2">
        <br />
        <b>Bhavesh Choudhary</b>
        <br />
        <a href="https://github.com/Bhavesh-0909">Bhavesh-0909</a>
      </td>
      <td align="center">
        <img src="https://avatars.githubusercontent.com//u/99045557?v=4" width="100" height="100" alt="Contributor 3">
        <br />
        <b>Rahul Shah</b>
        <br />
        <a href="https://github.com/rxhul18">GitHub</a>
      </td>
    </tr>
  </table>
</div>


## Contact 📬

Feel free to reach out if you have any questions or suggestions!
