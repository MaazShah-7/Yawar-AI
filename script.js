// 1. UPDATED CONFIGURATION
const API_KEY = "AIzaSyBlD9d_f-4slPml_2EUue1cK3GTbpo9UtA";

// Change "v1" to "v1beta" to support the 1.5-flash model
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + API_KEY;

// 2. STATE MANAGEMENT
let chatHistory = JSON.parse(localStorage.getItem("yawar_history")) || [];
let recentTitles = JSON.parse(localStorage.getItem("yawar_recent")) || [];

// 3. UI SELECTORS - Double check these match your HTML IDs
const chatDisplay = document.getElementById("chat-display");
const welcomeSection = document.getElementById("welcome-section");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// 3. INITIALIZATION
window.onload = () => {
    // Restore theme from your original JS
    const savedTheme = localStorage.getItem('yawar-theme');
    if (savedTheme) setTheme(savedTheme);

    if (chatHistory.length > 0) {
        welcomeSection.style.display = 'none';
        chatHistory.forEach(msg => appendToUI(msg.role === "user" ? "user" : "bot", msg.parts[0].text));
    }
    updateRecentSidebar();
};

// 4. CORE CHAT (Feature 1, 2, 5, 6, 9)
async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // Prep UI
    welcomeSection.style.display = 'none';
    appendToUI("user", text);
    // Clear the input field after sending
    userInput.value = '';
    userInput.classList.add('sent');
    userInput.blur();
    
    chatHistory.push({ role: "user", parts: [{ text: text }] });
function appendToUI(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}-message`;
    
    if (role === "bot") {
        // Use marked for AI, but keep user text as raw string for security/speed
        div.innerHTML = marked.parse(text);
    } else {
        div.textContent = text;
    }
    
    chatDisplay.appendChild(div);
    // Auto-scroll for user messages fully, and for bot messages show user message + first line
    if (role === "user") {
        chatDisplay.scrollTo({ top: chatDisplay.scrollHeight, behavior: 'smooth' });
    } else if (role === "bot") {
        // Scroll to show user message at bottom (bot response will peek from below)
        setTimeout(() => {
            const messages = chatDisplay.querySelectorAll('.message');
            if (messages.length >= 2) {
                const userMsg = messages[messages.length - 2]; // User message is second to last
                userMsg.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 10);
    }
    return div;
}
    // Feature 6: Loading State
    const loadingMsg = appendToUI("bot", "Yawar is thinking...");
    loadingMsg.classList.add("typing-effect");

    try {
        const response = await fetch(API_URL, {
            method: "POST", // 404 happens if this is accidentally GET
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        // Diagnostic Check: If the server says 404, we catch it here
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Details:", errorData);
            loadingMsg.innerText = "Error " + response.status + ": " + errorData.error.message;
            // Remove sent state so user can edit or resend
            userInput.classList.remove('sent');
            return;
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        loadingMsg.remove();
        appendToUI("bot", aiResponse);
        // Response received: allow editing the input again
        userInput.classList.remove('sent');
        chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        saveData(text);

    } catch (e) {
        loadingMsg.innerText = "Network Error: Please check your internet or VPN.";
        console.error("Fetch Error:", e);
        // On error, remove sent state so user can correct or resend
        userInput.classList.remove('sent');
    }
}

function appendToUI(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}-message`;
    
    if (role === "bot") {
        // Use marked for AI, but keep user text as raw string for security/speed
        div.innerHTML = marked.parse(text);
    } else {
        div.textContent = text;
    }
    
    chatDisplay.appendChild(div);
    return div;
}

function saveData(firstQuery) {
    localStorage.setItem("yawar_history", JSON.stringify(chatHistory));
    if (chatHistory.length === 2) {
        recentTitles.unshift(firstQuery.slice(0, 20) + "...");
        localStorage.setItem("yawar_recent", JSON.stringify(recentTitles.slice(0, 5)));
        updateRecentSidebar();
    }
}

function updateRecentSidebar() {
    const list = document.getElementById("recent-chats-list");
    list.innerHTML = recentTitles.map(t => `<div class="nav-item">${t}</div>`).join("");
}

function clearChat() {
    localStorage.removeItem("yawar_history");
    location.reload();
}

// 6. VOICE (Feature 7 & 8)
const voiceBtn = document.getElementById("voice-btn");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// Check if Speech Recognition is supported
if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported');
    if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Speech Recognition not supported in this browser';
        voiceBtn.style.opacity = '0.5';
    }
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    // Request microphone permission
    async function requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('❌ Microphone access denied! Please:\n1. Check browser permissions\n2. Allow microphone in settings\n3. Restart browser');
            return false;
        }
    }

    voiceBtn.onclick = async () => {
        if (isListening) {
            recognition.stop();
            return;
        }
        
        // Request permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) return;
        
        try {
            userInput.placeholder = '🎤 Listening...';
            userInput.style.color = '#FF6B6B';
            isListening = true;
            voiceBtn.classList.add("recording");
            recognition.start();
            console.log('🔴 Voice recording STARTED');
        } catch (err) {
            console.error('Error starting recognition:', err);
            isListening = false;
            voiceBtn.classList.remove("recording");
            userInput.placeholder = 'Send a message';
        }
    };

    recognition.onstart = () => {
        console.log('✅ Recognition onstart fired');
        isListening = true;
    };

    recognition.onresult = (event) => {
        console.log('📝 onresult fired', event.results);
        let transcript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            transcript += transcriptSegment;
            console.log('Segment ' + i + ':', transcriptSegment);
        }
        
        if (transcript.trim()) {
            userInput.value = transcript.trim();
            console.log('✅ Final transcript set:', transcript.trim());
        }
    };

    recognition.onend = () => {
        console.log('🛑 Recognition stopped');
        isListening = false;
        voiceBtn.classList.remove("recording");
        userInput.placeholder = 'Send a message';
        userInput.style.color = 'inherit';
        if (userInput.value.trim()) {
            handleChat();
        }
    };

    recognition.onerror = (event) => {
        console.error('❌ Recognition error:', event.error);
        isListening = false;
        voiceBtn.classList.remove("recording");
        userInput.placeholder = 'Send a message';
        
        let errorMsg = 'Voice error: ' + event.error;
        if (event.error === 'not-allowed') errorMsg = '❌ Microphone permission denied';
        else if (event.error === 'network') errorMsg = '❌ Network error';
        else if (event.error === 'no-speech') errorMsg = '❌ No speech detected - try again';
        
        console.error(errorMsg);
        alert(errorMsg);
    };
}

function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
    synth.speak(utterance);
}
// Listeners
sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === "Enter") handleChat(); };

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Toggle Recent Chats Dropdown
function toggleDropdown() {
    const content = document.getElementById('recent-chats-list');
    const btn = document.getElementById('dropdown-trigger');

    content.classList.toggle('show');
    btn.classList.toggle('active');
}

// Close sidebar if window is resized above mobile width
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
});
// Theme switching logic//
function setTheme(themeName) {
    // 1. Set the attribute on the document to trigger CSS changes
    if (themeName === 'teal') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    // 2. Update button UI (Border highlights)
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.querySelector(`.theme-${themeName}`).classList.add('active');

    // 3. Optional: Save preference to local storage
    localStorage.setItem('yawar-theme', themeName);
}

// Check for saved theme on page load
window.onload = () => {
    const savedTheme = localStorage.getItem('yawar-theme');
    if (savedTheme) setTheme(savedTheme);
};

// Initialize EmailJS
(function () { emailjs.init("RLepGN0C2GalkhwL0"); })();

// Section Navigation
function showSection(sectionName) {
    const chat = document.getElementById('chat-section');
    const contact = document.getElementById('contact-section');
    if (sectionName === 'contact') {
        chat.style.display = 'none';
        contact.style.display = 'block';
    } else {
        chat.style.display = 'block';
        contact.style.display = 'none';
    }
    toggleSidebar(); // Close sidebar after click
}
// Form Submission
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    const status = document.getElementById('form-status');
    const form = this;

    btn.innerText = 'Sending...';
    btn.disabled = true;

    emailjs.sendForm('service_hiouxlg', 'template_2uf4zm5', this)
        .then(() => {
            // Keep "Sending..." for 3 seconds
            setTimeout(() => {
                // Show success message
                status.innerHTML = "<p style='color: #D4AF37; margin-top: 10px;'>Message Sent Successfully!</p>";
                btn.innerText = 'Message Sent!';

                // Show success message for 5 seconds, then reset
                setTimeout(() => {
                    form.reset();
                    btn.innerText = 'Send Message';
                    btn.disabled = false;
                    status.innerHTML = '';
                }, 5000);
            }, 3000);
        })
        .catch((err) => {
            // Show error message
            status.innerHTML = "<p style='color: #ff4d4d; margin-top: 10px;'>Failed to send message.</p>";
            btn.innerText = 'Send Message';
            btn.disabled = false;
        });
});