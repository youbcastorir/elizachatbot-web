var conversationHistory = [];

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

function callAnthropic(userText, callback) {
    conversationHistory.push({ role: "user", content: userText });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.anthropic.com/v1/messages", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var reply = data.content[0].text.trim().toUpperCase();
                    conversationHistory.push({ role: "assistant", content: reply });
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

    xhr.send(JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: "You are ELIZA, the famous 1966 psychotherapist chatbot created by Joseph Weizenbaum at MIT. Be empathetic, use reflective questioning techniques. Respond in UPPERCASE ONLY. Be concise, 1-2 sentences max. Reflect the user's words back as questions. Use phrases like TELL ME MORE ABOUT..., WHY DO YOU FEEL..., HOW DOES THAT MAKE YOU FEEL?",
        messages: conversationHistory
    }));
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

    callAnthropic(text, function (err, reply) {
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
    conversationHistory = [];
    document.getElementById('chatArea').innerHTML = '';
    addMessage('system', '[ELIZA] RECORDS BURNED. NEW SESSION.');
}

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});
