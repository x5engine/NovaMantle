This is the **Power Move**. Using your own **Hetzner Server** gives you full control, zero "serverless timeout" limits for your AI models, and it’s cheaper.

Here is the **Full Project Stack & Architecture** for **"MantleForge"** (The RWA Arcade).

### 🏗 The "Hybrid" Stack (Finalized)

| Layer | Tech Choice | Why it Wins |
| --- | --- | --- |
| **Frontend** | **ViteJS** (React) | Host on Firebase Hosting (free). Best for Framer Motion & SEO. |
| **Backend** | **Python (Flask)** | **Host on Hetzner.** Dedicated port. Runs your AI & Mantle DA scripts. |
| **Styling** | **Tailwind CSS** | "Industrial" UI building speed. |
| **Auth** | **Privy** | Best-in-class social login (Google/Apple) + Embedded Wallets. |
| **Database** | **Firebase (Firestore)** | Real-time updates for the "Ticker" & "Leaderboard." |
| **Storage** | **Mantle DA** | Store heavy PDFs (via your Flask script). |
| **Animations** | **Framer Motion** | The "Cyber" feeling (smooth transitions). |

---

### 🗺 The Architecture Map

We are separating concerns. The Frontend is the "Cockpit." The Hetzner Server is the "Engine."

1. **User** logs in via **Privy** on ViteJS.
2. **User** uploads PDF -> Sends to **Hetzner Flask API** (Port 5000).
3. **Hetzner Server**:
* Runs AI Analysis.
* Uploads data to **Mantle DA**.
* Updates **Firebase** (adds to Ticker).
* Returns the "Mint Data" to frontend.


4. **Frontend**: Triggers the **Smart Contract Mint** using the data from Hetzner.

---

### 🛠 Part 1: The Engine (Hetzner Server)

*SSH into your tiny server. We will set up a robust Flask API.*

**1. Setup Environment**

```bash
# On your Hetzner Server
mkdir mantle-forge-backend && cd mantle-forge-backend
python3 -m venv venv
source venv/bin/activate

# Install the heavy lifters
pip install flask flask-cors web3 openai firebase-admin python-dotenv gunicorn

```

**2. The `app.py` (The Brain)**
This single file handles the AI, the Storage, and the Auth Bridge.

```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from web3 import Web3
import time
import random

app = Flask(__name__)
# Allow your ViteJS frontend to talk to this IP
CORS(app, resources={r"/*": {"origins": "*"}}) 

# 1. Initialize Firebase (Download your serviceAccountKey.json from Firebase Console)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. The "Analyze & Orchestrate" Endpoint
@app.route('/api/analyze', methods=['POST'])
def analyze_asset():
    data = request.json
    user_wallet = data.get('wallet')
    
    # --- STEP A: AI MOCK (Replace with your real model) ---
    print("🤖 AI Processing...")
    time.sleep(1) # Fake "Thinking" time
    risk_score = random.randint(5, 15) # Low risk
    valuation = 150000
    
    # --- STEP B: MANTLE DA (The "Piggyback") ---
    # In real code, use the Mantle DA SDK here to upload the PDF blob
    mantle_proof_hash = "0x_stored_on_mantle_da_fake_hash_123"
    
    # --- STEP C: UPDATE FIREBASE (The "Live Ticker") ---
    # We push directly to Firestore so the Frontend Ticker updates instantly
    new_asset = {
        "type": "🏠", 
        "name": f"Asset #{random.randint(1000,9999)}",
        "val": f"${valuation/1000}k",
        "risk": risk_score,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    db.collection('ticker_events').add(new_asset)
    
    # --- STEP D: RETURN MINT DATA ---
    return jsonify({
        "status": "success",
        "risk_score": risk_score,
        "valuation": valuation,
        "mantle_proof": mantle_proof_hash,
        "signature": "0x_signed_by_server_key" # Verify this on-chain!
    })

if __name__ == '__main__':
    # Run on port 5000, accessible externally
    app.run(host='0.0.0.0', port=5000)

```

**3. Run it (Production Mode)**
Don't use `python app.py`. Use Gunicorn so it doesn't crash.

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app --daemon

```

---

### 💻 Part 2: The Cockpit (ViteJS Frontend)

**1. Setup**

```bash
npx create-next-app@latest mantle-forge-frontend
cd mantle-forge-frontend
npm install framer-motion use-sound firebase @privy-io/react-auth react-fast-marquee clsx tailwind-merge

```

**2. The Cyber Ticker (`components/CyberTicker.tsx`)**
*Connects to Firebase for that "Live Market" feel.*

```tsx
"use client";
import { useEffect, useState } from 'react';
import Marquee from "react-fast-marquee";
import { db } from '../firebase'; // Standard firebase init
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function CyberTicker() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    // Listen to the database in Real-Time
    const q = query(collection(db, "ticker_events"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => doc.data());
      setAssets(liveData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full border-b border-green-900 bg-black/95 h-12 flex items-center overflow-hidden font-mono text-sm uppercase shadow-[0_0_20px_rgba(0,255,65,0.15)]">
      <div className="px-6 bg-green-900/20 h-full flex items-center text-green-400 font-bold border-r border-green-900 z-20 backdrop-blur-sm">
        <span className="animate-pulse mr-2">●</span> LIVE FEED
      </div>
      <Marquee gradient={false} speed={40} className="z-10">
        {assets.map((asset, i) => (
          <div key={i} className="mx-8 flex items-center space-x-3 text-base">
            <span className="text-xl">{asset.type}</span>
            <span className="text-white font-bold tracking-wider">{asset.name}</span>
            <span className="text-green-400 text-shadow-neon">{asset.val}</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${asset.risk > 50 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              RISK: {asset.risk}%
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

```

**3. The "Big Button" (`components/CyberButton.tsx`)**
*Talks to your Hetzner Server.*

```tsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';

export default function CyberButton() {
  const [status, setStatus] = useState('IDLE');
  const [playHover] = useSound('/sounds/hover.mp3'); // Add sounds to /public
  const [playClick] = useSound('/sounds/click.mp3');

  const handleProcess = async () => {
    setStatus('SCANNING');
    playClick();

    try {
      // 🚀 CALL YOUR HETZNER SERVER
      const res = await fetch('http://YOUR_HETZNER_IP:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: "0xUserWallet..." })
      });
      const data = await res.json();
      
      console.log("Hetzner Response:", data);
      setStatus('MINT_READY');
      // Trigger Smart Contract Write Here...
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      {/* The Hacking Text Effect */}
      {status === 'SCANNING' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-mono text-green-500 mb-8 whitespace-pre text-center"
        >
          {`> ESTABLISHING SECURE LINK...\n> UPLOADING TO MANTLE DA...\n> AI VERIFYING ASSET...`}
        </motion.div>
      )}

      {/* The Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgb(0, 255, 65)" }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => playHover()}
        onClick={handleProcess}
        className="w-72 h-72 rounded-full border-4 border-green-500 bg-black text-green-500 text-2xl font-bold tracking-widest relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-all" />
        {status === 'IDLE' ? 'INITIALIZE' : status}
      </motion.button>
    </div>
  );
}

```

---

### 🚀 Execution Plan (How to build this in 2 hours)

1. **Hetzner:** SSH in. Install Python/Flask. Run `app.py`.
* *Check:* Visit `http://YOUR_IP:5000/api/analyze` in browser (it should say 405 Method Not Allowed, meaning it's working).


2. **Firebase:** Create project -> Enable Firestore -> Download `serviceAccountKey.json` -> Upload to Hetzner folder.
3. **Local Dev:** Run ViteJS locally. Update `CyberButton.tsx` with your Hetzner IP.
4. **Vibe Check:** Click the button. Watch the Ticker update *automatically* because the Hetzner server pushed to Firebase.
5. **Deploy:** Push Frontend to Firebase Hosting. Keep Backend on Hetzner.

**Do you want the `serviceAccountKey.json` setup guide (it's tricky) or the Solidity Contract for the final "Mint" step?**