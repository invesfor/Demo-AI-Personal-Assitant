/**
 * Quản lý cài đặt mô hình AI
 */

import { CONFIG, updateModelConfig, getCurrentModel } from './config.js';

// Thêm biến để theo dõi model hiện tại
let currentModel = getCurrentModel();
let availableModels = [];
let currentCategory = 'all';
const MODEL_CATEGORIES = CONFIG.MODEL.CATEGORIES;

// Thêm biến để theo dõi trạng thái chuyển đổi model
let isModelSwitching = false;

// Thêm hàm getModelCategory
function getModelCategory(modelName) {
    // Chuyển tên model về chữ thường để dễ so sánh
    modelName = modelName.toLowerCase();
    
    // Phân loại model dựa trên tên
    if (modelName.includes('chat') || modelName.includes('gpt') || modelName.includes('llama')) {
        return 'chat';
    }
    if (modelName.includes('code') || modelName.includes('starcoder') || modelName.includes('codellama')) {
        return 'code';
    }
    if (modelName.includes('write') || modelName.includes('claude') || modelName.includes('gemma')) {
        return 'writing';
    }
    
    return 'all';
}

// Expose showModelSettings globally
export function showModelSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚙️ Cài Đặt Mô Hình AI</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h3>Chọn Mô Hình</h3>
                    <div class="form-group">
                        <label for="model-type">Loại Mô Hình:</label>
                        <select id="model-type" class="model-select">
                            <option value="gpt-3.5-turbo" ${currentModel === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                            <option value="gpt-4" ${currentModel === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                            <option value="claude-3-opus" ${currentModel === 'claude-3-opus' ? 'selected' : ''}>Claude 3 Opus</option>
                            <option value="claude-3-sonnet" ${currentModel === 'claude-3-sonnet' ? 'selected' : ''}>Claude 3 Sonnet</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Điều Chỉnh Tham Số</h3>
                    <div class="form-group">
                        <label for="temperature">Temperature: <span id="temperature-value">0.7</span></label>
                        <input type="range" id="temperature" min="0" max="1" step="0.1" value="0.7" class="slider">
                        <div class="slider-labels">
                            <span>Chính xác</span>
                            <span>Sáng tạo</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="max-tokens">Max Tokens:</label>
                        <input type="number" id="max-tokens" min="100" max="4000" value="2000" class="number-input">
                        <div class="input-hint">Độ dài tối đa của câu trả lời (100-4000)</div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Hệ Thống Prompt</h3>
                    <div class="form-group">
                        <label for="system-prompt">System Prompt:</label>
                        <textarea id="system-prompt" rows="4" class="prompt-textarea">Bạn là một trợ lý AI thông minh và hữu ích.</textarea>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="cancel-button">Hủy</button>
                    <button class="save-button">Lưu Cài Đặt</button>
                </div>
            </div>
        </div>
    `;

    // Thêm modal vào body
    document.body.appendChild(modal);

    // Load cài đặt hiện tại
    const storedSettings = localStorage.getItem('modelSettings');
    if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        modal.querySelector('#model-type').value = settings.modelType;
        modal.querySelector('#temperature').value = settings.temperature;
        modal.querySelector('#max-tokens').value = settings.maxTokens;
        modal.querySelector('#system-prompt').value = settings.systemPrompt;
        modal.querySelector('#temperature-value').textContent = settings.temperature;
    }

    // Xử lý sự kiện đóng modal
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.cancel-button');
    const saveButton = modal.querySelector('.save-button');
    const temperatureInput = modal.querySelector('#temperature');
    const temperatureValue = modal.querySelector('#temperature-value');

    closeButton.addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => document.body.removeChild(modal), 300);
    });

    cancelButton.addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => document.body.removeChild(modal), 300);
    });

    // Cập nhật giá trị temperature khi kéo thanh trượt
    temperatureInput.addEventListener('input', () => {
        temperatureValue.textContent = temperatureInput.value;
    });

    // Xử lý lưu cài đặt
    saveButton.addEventListener('click', async () => {
        const settings = {
            modelType: modal.querySelector('#model-type').value,
            temperature: parseFloat(modal.querySelector('#temperature').value),
            maxTokens: parseInt(modal.querySelector('#max-tokens').value),
            systemPrompt: modal.querySelector('#system-prompt').value
        };

        try {
            // Gửi cài đặt lên server
            const response = await fetch(`${CONFIG.API.BASE_URL}/api/model-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();
            
            if (data.success) {
                // Lưu cài đặt vào localStorage
                localStorage.setItem('modelSettings', JSON.stringify(settings));
                currentModel = settings.modelType;
                updateModelConfig(currentModel);
                
                // Cập nhật UI
                updateUIWithSettings(settings);
                
                // Hiển thị thông báo thành công
                showNotification('Đã lưu cài đặt thành công!', 'success');
                
                // Đóng modal
                modal.classList.add('fade-out');
                setTimeout(() => document.body.removeChild(modal), 300);
            } else {
                showNotification(data.error || 'Lỗi khi lưu cài đặt', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi lưu cài đặt:', error);
            showNotification('Lỗi kết nối server. Vui lòng thử lại.', 'error');
        }
    });

    // Hiển thị modal với animation
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.querySelector('.modal-content').classList.add('show');
    }, 10);
}

async function loadModels(modal) {
    const modelList = modal.querySelector('.model-list');
    modelList.innerHTML = `
        <div class="model-loading">
            <div class="loading-spinner"></div>
            <div>Đang tải danh sách mô hình...</div>
        </div>
    `;
    
    try {
        // Gọi API để lấy danh sách mô hình từ Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        
        const data = await response.json();
        availableModels = data.models || [];
        
        // Hiển thị và lọc mô hình theo category hiện tại
        filterAndDisplayModels(modal);
        
    } catch (error) {
        console.error('Error loading models:', error);
        modelList.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                Không thể tải danh sách mô hình. Vui lòng kiểm tra:
                <ul style="list-style: none; margin-top: 10px;">
                    <li>1. Ollama đã được khởi động</li>
                    <li>2. API endpoint (http://localhost:11434) có thể truy cập</li>
                    <li>3. CORS đã được cấu hình đúng</li>
                </ul>
            </div>
        `;
    }
}

function filterAndDisplayModels(modal) {
    const modelList = modal.querySelector('.model-list');
    const filteredModels = currentCategory === 'all' 
        ? availableModels 
        : availableModels.filter(model => getModelCategory(model.name) === currentCategory);
    
    if (filteredModels.length === 0) {
        modelList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #a0a0a0;">
                Không tìm thấy mô hình nào trong danh mục này
            </div>
        `;
        return;
    }

    // Hiển thị danh sách models đã lọc
    modelList.innerHTML = `
        <div class="model-grid">
            ${filteredModels.map(model => `
                <div class="model-item ${model.name === currentModel ? 'active' : ''}" 
                     data-model="${model.name}">
                    <div class="model-name">${model.name}</div>
                    <div class="model-info">
                        <span class="model-category-icon">
                            ${MODEL_CATEGORIES[getModelCategory(model.name)].icon}
                        </span>
                        <button class="select-model-btn ${model.name === currentModel ? 'active' : ''}" 
                                data-model="${model.name}"
                                ${model.name === currentModel ? 'disabled' : ''}>
                            ${model.name === currentModel ? 'Đang sử dụng' : 'Chọn'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Thêm sự kiện click cho các nút chọn model
    const selectButtons = modelList.querySelectorAll('.select-model-btn');
    selectButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Kiểm tra nếu đang trong quá trình chuyển đổi
            if (isModelSwitching) {
                showNotification('Hệ thống đang trong quá trình chuyển đổi LLM, xin vui lòng chờ', 'info');
                return;
            }

            const modelName = button.dataset.model;
            
            // Đóng modal ngay lập tức khi click
            const backdrop = document.querySelector('.settings-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            try {
                // Đánh dấu đang trong quá trình chuyển đổi
                isModelSwitching = true;
                
                // Tạo và hiển thị thông báo đang chuyển đổi (không tự động xóa)
                const switchingNotification = document.createElement('div');
                switchingNotification.className = 'timer-notification info';
                
                const noteElement = document.createElement('div');
                noteElement.className = 'timer-note';
                noteElement.textContent = `Đang chuyển đổi sang mô hình ${modelName}...`;
                switchingNotification.appendChild(noteElement);
                
                const container = document.querySelector('.timer-notifications-sidebar');
                if (container) {
                    container.insertBefore(switchingNotification, container.firstChild);
                    setTimeout(() => {
                        switchingNotification.style.opacity = '1';
                    }, 10);
                }
                
                // Kiểm tra model có tồn tại không
                const modelExists = availableModels.some(model => model.name === modelName);
                if (!modelExists) {
                    throw new Error(`Model ${modelName} không tồn tại`);
                }

                // Test kết nối với model mới
                try {
                    const testResponse = await fetch(`${CONFIG.API.OLLAMA_URL}/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelName,
                            prompt: "Test connection",
                            stream: false
                        })
                    });

                    if (!testResponse.ok) {
                        throw new Error('Không thể kết nối với model');
                    }

                    // Nếu test thành công, cập nhật CONFIG và UI
                    updateModelConfig(modelName);
                    currentModel = modelName;
            
                    // Xóa thông báo đang chuyển đổi và hiển thị thông báo thành công
                    if (switchingNotification) {
                        switchingNotification.remove();
                    }
                    showNotification(`Đã chuyển đổi`);

                } catch (testError) {
                    console.error('Test connection error:', testError);
                    // Xóa thông báo đang chuyển đổi và hiển thị thông báo lỗi
                    if (switchingNotification) {
                        switchingNotification.remove();
                    }
                    showNotification('Không thể kết nối với model. Vui lòng kiểm tra Ollama', 'error');
                }
                
            } catch (error) {
                console.error('Error selecting model:', error);
                // Xóa thông báo đang chuyển đổi và hiển thị thông báo lỗi
                if (switchingNotification) {
                    switchingNotification.remove();
                }
                showNotification(error.message || 'Không thể chọn mô hình. Vui lòng thử lại.', 'error');
            } finally {
                // Kết thúc quá trình chuyển đổi
                isModelSwitching = false;
            }
        });
    });
}

// Thêm hàm showNotification nếu chưa có
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Thêm hiệu ứng xuất hiện
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Tự động đóng sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    // Xử lý nút đóng
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
}

// Thêm hàm khởi tạo để load model đã chọn khi trang được tải
function initializeModelSettings() {
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
        currentModel = savedModel;
        CONFIG.API.GEMMA_MODEL = savedModel;
    }
}

// Gọi hàm khởi tạo khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    const modelSettingsBtn = document.getElementById('model-settings-btn');
    if (modelSettingsBtn) {
        modelSettingsBtn.addEventListener('click', showModelSettings);
    }
    
    // Load cài đặt từ localStorage
    loadStoredSettings();
});

// Hàm load cài đặt đã lưu
function loadStoredSettings() {
    const storedSettings = localStorage.getItem('modelSettings');
    if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        currentModel = settings.modelType;
        updateUIWithSettings(settings);
    }
}

// Hàm cập nhật UI với cài đặt
function updateUIWithSettings(settings) {
    const modelInfo = document.querySelector('.model-info');
    if (modelInfo) {
        modelInfo.innerHTML = `
            <span class="current-model">Model: ${settings.modelType}</span>
            <span class="model-temp">Temp: ${settings.temperature}</span>
        `;
    }
}

// Export các hàm cần thiết
export {
    showModelSettings,
    currentModel,
    loadStoredSettings
};