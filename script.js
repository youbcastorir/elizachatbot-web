import { GoogleGenerativeAI } from "@google/generative-ai";

// إعداد مفتاح الـ API والنموذج
const API_KEY = "AIzaSyBi9vgGulpFnIHAHj4x30fGoGWeO5K30zI";
const aiLog = new GoogleGenerativeAI(API_KEY);

async function getGeminiResponse(userText) {
    try {
        const model = aiLog.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "Act as ELIZA, the famous 1966 retro psychotherapist chatbot. Speak in an intellectual, slightly archaic, and therapeutic tone. Respond in uppercase letters. Keep answers focused on the user's emotions and reply in a concise manner."
        });

        const result = await model.generateContent(userText);
        const response = await result.response;
        return response.text().trim().toUpperCase();

    } catch (error) {
        console.error("Gemini SDK Error:", error);
        return "CONNECTION ERROR. TERMINAL UNABLE TO REACH THE AI BRAIN.";
    }
}

// جعل الأزرار في الـ HTML قادرة على رؤية الوظائف بعد تحويل السكريبت لـ Module
window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const chatArea = document.getElementById('chatArea');
    const text = input.value.trim();

    if (text === '') return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    chatArea.innerHTML += `<div class="message user">[USER] ${time}</div>`;
    chatArea.innerHTML += `<div class="message text">${text}</div>`;

    input.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    const waitingId = "waiting-" + Date.now();
    chatArea.innerHTML += `<div class="message system" id="${waitingId}">[ELIZA] COMMUNICATING WITH CORE...</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;

    const aiReply = await getGeminiResponse(text);

    const waitingElement = document.getElementById(waitingId);
    if (waitingElement) waitingElement.remove();

    chatArea.innerHTML += `<div class="message system">[ELIZA] ${time}</div>`;
    chatArea.innerHTML += `<div class="message reply">${aiReply}</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.clearChat = function() {
    document.getElementById('chatArea').innerHTML = '';
}

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        window.sendMessage();
    }
});
