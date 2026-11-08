"use strict";

/* =========================================
   CH . Ai — ROLEPLAY CHAT SYSTEM
========================================= */

// API Configuration
const API_URL = "/api/chat";

// Local Storage Keys
const STORAGE = {
    history: "ch_ai_chat_history",
    darkMode: "ch_ai_dark_mode"
};

// =========================================
// CHARACTER DATABASE
// =========================================

const characters = [
    {
        id: "naw",
        name: "Mistress Naw",
        description: "A confident and mysterious woman.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        background: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900"
    },
    {
        id: "sakura",
        name: "Sakura",
        description: "A sweet and playful Japanese girl.",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
        background: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900"
    },
    {
        id: "alex",
        name: "Alex",
        description: "A mysterious and quiet gentleman.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        background: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900"
    },
    {
        id: "emma",
        name: "Emma",
        description: "Friendly, caring and romantic.",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
        background: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900"
    }
];

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
        return JSON.parse(
            localStorage.getItem(STORAGE.history)
        ) || {};
    } catch {
        return {};
    }
}

function saveHistory() {
    localStorage.setItem(
        STORAGE.history,
        JSON.stringify(chatHistory)
    );
}

// =========================================
// HOME CHARACTER GRID
// =========================================

function renderCharacters(list = characters) {

    const grid = document.getElementById("characterGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `
            <p style="padding:20px;color:#777;">
                Character မတွေ့ပါ။
            </p>
        `;
        return;
    }

    list.forEach(character => {

        const card = document.createElement("div");

        card.className = "character-card";

        card.innerHTML = `
            <div class="card-image-container">
                <img
                    class="card-image"
                    src="${character.avatar}"
                    alt="${character.name}"
                    loading="lazy"
                >
            </div>

            <div class="card-info">
                <div class="card-name"></div>
                <div class="card-desc"></div>
            </div>
        `;

        card.querySelector(".card-name").textContent =
            character.name;

        card.querySelector(".card-desc").textContent =
            character.description;

        card.addEventListener("click", () => {
            openChat(character.id);
        });

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

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const target = document.getElementById(`screen-${tab}`);
    const nav = document.getElementById(`nav-${tab}`);

    if (target) target.classList.add("active");
    if (nav) nav.classList.add("active");

    const bottomNav = document.getElementById("bottomNav");

    if (bottomNav) {
        bottomNav.style.display = "flex";
    }

    if (tab === "chatlist") {
        renderRecentChats();
    }
}

// =========================================
// OPEN CHAT
// =========================================

function openChat(characterId) {

    const character = characters.find(
        item => item.id === characterId
    );

    if (!character) return;

    currentCharacter = character;

    const avatar = document.getElementById("chatHeaderAvatar");
    const name = document.getElementById("chatHeaderName");
    const background = document.getElementById("chatBg");
    const bottomNav = document.getElementById("bottomNav");

    avatar.src = character.avatar;
    name.textContent = character.name;

    background.style.backgroundImage =
        `url("${character.background}")`;

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById("screen-chat").classList.add("active");

    if (bottomNav) {
        bottomNav.style.display = "none";
    }

    renderMessages();

    document.getElementById("messageInput").focus();
}

// =========================================
// CLOSE CHAT
// =========================================

function closeChat() {

    currentCharacter = null;

    document.getElementById("screen-chat").classList.remove("active");

    document.getElementById("screen-home").classList.add("active");

    document.getElementById("bottomNav").style.display = "flex";

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

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

    bubble.className =
        `message-bubble ${role === "user" ? "user" : "ai"}`;

    // Prevent HTML injection
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
// SEND MESSAGE
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

    // Save user message
    chatHistory[characterId].push({
        role: "user",
        content: message,
        timestamp: Date.now()
    });

    saveHistory();

    addMessageToUI("user", message);

    const sendButton = document.querySelector(".send-btn");

    sendButton.disabled = true;

    const typing = document.createElement("div");

    typing.className = "message-bubble ai";
    typing.id = "typingIndicator";
    typing.textContent = "Typing...";

    document.getElementById("messagesContainer").appendChild(typing);

    scrollToBottom();

    try {

        // Send request to Python Backend
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                character_id: characterId,

                message: message,

                history: chatHistory[characterId]

            })

        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        const aiReply =
            data.reply || data.response || data.message;

        if (typeof aiReply !== "string" || !aiReply.trim()) {
            throw new Error("Invalid AI response");
        }

        // Save AI response
        chatHistory[characterId].push({

            role: "assistant",

            content: aiReply,

            timestamp: Date.now()

        });

        saveHistory();

        removeTyping();

        addMessageToUI("ai", aiReply);

    } catch (error) {

        console.error("Chat Error:", error);

        removeTyping();

        const errorMessage =
            "AI Server နဲ့ ချိတ်ဆက်လို့မရသေးပါ။ ခဏနေမှ ပြန်ကြိုးစားပါ။";

        addMessageToUI("ai", errorMessage);

    } finally {

        isSending = false;

        sendButton.disabled = false;

        input.focus();

    }

}

// =========================================
// REMOVE TYPING INDICATOR
// =========================================

function removeTyping() {

    const typing = document.getElementById("typingIndicator");

    if (typing) typing.remove();
}

// =========================================
// ENTER KEY
// =========================================

function handleKeyPress(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }
}

// =========================================
// RECENT CHAT LIST
// =========================================

function renderRecentChats() {

    const grid = document.getElementById("recentGrid");

    grid.innerHTML = "";

    const recentCharacters = characters
        .filter(character => {
            return (
                chatHistory[character.id] &&
                chatHistory[character.id].length > 0
            );
        })
        .sort((a, b) => {

            const aMessages = chatHistory[a.id];
            const bMessages = chatHistory[b.id];

            return (
                bMessages[bMessages.length - 1].timestamp -
                aMessages[aMessages.length - 1].timestamp
            );

        });

    if (recentCharacters.length === 0) {

        grid.innerHTML = `
            <p style="padding:20px;color:#777;">
                လတ်တလော Chat မရှိသေးပါ။
            </p>
        `;

        return;
    }

    recentCharacters.forEach(character => {

        const messages = chatHistory[character.id];

        const lastMessage = messages[messages.length - 1];

        const card = document.createElement("div");

        card.className = "character-card";

        card.innerHTML = `
            <div class="card-image-container">
                <img class="card-image" loading="lazy">
            </div>

            <div class="card-info">
                <div class="card-name"></div>
                <div class="card-desc"></div>
            </div>
        `;

        card.querySelector("img").src = character.avatar;

        card.querySelector(".card-name").textContent =
            character.name;

        card.querySelector(".card-desc").textContent =
            lastMessage.content;

        card.addEventListener("click", () => {
            openChat(character.id);
        });

        grid.appendChild(card);

    });

}

// =========================================
// DARK MODE
// =========================================

function toggleDarkMode() {

    const toggle = document.getElementById("darkModeToggle");

    document.body.classList.toggle("dark-mode", toggle.checked);

    localStorage.setItem(
        STORAGE.darkMode,
        toggle.checked ? "true" : "false"
    );

}

function loadDarkMode() {

    const enabled =
        localStorage.getItem(STORAGE.darkMode) === "true";

    const toggle = document.getElementById("darkModeToggle");

    if (toggle) {
        toggle.checked = enabled;
    }

    document.body.classList.toggle("dark-mode", enabled);

}

// =========================================
// CLEAR CHAT HISTORY
// =========================================

function clearHistory() {

    const confirmDelete = confirm(
        "Chat မှတ်တမ်းအားလုံးကို ဖျက်မှာ သေချာပါသလား?"
    );

    if (!confirmDelete) return;

    chatHistory = {};

    saveHistory();

    renderRecentChats();

    if (currentCharacter) {
        renderMessages();
    }

    alert("Chat History များ ဖျက်ပြီးပါပြီ။");

}

// =========================================
// APPLICATION INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    renderCharacters();

    loadDarkMode();

    // Search input
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", filterCharacters);
    }

    console.log("CH . Ai Initialized Successfully");

});
