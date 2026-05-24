// ⚠️ ضع مفتاح Gemini API الخاص بك بين القوسين أدناه
const GEMINI_API_KEY = "AIzaSyBi9vgGulpFnIHAHj4x30fGoGWeO5K30zI"; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function getGeminiResponse(userText) {
    // إرسال التعليمات الأساسية لـ Gemini ليتحدث بأسلوب بوت ELIZA التاريخي الكلاسيكي
    const systemInstruction = "Act as ELIZA, the famous 1966 retro psychotherapist chatbot. Speak in an intellectual, slightly archaic, and therapeutic tone. Respond in uppercase letters. Keep answers focused on the user's emotions.";

    const requestBody = {
        contents: [{
            parts: [{ text: userText }]
        }],
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

        if (!response.ok) throw new Error("API Request Failed");

        const data = await response.json();
        // استخراج نص الإجابة بناءً على بنية تفكيك كود الـ GeminiModels.kt الموضح في صورتك
        const botReply = data.candidates[0].content.parts[0].text;
        return botReply.trim();

    } catch (error) {
        console.error(error);
        return "CONNECTION ERROR. TERMINAL UNABLE TO REACH THE AI BRAIN.";
    }
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const chatArea = document.getElementById('chatArea');
    const text = input.value.trim();

    if (text === '') return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    // إضافة نص المستخدم
    chatArea.innerHTML += `<div class="message user">[USER] ${time}</div>`;
    chatArea.innerHTML += `<div class="message text">${text}</div>`;

    input.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    // إظهار مؤشر الانتظار
    const waitingId = "waiting-" + Date.now();
    chatArea.innerHTML += `<div class="message system" id="${waitingId}">[ELIZA] THINKING...</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;

    // جلب الرد الحقيقي من الذكاء الاصطناعي
    const aiReply = await getGeminiResponse(text);

    // إزالة مؤشر الانتظار واستبداله بالرد الفعلي
    const waitingElement = document.getElementById(waitingId);
    if (waitingElement) waitingElement.remove();

    chatArea.innerHTML += `<div class="message system">[ELIZA] ${time}</div>`;
    chatArea.innerHTML += `<div class="message reply">${aiReply}</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;
}

function clearChat() {
    document.getElementById('chatArea').innerHTML = '';
}

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
                        
