function sendMessage() {
    const input = document.getElementById('userInput');
    const chatArea = document.getElementById('chatArea');
    const text = input.value.trim();

    if (text === '') return;

    const time = new Date().toLocaleTimeString('en-US', { hour12: false });

    // إضافة رسالة المستخدم
    chatArea.innerHTML += `<div class="message user">[USER] ${time}</div>`;
    chatArea.innerHTML += `<div class="message text">${text}</div>`;

    // مسح خانة الإدخال
    input.value = '';

    // النزول التلقائي لأسفل المحادثة
    chatArea.scrollTop = chatArea.scrollHeight;

    // محاكاة رد الذكاء الاصطناعي (يمكن ربطها بالـ API الخاص بك هنا)
    setTimeout(() => {
        chatArea.innerHTML += `<div class="message system">[ELIZA] ${time}</div>`;
        chatArea.innerHTML += `<div class="message reply">TELL ME MORE ABOUT THAT...</div>`;
        chatArea.scrollTop = chatArea.scrollHeight;
    }, 1000);
}

function clearChat() {
    document.getElementById('chatArea').innerHTML = '';
}

// تشغيل الإرسال عند الضغط على زر Enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
