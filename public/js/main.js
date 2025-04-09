document.addEventListener('DOMContentLoaded', function() {
    // Lấy các elements cần thiết
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const loginButton = document.querySelector('.auth-button.login');
    const registerButton = document.querySelector('.auth-button.register');
    const modelSettingsBtn = document.getElementById('model-settings-btn');
    const navItems = document.querySelectorAll('.nav-item');

    console.log('Chat Messages:', chatMessages);
    console.log('User Input:', userInput);

    // Xử lý nút cài đặt mô hình
    if (modelSettingsBtn) {
        modelSettingsBtn.addEventListener('click', () => {
            import('./model-settings.js')
                .then(module => {
                    module.showModelSettings();
                })
                .catch(error => {
                    console.error('Error loading model settings:', error);
                    showNotification('Không thể tải module cài đặt mô hình', 'error');
                });
        });
    }

    // Hàm thêm tin nhắn vào chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Xử lý gửi tin nhắn
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            // Giả lập phản hồi từ bot
            setTimeout(() => {
                addMessage('Tôi đã nhận được tin nhắn của bạn và đang xử lý...');
            }, 1000);
        }
    }

    // Sự kiện click nút gửi
    sendButton.addEventListener('click', handleSendMessage);

    // Sự kiện nhấn Enter để gửi tin nhắn
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Xử lý đăng nhập
    if (loginButton) {
        loginButton.addEventListener('click', showLoginModal);
    }

    // Xử lý đăng ký
    if (registerButton) {
        registerButton.addEventListener('click', showRegisterModal);
    }

    // Xử lý các nút điều hướng
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const feature = this.querySelector('span:last-child').textContent;
            switch (feature) {
                case 'Lịch':
                    showCalendar();
                    break;
                case 'Hẹn Giờ':
                    showTimer();
                    break;
                case 'Ghi Chú':
                    showNotes();
                    break;
                case 'Cài Đặt Mô Hình':
                    import('./model-settings.js')
                        .then(module => {
                            module.showModelSettings();
                        })
                        .catch(error => {
                            console.error('Error loading model settings:', error);
                            showNotification('Không thể tải module cài đặt mô hình', 'error');
                        });
                    break;
                default:
                    showNotification(`Tính năng ${feature} chưa được hỗ trợ.`, 'info');
            }
        });
    });

    // Hàm hiển thị timer
    function showTimer() {
        console.log('Timer function called');
        const timerHTML = `
            <div class="timer-widget">
                <h2>Hẹn Giờ</h2>
                <div class="timer-display">00:00:00</div>
                <div class="timer-controls">
                    <button onclick="startTimer()">Bắt đầu</button>
                    <button onclick="pauseTimer()">Tạm dừng</button>
                    <button onclick="resetTimer()">Đặt lại</button>
                </div>
            </div>
        `;
        displayFeature(timerHTML);
    }

    // Hàm hiển thị ghi chú
    function showNotes() {
        const notesHTML = `
            <div class="notes-widget">
                <h2>Ghi Chú</h2>
                <textarea placeholder="Nhập ghi chú của bạn..." class="note-input"></textarea>
                <button onclick="saveNote()">Lưu ghi chú</button>
                <div class="notes-list"></div>
            </div>
        `;
        displayFeature(notesHTML);
    }

    function displayFeature(htmlContent) {
        const chatMessages = document.getElementById('chat-messages');
        const featureDiv = document.createElement('div');
        featureDiv.innerHTML = htmlContent;
        chatMessages.appendChild(featureDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Timer functions
    function startTimer() {
        alert('Bắt đầu hẹn giờ!');
    }

    function pauseTimer() {
        alert('Tạm dừng hẹn giờ!');
    }

    function resetTimer() {
        alert('Đặt lại hẹn giờ!');
    }

    // Note functions
    function saveNote() {
        alert('Ghi chú đã được lưu!');
    }
});

// Thêm CSS cho các widget mới
const additionalStyles = `
    .auth-form {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .auth-form input {
        display: block;
        width: 100%;
        padding: 8px;
        margin: 10px 0;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
    }

    .timer-widget, .notes-widget {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .timer-display {
        font-size: 24px;
        text-align: center;
        margin: 10px 0;
    }

    .timer-controls, .notes-widget {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .note-input {
        width: 100%;
        min-height: 100px;
        margin: 10px 0;
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
    }
`;

// Thêm styles vào head
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

function showLoginModal() {
    console.log('Login modal opened');
    createModal('login');
}

function showRegisterModal() {
    console.log('Register modal opened');
    createModal('register');
}

function showCalendar() {
    console.log('Calendar function called');
    // Implementation of showCalendar function
}

function showTimer() {
    console.log('Timer function called');
    const timerHTML = `
        <div class="timer-widget">
            <h2>Hẹn Giờ</h2>
            <div class="timer-display">00:00:00</div>
            <div class="timer-controls">
                <button onclick="startTimer()">Bắt đầu</button>
                <button onclick="pauseTimer()">Tạm dừng</button>
                <button onclick="resetTimer()">Đặt lại</button>
            </div>
        </div>
    `;
    displayFeature(timerHTML);
}

function showNotes() {
    console.log('Notes function called');
    const notesHTML = `
        <div class="notes-widget">
            <h2>Ghi Chú</h2>
            <textarea placeholder="Nhập ghi chú của bạn..." class="note-input"></textarea>
            <button onclick="saveNote()">Lưu ghi chú</button>
            <div class="notes-list"></div>
        </div>
    `;
    displayFeature(notesHTML);
}

function displayFeature(htmlContent) {
    const chatMessages = document.getElementById('chat-messages');
    const featureDiv = document.createElement('div');
    featureDiv.innerHTML = htmlContent;
    chatMessages.appendChild(featureDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startTimer() {
    alert('Bắt đầu hẹn giờ!');
}

function pauseTimer() {
    alert('Tạm dừng hẹn giờ!');
}

function resetTimer() {
    alert('Đặt lại hẹn giờ!');
}

function saveNote() {
    alert('Ghi chú đã được lưu!');
} 