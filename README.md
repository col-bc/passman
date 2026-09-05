# Passman

A full-stack credential vault engineered with a Zero-Knowledge Architecture to ensure user data remains confidential even from the server. 

Instead of relying on traditional server-side encryption, Passman leverages the browser's Web Crypto API to encrypt and decrypt sensitive payloads on the client side before they ever travel over the network. 

## 🚀 Key Features

* **Zero-Knowledge Encryption:** Implements strict client-side AES-256-GCM encryption (`src/lib/crypto.ts`). The server only stores and routes ciphertext.
* **Real-Time Security Center:** A dedicated dashboard that audits credential health, flagging weak, reused, and breached passwords across the user's vault (`src/components/presentation/securityCenter/`).
* **Dynamic Item Schemas:** Support for multiple credential types (Logins, Secure Notes, Credit Cards) organized into customizable "Lockers."
* **Advanced Auth Protection:** Integrated Cloudflare Turnstile CAPTCHA to mitigate automated credential stuffing and brute-force attacks (`src/lib/util/turnstile.ts`).
* **Secure Password Generation:** Built-in cryptographic password generator utilizing the EFF large wordlist for memorable passphrase creation (`src/components/util/passwordGenerator.tsx`).

## 🛠️ Architecture & Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Backend:** Next.js Server Actions, Prisma ORM (`src/lib/prisma.ts`)
* **Database:** Relational database management via Prisma Migrations
* **Cryptography:** Native Web Crypto API (PBKDF2, AES-256-GCM)

## 💻 Local Development

To run this application locally, ensure you have Node.js installed and a relational database available (e.g., PostgreSQL or SQLite).

**1. Clone and Install**
\`\`\`bash
git clone https://github.com/col-bc/passman.git
cd passman
npm install
\`\`\`

**2. Environment Configuration**
Create a \`.env\` file in the root directory and add your database connection string and Cloudflare Turnstile keys:
\`\`\`env
DATABASE_URL="your_database_url_here"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_site_key"
TURNSTILE_SECRET_KEY="your_secret_key"
\`\`\`

**3. Database Setup**
Initialize the Prisma client and push the schema to your database:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

**4. Run the Server**
\`\`\`bash
npm run dev
\`\`\`
The application will be available at `http://localhost:3000`.

---

© 2026 Colby Cooper. All Rights Reserved. 
*This repository is for portfolio demonstration purposes only. Unauthorized copying, modification, or distribution is prohibited.*
