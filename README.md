# Yawar AI: Your Intelligent, Sophisticated Digital Companion

**Yawar AI** is a cutting-edge, full-stack conversational platform designed to bridge the gap between complex AI computation and an elegant user experience. Leveraging the **Google Gemini 3 Flash Preview** model, it provides a high-performance digital assistant capable of real-time brainstorming, coding assistance, and intelligent inquiry handling.

## 🌟 Key Features

* **Secure Serverless Architecture**: Utilizes a Vercel-hosted proxy to protect API credentials from client-side exposure.
* **Persistent Memory**: Maintains conversation context via a `chatHistory` array, with long-term storage powered by **Local Storage**.
* **Multi-Modal Theming**: Features a custom theme engine with **Teal**, **Amethyst**, and **Grey** modes using CSS variable injection.
* **Voice Integration**: Native support for hands-free interaction using the **Web Speech API**.
* **Advanced UI/UX**: Professional "Glassmorphism" design with responsive layouts, frosted glass effects, and the Inter font family.
* **Markdown Support**: High-fidelity rendering of AI responses, including code blocks and formatted lists, via **Marked.js**.


## 🛠️ Technologies Used

| Category | Technology |
| --- | --- |
| **AI Engine** | Google Gemini 3 Flash Preview |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js & Vercel Serverless Functions |
| **Styling** | Custom CSS Variables, Font Awesome 6.4.0 |
| **Libraries** | Marked.js, EmailJS |
| **Security** | Dotenv (Secret Management), Gitignore | 

## 🚀 Getting Started

### Prerequisites

* A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
* A [Vercel](https://vercel.com/) account for backend hosting.

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/MaazShah-7/yawar-ai.git
cd yawar-ai

```


2. **Environment Setup**:
Create a `.env` file in the root directory and add your key:
```text
GEMINI_KEY=your_api_key_here

```


3. **Deploy to Vercel**:
* Connect your GitHub repo to Vercel.
* Add `GEMINI_KEY` to the **Environment Variables** in the Vercel Dashboard.



## 📂 Project Structure

```text
├── api/
│   └── chat.js        # Serverless backend proxy (hides API Key)
├── index.html         # Main chat interface
├── contact.html       # Contact form with EmailJS integration
├── style.css          # Professional Charcoal & Theme styles
├── script.js          # Core logic & State management
├── package.json       # Project dependencies
|── .gitignore         # Prevents .env from being uploaded

```

## 🔒 Security Note

This project implements a **zero-exposure** policy for API keys. The client-side code interacts with `/api/chat`, ensuring that your `GEMINI_KEY` is only ever handled server-side within Vercel's secure environment.

---

*Created by [Maaz](https://www.linkedin.com/in/mmsm7/) © 2026 Yawar AI*
