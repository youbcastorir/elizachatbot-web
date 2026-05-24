// Gemini API Key Configuration
const GEMINI_API_KEY = "AIzaSyBi9vgGulpFnIHAHj4x30fGoGWeO5K30zI"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function getGeminiResponse(userText) {
    const systemInstruction = "Act as ELIZA, the famous 1966 retro psychotherapist chatbot. Speak in an intellectual, slightly archaic, and therapeutic tone. Respond in uppercase letters. Keep answers focused on the user's emotions and reply in a concise manner.";

    // البنية المتوافقة تماماً مع بروتوكول المتصفحات المباشر لـ Gemini
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: userText }]
            }
        ],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error("API Request Failed");
        }

        const data = await response.json();
        
        // استخراج النص من رد السيرفر الرسمي لـ Google API
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const botReply = data.candidates[0].content.parts[0].text;
            return botReply.trim().toUpperCase(); // تحويل النص لأحرف كبيرة ليناسب شكل الشاشة القديمة
        } else {
            return "UNEXPECTED RESPONSE FORMAT FROM AI BRAIN.";
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        return "CONNECTION ERROR. TERMINAL UNABLE TO REACH THE AI BRAIN.";
    }
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const chatArea = document.getElementById('chatArea');
    const text = input.value.trim();

    if (text === '') return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    // عرض رسالة المستخدم على الشاشة
    chatArea.innerHTML += `<div class="message user">[USER] ${time}</div>`;
    chatArea.innerHTML += `<div class="message text">${text}</div>`;

    input.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    // إنشاء عنصر مؤقت لشاشة الانتظار (Thinking...)
    const waitingId = "waiting-" + Date.now();
    chatArea.innerHTML += `<div class="message system" id="${waitingId}">[ELIZA] COMMUNICATING WITH CORE...</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;

    // جلب الرد من Gemini
    const aiReply = await getGeminiResponse(text);

    // إزالة عنصر الانتظار بعد الحصول على الرد
    const waitingElement = document.getElementById(waitingId);
    if (waitingElement) waitingElement.remove();

    // عرض رد الذكاء الاصطناعي النهائي
    chatArea.innerHTML += `<div class="message system">[ELIZA] ${time}</div>`;
    chatArea.innerHTML += `<div class="message reply">${aiReply}</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;
}

function clearChat() {
    document.getElementById('chatArea').innerHTML = '';
}

// تفعيل زر Enter للإرسال التلقائي
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
        
