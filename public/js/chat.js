import { CONFIG } from './config.js';
import { appendMessage, isTimeRelatedQuestion, isWeatherRelatedQuestion, extractCityName } from './utils.js';
import { sendGemmaRequest, getWeather } from './api.js';

/**
 * Mảng lưu trữ lịch sử tin nhắn giữa người dùng và trợ lý ảo
 * @type {Array<{role: string, content: string}>}
 */
let messages = [];

// Thêm biến để theo dõi trạng thái hội thoại
let isFirstMessage = true;
let isWaitingForName = false;

// Thiết lập các event listener cho giao diện
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});

/**
 * Xử lý và gửi tin nhắn của người dùng
 * @async
 */
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (!message) return;
    
    // Hiển thị tin nhắn người dùng và xóa input
    appendMessage(message, true);
    userInput.value = '';

    try {
        // Kiểm tra trạng thái đăng nhập
        const sessionToken = localStorage.getItem('sessionToken');
        if (!sessionToken) {
            appendMessage("Vui lòng đăng nhập, đăng ký tài khoản để tôi có thể hỗ trợ bạn tốt hơn 😊", false);
            return;
        }

        if (isWaitingForName) {
            handleNameInput(message);
            return;
        }

        // Xử lý các loại câu hỏi đặc biệt
        if (await handleSpecialQueries(message)) {
            return;
        }

        // Xử lý câu hỏi thông thường qua Gemma
        await processWithGemma(message);
    } catch (error) {
        console.error('Error processing message:', error);
        appendMessage('Đã xảy ra lỗi khi xử lý tin nhắn của bạn.', false);
    }
}

/**
 * Xử lý các loại câu hỏi đặc biệt (thời gian, thời tiết)
 * @param {string} message - Tin nhắn của người dùng
 * @returns {Promise<boolean>} - True nếu đã xử lý câu hỏi đặc biệt
 */
async function handleSpecialQueries(message) {
    // Xử lý câu hỏi về thời gian
    if (isTimeRelatedQuestion(message)) {
        const now = new Date();
        appendMessage(`Bây giờ là: ${now.toLocaleString()}`, false);
        return true;
    }

    // Xử lý câu hỏi về thời tiết
    if (isWeatherRelatedQuestion(message)) {
        const cityName = extractCityName(message);
        if (cityName && CONFIG.ACCUWEATHER.LOCATION_KEYS[cityName.toLowerCase()]) {
            const weatherInfo = await getWeather(cityName);
            appendMessage(weatherInfo, false);
            return true;
        } else {
            appendMessage(`Xin lỗi, tôi chỉ có thông tin thời tiết cho các thành phố: ${Object.keys(CONFIG.ACCUWEATHER.LOCATION_KEYS).join(', ')}`, false);
            return true;
        }
    }

    return false;
}

/**
 * Xử lý tin nhắn thông qua API Gemma
 * @param {string} message - Tin nhắn của người dùng
 */
async function processWithGemma(message) {

    // Thêm hệ thống prompt vào lịch sử nếu chưa có
    if (messages.length === 0) {
        messages.push({
            role: "system",
            content: CONFIG.PROMPT.SYSTEM
        });
    }

    // Thêm tin nhắn người dùng vào lịch sử
    messages.push({
        role: "user",
        content: message
    });

    // Gửi yêu cầu đến API Gemma
    const botResponse = await sendGemmaRequest(messages);

    // Thêm phản hồi của bot vào lịch sử
    messages.push({
        role: "assistant",
        content: botResponse
    });

    // Hiển thị phản hồi
    appendMessage(botResponse, false);
}

/**
 * Hiển thị ngày giờ hiện tại
 */
function showDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    appendMessage(`Ngày và giờ hiện tại: ${dateTimeString}`, false);
}


async function showWeather() {
    try {
        const weatherInfo = await getWeather("Hà Nội");
        appendMessage(weatherInfo, false);
    } catch (error) {
        console.error('Error getting weather:', error);
        appendMessage('Đã xảy ra lỗi khi lấy thông tin thời tiết.', false);
    }
}

/**
 * Bắt đầu cuộc trò chuyện mới
 */
export function newChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    messages = [{
        role: "system",
        content: CONFIG.PROMPT.SYSTEM
    }];
    initializeChat();
}

/**
 * Chuyển đổi tên người dùng thành dạng viết hoa
 * @param {string} name - Tên người dùng
 * @returns {string} Tên đã được viết hoa
 */
function capitalizeUserName(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Thêm hàm khởi tạo chat
function initializeChat() {
    const sessionToken = localStorage.getItem('sessionToken');
    const savedName = localStorage.getItem(CONFIG.USER.storageKey);
    
    if (!sessionToken) {
        appendMessage("Vui lòng đăng nhập hoặc đăng ký để tôi có thể hỗ trợ bạn tốt hơn 😊", false);
        return;
    }
    
    if (savedName) {
        const capitalizedName = capitalizeUserName(savedName);
        CONFIG.USER.name = capitalizedName;
        appendMessage(`Xin chào ${capitalizedName}! 👋 Tôi có thể giúp gì được cho bạn?`, false);
    } else {
        // Hiển thị tin nhắn introduction theo thứ tự
        const intro = CONFIG.PROMPT.INTRODUCTION;
        
        // Lời chào
        appendMessage(intro.GREETING, false);
        
        // Tính năng
        setTimeout(() => {
            appendMessage("Tôi được đào tạo để:", false);
            intro.FEATURES.forEach((feature, index) => {
                setTimeout(() => {
                    appendMessage(`• ${feature}`, false);
                }, 200 * (index + 1));
            });
        }, 1000);
        
        // Yêu cầu tên
        setTimeout(() => {
            appendMessage(intro.NAME_REQUEST, false);
            isWaitingForName = true;
        }, 3000);
    }
}

// Thêm hàm xử lý input tên
function handleNameInput(name) {
    name = name.trim();
    if (name) {
        const capitalizedName = capitalizeUserName(name);
        CONFIG.USER.name = capitalizedName;
        localStorage.setItem(CONFIG.USER.storageKey, capitalizedName);
        isWaitingForName = false;
        appendMessage(`Xin chào ${capitalizedName}! 👋 Tôi có thể giúp gì được cho bạn?`, false);
    } else {
        appendMessage('Xin lỗi, tôi chưa nghe rõ tên của bạn. Bạn có thể sử dụng nickname khác được không? ��', false);
    }
}

// Thêm lệnh khởi tạo chat khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    
    // ... existing event listeners ...
});

// Sử dụng class để quản lý chat history thay vì global variable
class ChatManager {
    constructor() {
        this.messages = [];
        this.specialHandlers = {
            time: this.handleTimeQuery.bind(this),
            weather: this.handleWeatherQuery.bind(this),
            schedule: this.handleScheduleQuery.bind(this),
            timer: this.handleTimerQuery.bind(this)
        };
    }

    async handleSpecialQueries(message) {
        // Xử lý thời gian
        if (isTimeRelatedQuestion(message)) {
            return await this.specialHandlers.time(message);
        }

        // Xử lý thời tiết
        if (isWeatherRelatedQuestion(message)) {
            return await this.specialHandlers.weather(message);
        }

        // Xử lý lịch trình
        if (isScheduleRelatedQuestion(message)) {
            return await this.specialHandlers.schedule(message);
        }

        // Xử lý hẹn giờ
        if (isTimerRelatedQuestion(message)) {
            return await this.specialHandlers.timer(message);
        }

        return false;
    }

    // ... các phương thức xử lý khác
}
