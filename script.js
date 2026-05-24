async function getGeminiResponse(userText) {
    try {
        const API_KEY = "AIzaSyBi9vgGulpFnIHAHj4x30fGoGWeO5K30zI";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "Act as ELIZA, the famous 1966 retro psychotherapist chatbot. Speak in an intellectual, slightly archaic, and therapeutic tone. Respond in uppercase letters only. Keep answers focused on the user's emotions and reply concisely in 1-2 sentences." }]
                },
                contents: [
                    { role: "user", parts: [{ text: userText }] }
                ]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim().toUpperCase();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "CONNECTION ERROR. TERMINAL UNABLE TO REACH THE AI BRAIN.";
    }
}

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

document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        window.sendMessage();
    }
});
