var GEMINI_API_KEY = "AIzaSyBi9vgGulpFnIHAHj4x30fGoGWeO5K30zI";

function getTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function addMessage(cls, text) {
    var chatArea = document.getElementById('chatArea');
    var div = document.createElement('div');
    div.className = 'message ' + cls;
    div.textContent = text;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    return div;
}

function callGemini(userText, callback) {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    var body = JSON.stringify({
        system_instruction: {
            parts: [{
                text: "You are ELIZA, the famous 1966 psychotherapist chatbot. Be empathetic, ask reflective questions, respond in UPPERCASE ONLY. Be concise, 1-2 sentences max."
            }]
        },
        contents: [{
            parts: [{ text: userText }]
        }]
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var reply = data.candidates[0].content.parts[0].text.trim().toUpperCase();
                    callback(null, reply);
                } catch (e) {
                    callback("PARSE ERROR");
                }
            } else {
                try {
                    var errData = JSON.parse(xhr.responseText);
                    callback("API ERROR: " + (errData.error && errData.error.message ? errData.error.message : xhr.status));
                } catch (e) {
                    callback("HTTP ERROR: " + xhr.status);
                }
            }
        }
    };

    xhr.onerror = function () {
        callback("NETWORK ERROR. CHECK YOUR CONNECTION.");
    };

    xhr.send(body);
}

function sendMessage() {
    var input = document.getElementById('userInput');
    var text = input.value.trim();
    if (!text) return;

    var time = getTime();
    addMessage('user', '[USER] ' + time);
    addMessage('text', text);
    input.value = '';

    var waitingDiv = addMessage('waiting', '[ELIZA] COMMUNICATING WITH CORE...');

    callGemini(text, function (err, reply) {
        if (waitingDiv && waitingDiv.parentNode) {
            waitingDiv.parentNode.removeChild(waitingDiv);
        }
        if (err) {
            addMessage('system', '[ELIZA] ' + getTime());
            addMessage('reply', 'CONNECTION ERROR: ' + err);
        } else {
            addMessage('system', '[ELIZA] ' + getTime());
            addMessage('reply', reply);
        }
    });
}

function clearChat() {
    document.getElementById('chatArea').innerHTML = '';
    addMessage('system', '[ELIZA] RECORDS BURNED. NEW SESSION.');
}

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});
