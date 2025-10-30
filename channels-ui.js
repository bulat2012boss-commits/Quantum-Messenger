// channels-ui.js - UI компоненты системы каналов

function createChannelsTab() {
    const tabsContainer = document.querySelector('.tabs');
    const tabContentsContainer = document.querySelector('.main-container .chat-wrapper');
    
    if (!tabsContainer || !tabContentsContainer) {
        console.error("❌ Не найден контейнер вкладок");
        setTimeout(createChannelsTab, 100);
        return;
    }
    
    if (document.querySelector('.tab[data-tab="channels"]')) {
        console.log("✅ Вкладка каналов уже существует");
        channelsTab = document.querySelector('.tab[data-tab="channels"]');
        channelsContainer = document.getElementById('tab-channels');
        return;
    }
    
    channelsTab = document.createElement('div');
    channelsTab.className = 'tab';
    channelsTab.setAttribute('data-tab', 'channels');
    channelsTab.innerHTML = '<i class="fas fa-broadcast-tower"></i> Каналы';
    tabsContainer.appendChild(channelsTab);
    
    channelsContainer = document.createElement('div');
    channelsContainer.className = 'tab-content';
    channelsContainer.id = 'tab-channels';
    
    channelsContainer.innerHTML = `
        <div class="channels-actions" style="padding: 15px; display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap;">
            <button id="createChannelBtn" style="flex: 1; min-width: 140px; padding: 12px; background: linear-gradient(to right, #4facfe, #00f2fe); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.3s ease;">
                <i class="fas fa-plus"></i> Создать канал
            </button>
            <button id="joinChannelBtn" style="flex: 1; min-width: 140px; padding: 12px; background: var(--action-btn-bg); color: var(--action-btn-color); border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer; font-size: 14px; transition: background 0.3s ease;">
                <i class="fas fa-sign-in-alt"></i> Присоединиться
            </button>
        </div>
        <div class="channels-list" id="channelsList" style="flex: 1; overflow-y: auto; padding: 10px;">
            <div class="empty-chat">
                <i class="fas fa-broadcast-tower" style="font-size: 48px; color: #9b59b6; margin-bottom: 15px;"></i>
                <p>У вас пока нет каналов</p>
                <p style="font-size: 14px; margin-top: 10px;">Создайте свой канал или присоединитесь к существующему</p>
            </div>
        </div>
        <div class="channels-footer" style="padding: 10px 15px; border-top: 1px solid var(--border-color); text-align: center;">
            <span style="font-size: 12px; opacity: 0.7;">Quantum Messenger Channels v3.5</span>
        </div>
    `;
    
    tabContentsContainer.appendChild(channelsContainer);
    channelsList = document.getElementById('channelsList');
    createChannelBtn = document.getElementById('createChannelBtn');
    
    console.log("✅ Вкладка каналов создана успешно");
}

function switchToChannelsTab() {
    toggleMobileMenuButton(true);
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (channelsTab) channelsTab.classList.add('active');
    if (channelsContainer) channelsContainer.classList.add('active');
    
    loadUserChannels();
    console.log("✅ Переключено на вкладку каналов");
}

function addChannelsStyles() {
    if (document.getElementById('channelsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'channelsStyles';
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes loadingDot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        
        .loading-dots { display: flex; gap: 4px; margin-bottom: 15px; }
        .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: #9b59b6; animation: loadingDot 1.4s ease-in-out infinite both; }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        .mobile-menu-btn:hover { transform: scale(1.1) !important; }
        .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #4facfe; }
        input:checked + .slider:before { transform: translateX(26px); }
        
        @media (max-width: 768px) {
            .channels-actions { flex-direction: column; }
            .channels-actions button { min-width: 100% !important; }
            .modal-content { width: 95% !important; margin: 10px !important; }
            .mobile-menu-btn { width: 50px !important; height: 50px !important; bottom: 15px !important; right: 15px !important; font-size: 18px !important; }
            #channel-window .chat-header { padding: 10px 15px !important; }
            #channel-window .input-area { padding: 10px !important; }
        }
        
        button { transition: all 0.2s ease !important; }
        button:hover { transform: translateY(-1px); }
        .chat-item:hover { transform: translateX(5px); }
        .modal.active { animation: fadeIn 0.3s ease; }
        .modal-content { animation: scaleIn 0.3s ease; }
        
        .empty-chat { text-align: center; padding: 40px 20px; color: var(--text-color); opacity: 0.7; }
        .empty-chat i { font-size: 48px; margin-bottom: 15px; display: block; }
        
        .message { margin-bottom: 10px; padding: 10px 15px; border-radius: 10px; animation: fadeIn 0.3s ease; max-width: 80%; }
        .my-message { background: linear-gradient(to right, #4facfe, #00f2fe); color: white; margin-left: auto; border-bottom-right-radius: 2px; }
        .other-message { background: var(--hover-color); color: var(--text-color); margin-right: auto; border-bottom-left-radius: 2px; }
        .post-message { background: var(--hover-color); border-left: 4px solid #9b59b6; padding: 15px; margin: 10px 0; border-radius: 8px; }
        
        .file-preview-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--hover-color); border-radius: 8px; margin-bottom: 5px; transition: all 0.2s ease; }
        .file-preview-item:hover { background: var(--primary-bg); }
        .remove-file-btn { background: none; border: none; color: #e74c3c; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s ease; }
        .remove-file-btn:hover { background: rgba(231, 76, 60, 0.1); }
    `;
    
    document.head.appendChild(style);
}