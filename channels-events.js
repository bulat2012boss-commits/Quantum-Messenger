// channels-events.js - Обработчики событий системы каналов

function setupChannelsEventListeners() {
    if (channelsTab) {
        channelsTab.addEventListener('click', function() {
            switchToChannelsTab();
        });
    }
    
    if (createChannelBtn) {
        createChannelBtn.addEventListener('click', showCreateChannelModal);
        createChannelBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
        });
        createChannelBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    }
    
    const joinChannelBtn = document.getElementById('joinChannelBtn');
    if (joinChannelBtn) {
        joinChannelBtn.addEventListener('click', showJoinChannelModal);
        joinChannelBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
        });
        joinChannelBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab')) {
            const tabType = e.target.getAttribute('data-tab');
            if (tabType !== 'channels' && currentChannel === null) {
                if (channelsContainer) {
                    channelsContainer.classList.remove('active');
                }
            }
        }
    });
    
    console.log("✅ Обработчики событий каналов настроены");
}

function loadUserStatuses() {
    if (!database) {
        console.error("База данных не инициализирована");
        return;
    }
    
    database.ref('profiles').on('value', (snapshot) => {
        if (snapshot.exists()) {
            const profiles = snapshot.val();
            userStatuses = {};
            
            Object.keys(profiles).forEach(userId => {
                const profile = profiles[userId];
                userStatuses[userId] = {
                    isOnline: profile.isOnline || false,
                    status: profile.status || 'offline',
                    lastOnline: profile.lastOnline || Date.now()
                };
            });
        }
    });
}