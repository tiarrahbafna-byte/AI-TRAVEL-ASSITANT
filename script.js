/**
 * AI Travel Assistant - Core Application Logic
 * Inspired by Apple, Stripe, and Linear design principles.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let isDarkMode = localStorage.getItem('theme') === 'dark';
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [
        { sender: 'bot', text: 'Hello! I am your AI Travel Assistant. Where are we heading for your next adventure?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    // --- DOM ELEMENTS ---
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const chatSuggestions = document.querySelectorAll('.suggestion-tag, .prompt-card');
    const itineraryForm = document.getElementById('itinerary-form');
    const itineraryResult = document.getElementById('itinerary-result');
    const faqItems = document.querySelectorAll('.faq-item');
    const backToTop = document.getElementById('back-to-top');

    // --- INITIALIZATION ---
    initTheme();
    renderChatHistory();
    initScrollAnimations();

    // --- THEME / DARK MODE ---
    function initTheme() {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
        }
    }

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        initTheme();
    });

    // --- MOBILE MENU ---
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- AI CHATBOT SYSTEM ---
    function renderChatHistory() {
        chatMessages.innerHTML = '';
        chatHistory.forEach(msg => appendMessageUI(msg.sender, msg.text, msg.time));
        scrollToBottom();
    }

    function appendMessageUI(sender, text, time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        msgDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('message', 'bot-message', 'typing-indicator-msg');
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function handleUserMessage(text) {
        if (!text.trim()) return;

        // Save & Render User Message
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { sender: 'user', text, time: timestamp };
        chatHistory.push(userMsg);
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        appendMessageUI('user', text, timestamp);
        chatInput.value = '';

        // Trigger Bot Response
        const typingIndicator = showTypingIndicator();

        setTimeout(() => {
            typingIndicator.remove();
            const botReplyText = generateBotResponse(text);
            const botMsg = { sender: 'bot', text: botReplyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            
            chatHistory.push(botMsg);
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            appendMessageUI('bot', botReplyText, botMsg.time);
            
            // Optional: Speak response if voice was active
            if ('speechSynthesis' in window && voiceBtn.classList.contains('speaking')) {
                speakText(botReplyText);
            }
        }, 1500);
    }

    function generateBotResponse(input) {
        const cleanInput = input.toLowerCase();
        if (cleanInput.includes('japan') || cleanInput.includes('tokyo')) {
            return "🇯🇵 Japan is beautiful! For a 5-day trip, I highly recommend spending 3 days exploring Tokyo (Shibuya, Asakusa, TeamLab) and 2 days in Kyoto for temples and culture. Want me to draft a daily schedule?";
        }
        if (cleanInput.includes('bali') || cleanInput.includes('beach')) {
            return "🏖️ Bali offers incredible coastal vibes! Uluwatu has the best dramatic cliff views, Seminyak is perfect for beach clubs, and Nusa Penida offers untouched paradise scenery.";
        }
        if (cleanInput.includes('paris') || cleanInput.includes('budget')) {
            return "🗼 Paris on a budget is completely doable! Grab a Navigo pass for transit, visit museums on the first Sunday of the month for free entry, and enjoy picnics near the Eiffel Tower.";
        }
        if (cleanInput.includes('hotel')) {
            return "🏨 I can scan our partners for premium lodging options. Could you specify your budget tier and preferred neighborhood location?";
        }
        if (cleanInput.includes('flight')) {
            return "✈️ Flight search active. Please provide your departure airport and target travel dates to track the best deal matrix.";
        }
        return "That sounds like an amazing journey! I can map out custom attraction paths, food stops, local safety tips, or transport passes for that region. What should we plan first?";
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Chat Event Listeners
    sendBtn.addEventListener('click', () => handleUserMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserMessage(chatInput.value); });

    // Handle Quick Suggestions & Prompt Cards
    chatSuggestions.forEach(element => {
        element.addEventListener('click', () => {
            const promptText = element.textContent.trim() || element.querySelector('p').textContent;
            handleUserMessage(promptText);
        });
    });

    // --- WEB SPEECH API (VOICE INPUT & OUTPUT) ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                voiceBtn.classList.add('listening');
                voiceBtn.style.color = 'var(--accent)';
                recognition.start();
            }
        });

        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript;
            chatInput.value = voiceText;
            handleUserMessage(voiceText);
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
            voiceBtn.style.color = '';
        };
    } else {
        voiceBtn.style.display = 'none'; // Hide if browser lacks support
    }

    function speakText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }

    // --- DYNAMIC ITINERARY GENERATOR ---
    if (itineraryForm) {
        itineraryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather values
            const destination = document.getElementById('form-destination').value || 'your destination';
            const days = parseInt(document.getElementById('form-days').value) || 3;
            const budget = document.getElementById('form-budget').value;
            const style = document.getElementById('form-style').value;

            // Simple loading simulation
            itineraryResult.innerHTML = `
                <div class="loader-container" style="text-align:center; padding: 2rem;">
                    <div class="spinner" style="width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p>Analyzing matching routes & regional trends...</p>
                </div>
            `;
            itineraryResult.style.display = 'block';

