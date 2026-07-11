/**
 * AI Travel Assistant - Native Chatbot Interface Controller
 * Provides real-time interactive message streams, dynamic filters, and web speech integrations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ENGINE ---
    let isDarkMode = localStorage.getItem('theme') === 'dark';
    
    // Core conversation memory
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [
        { 
            id: 'init',
            sender: 'bot', 
            text: "Hello explorer! 👋 I'm your premium AI Travel Assistant. I can build detailed multi-day itineraries, track target budgets, and suggest hidden local gems. Where are we traveling next?", 
            time: getCurrentTime(),
            type: 'standard'
        }
    ];

    // --- DOM SELECTORS ---
    const themeToggle = document.getElementById('theme-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const appSidebar = document.getElementById('app-sidebar');
    const chatContainer = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-input-field');
    const sendBtn = document.getElementById('chat-send-btn');
    const voiceBtn = document.getElementById('chat-voice-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    // --- INITIALIZATION ---
    initAppTheme();
    renderChatScreen();

    // --- THEME MANAGEMENT ---
    function initAppTheme() {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = `<!-- Sun Icon --><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = `<!-- Moon Icon --><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
        }
    }

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        initAppTheme();
    });

    // --- SIDEBAR DRAWER (MOBILE) ---
    if (sidebarToggle && appSidebar) {
        sidebarToggle.addEventListener('click', () => {
            appSidebar.classList.toggle('active');
        });
    }

    // --- CHAT DISPLAY & RENDERING ---
    function renderChatScreen() {
        chatContainer.innerHTML = '';
        chatHistory.forEach(msg => appendMessageMarkup(msg));
        scrollChatToBottom();
    }

    function appendMessageMarkup(msgObj) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('chat-message-row', msgObj.sender === 'user' ? 'user-row' : 'bot-row');
        messageWrapper.setAttribute('data-id', msgObj.id);

        let interiorContent = '';

        if (msgObj.type === 'itinerary' && typeof msgObj.structuredData === 'object') {
            // Interactive UI card within the chat frame
            interiorContent = createItineraryTemplate(msgObj.structuredData);
        } else if (msgObj.type === 'interactive-planner') {
            // Dropdown selection form loaded inside the conversation flow
            interiorContent = createInteractiveFormTemplate();
        } else {
            // Standard markdown text block
            interiorContent = `<div class="text-bubble"><p>${msgObj.text}</p></div>`;
        }

        messageWrapper.innerHTML = `
            <div class="avatar-frame">
                ${msgObj.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-body-wrapper">
                ${interiorContent}
                <span class="message-timestamp">${msgObj.time}</span>
            </div>
        `;

        chatContainer.appendChild(messageWrapper);
        scrollChatToBottom();

        // Bind interactive events if rendering a form
        if (msgObj.type === 'interactive-planner') {
            bindFormEvents(messageWrapper);
        }
    }

    function showLiveTypingBubble() {
        const loaderRow = document.createElement('div');
        loaderRow.classList.add('chat-message-row', 'bot-row', 'typing-loader-row');
        loaderRow.innerHTML = `
            <div class="avatar-frame">🤖</div>
            <div class="message-body-wrapper">
                <div class="text-bubble typing-indicator-bubble">
                    <div class="typing-dots"><span></span><span></span><span></span></div>
                </div>
            </div>
        `;
        chatContainer.appendChild(loaderRow);
        scrollChatToBottom();
        return loaderRow;
    }

    // --- INTERACTIVE MESSAGE COMPONENT TEMPLATES ---
    function createInteractiveFormTemplate() {
        return `
            <div class="text-bubble dynamic-form-bubble">
                <h4>🎯 Custom Itinerary Planner</h4>
                <p>Configure parameters directly to fine-tune your generative travel guide output:</p>
                <div class="form-grid-layout">
                    <div class="input-block">
                        <label>Where to?</label>
                        <input type="text" class="form-input-node field-dest" placeholder="e.g. Tokyo, Paris..." value="Tokyo">
                    </div>
                    <div class="input-block">
                        <label>Days</label>
                        <input type="number" class="form-input-node field-days" min="1" max="14" value="3">
                    </div>
                    <div class="input-block">
                        <label>Style Mode</label>
                        <select class="form-input-node field-style">
                            <option value="Luxury 💎">Luxury</option>
                            <option value="Budget 🎒" selected>Budget Backpacker</option>
                            <option value="Adventure 🧗">Adventure</option>
                            <option value="Family 👨‍👩‍👧‍👦">Family Friendly</option>
                        </select>
                    </div>
                </div>
                <button class="submit-planner-btn">Generate AI Itinerary Schedule</button>
            </div>
        `;
    }

    function createItineraryTemplate(data) {
        let cardsHtml = '';
        for (let i = 1; i <= data.days; i++) {
            cardsHtml += `
                <div class="itinerary-day-card">
                    <h5>📅 Day ${i} - Core Circuit</h5>
                    <ul>
                        <li>✨ <strong>Morning:</strong> Native landmark explore & localized historical orientation walk.</li>
                        <li>🍜 <strong>Midday:</strong> High-rating culinary spot tracking and regional food tasting.</li>
                        <li>🌆 <strong>Evening:</strong> Scenic highground sunset photography route & market discover.</li>
                    </ul>
                </div>
            `;
        }
        return `
            <div class="text-bubble itinerary-response-bubble">
                <h4>✨ Smart Plan: ${data.destination}</h4>
                <p class="meta-tag">Priced Level: ${data.style} | Duration: ${data.days} days</p>
                <div class="itinerary-timeline-scroll">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    // --- PROCESS MESSAGE SUBMISSIONS ---
    function triggerUserPrompt(text) {
        if (!text.trim()) return;

        const userMsg = {
            id: 'msg-' + Date.now(),
            sender: 'user',
            text: text,
            time: getCurrentTime(),
            type: 'standard'
        };

        chatHistory.push(userMsg);
        saveChatToStorage();
        appendMessageMarkup(userMsg);
        chatInput.value = '';

        const loader = showLiveTypingBubble();

        // Model response execution window
        setTimeout(() => {
            loader.remove();
            let responseMsg = processIntentRouting(text);
            chatHistory.push(responseMsg);
            saveChatToStorage();
            appendMessageMarkup(responseMsg);

            // Execute TTS synthesis output if active
            if (voiceBtn.classList.contains('tts-enabled')) {
                executeTextToSpeech(responseMsg.text || `Generated schedule details for ${responseMsg.structuredData?.destination}`);
            }
        }, 1250);
    }

    function processIntentRouting(inputText) {
        const input = inputText.toLowerCase();
        const baseResponse = { id: 'bot-' + Date.now(), sender: 'bot', time: getCurrentTime() };

        if (input.includes('plan') || input.includes('itinerary') || input.includes('create a trip')) {
            return {
                ...baseResponse,
                type: 'interactive-planner',
                text: 'Opened interactive input layout.'
            };
        }

        // Static prompt route returns
        let replyText = "I can analyze flight trends, suggest hotel stays, parse live currency mappings, or build customized day-by-day guides. Tell me your destination to begin!";
        
        if (input.includes('tokyo') || input.includes('japan')) {
            replyText = "🇯🇵 Tokyo setup initialized. Top highlights include exploring Shibuya Crossing, the historic paths of Asakusa, and digital arts at teamLab. Would you like a detailed 5-day itinerary?";
        } else if (input.includes('paris')) {
