document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded, initializing...');
    
    // Nejdříve zobrazit CLICK ANYWHERE overlay
    showClickAnywhereOverlay();
    
    // Inicializace po načtení stránky
    initializeProfileCard();
    createParticleEffect();
    addInteractiveEffects();
    handleImageError();
    setupDiscordButton();
    initializeViewCounter();
    
    // Okamžitě spustit načítání Discord statusu
    console.log('🔄 Starting Discord status initialization...');
    initializeDiscordCompactStatus();
    
    // Kontrola, zda bylo Discord RPC již dříve aktivováno
    checkDiscordRPCStatus();
});

// CLICK ANYWHERE overlay s hudbou
function showClickAnywhereOverlay() {
    // Vytvoření overlay elementu
    const overlay = document.createElement('div');
    overlay.id = 'clickAnywhereOverlay';
    overlay.innerHTML = `
        <div class="overlay-content">
            <h1 class="overlay-title">CLICK ANYWHERE</h1>
            <p class="overlay-subtitle">Click anywhere to start</p>
        </div>
        <button id="muteButton" class="mute-button" title="Mute/Unmute">
            <span class="mute-icon">🔊</span>
        </button>
    `;
    
    // Skrytí hlavního obsahu
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.filter = 'blur(20px)';
        mainContent.style.pointerEvents = 'none';
    }
    
    // Přidání overlay na stránku
    document.body.appendChild(overlay);
    
    // Click handler pro celý overlay
    overlay.addEventListener('click', function(e) {
        if (e.target.id === 'muteButton') return; // Ignorovat klik na mute tlačítko
        
        // Skrytí overlay
        overlay.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            overlay.remove();
        }, 500);
        
        // Zobrazení hlavního obsahu
        if (mainContent) {
            mainContent.style.filter = 'none';
            mainContent.style.pointerEvents = 'auto';
        }
        
        // Spuštění hudby
        startBackgroundMusic();
    });
    
    // Mute tlačítko
    const muteButton = document.getElementById('muteButton');
    let isMuted = false;
    
    muteButton.addEventListener('click', function() {
        isMuted = !isMuted;
        const audio = document.getElementById('backgroundMusic');
        
        if (audio) {
            if (isMuted) {
                audio.pause();
                this.querySelector('.mute-icon').textContent = '🔇';
                this.title = 'Unmute';
            } else {
                audio.play();
                this.querySelector('.mute-icon').textContent = '🔊';
                this.title = 'Mute';
            }
        }
    });
    
    // Přidání CSS stylů pro overlay
    addOverlayStyles();
}

// Spuštění hudby
function startBackgroundMusic() {
    const audio = document.createElement('audio');
    audio.id = 'backgroundMusic';
    audio.src = 'assets/music/background-music.mp3'; // Změň název souboru podle tvé hudby
    audio.loop = true;
    audio.volume = 0.3;
    
    // Pokus o přehrání
    audio.play().catch(error => {
        console.log('Audio autoplay failed:', error);
        // Hudba se spustí až po interakci uživatele
    });
    
    document.body.appendChild(audio);
}

// CSS styly pro overlay
function addOverlayStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #clickAnywhereOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            animation: fadeIn 0.5s ease-out;
        }
        
        .overlay-content {
            text-align: center;
            color: white;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .overlay-title {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
        }
        
        .overlay-subtitle {
            font-size: 1.5rem;
            opacity: 0.8;
            font-weight: 300;
        }
        
        .mute-button {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .mute-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.1);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @media (max-width: 768px) {
            .overlay-title {
                font-size: 2.5rem;
            }
            
            .overlay-subtitle {
                font-size: 1.2rem;
            }
            
            .mute-button {
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
}

function initializeProfileCard() {
    const profileCard = document.querySelector('.profile-card');
    
    // Animace při načtení stránky
    profileCard.style.opacity = '0';
    profileCard.style.transform = 'translateY(50px) scale(0.9)';
    
    setTimeout(() => {
        profileCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        profileCard.style.opacity = '1';
        profileCard.style.transform = 'translateY(0) scale(1)';
    }, 300);
}

function createParticleEffect() {
    const container = document.querySelector('.container');
    
    // Vytvoření plovoucích částic
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Náhodné pozice a velikosti
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const animationDuration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
            animation: floatParticle ${animationDuration}s linear infinite;
            animation-delay: ${delay}s;
        `;
        
        document.body.appendChild(particle);
    }
    
    // CSS animace pro částice
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.5;
            }
            90% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function addInteractiveEffects() {
    const avatar = document.getElementById('avatar');
    const socialLinks = document.querySelectorAll('.social-link');
    const profileCard = document.querySelector('.profile-card');
    
    // Avatar bez efektů - pouze statický obrázek
    
    // Efekty pro sociální odkazy
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Ripple efekt
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size/2}px;
                top: ${e.clientY - rect.top - size/2}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 10;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            // Odstranění ripple efektu
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
            
            // Otevření odkazu v novém tabu
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
        });
    });
    
    // Efekt parallaxy při pohybu myši
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        profileCard.style.transform = `
            translateX(${mouseX * 10}px) 
            translateY(${mouseY * 10}px) 
            rotateY(${mouseX * 5}deg) 
            rotateX(${-mouseY * 5}deg)
        `;
        
        // Pohyb dekoračních prvků
        const decoration1 = document.querySelector('.decoration-1');
        const decoration2 = document.querySelector('.decoration-2');
        
        if (decoration1) {
            decoration1.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
        }
        if (decoration2) {
            decoration2.style.transform = `translate(${-mouseX * 15}px, ${-mouseY * 15}px)`;
        }
    });
    
    // Reset při opuštění okna
    document.addEventListener('mouseleave', function() {
        profileCard.style.transform = 'translateX(0) translateY(0) rotateY(0) rotateX(0)';
        
        const decoration1 = document.querySelector('.decoration-1');
        const decoration2 = document.querySelector('.decoration-2');
        
        if (decoration1) decoration1.style.transform = 'translate(0, 0)';
        if (decoration2) decoration2.style.transform = 'translate(0, 0)';
    });
    
    // CSS pro ripple efekt
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

function handleImageError() {
    const avatar = document.getElementById('avatar');
    
    // Fallback pokud se obrázek nenačte
    avatar.addEventListener('error', function() {
        this.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
        this.innerHTML = '🎮'; // Gaming emoji jako placeholder
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.style.fontSize = '48px';
    });
    
    // Nastavení fallback hned pokud není src
    if (!avatar.src || avatar.src.includes('profile.jpg')) {
        // Vyvolej error event, aby se použil fallback bez volání neexistujícího avatar.onerror
        avatar.dispatchEvent(new Event('error'));
    }
}

// Efekt psacího stroje pro text
function typewriterEffect(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Animace při scrollování (pokud by byla stránka delší)
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.social-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
}

// Spuštění scroll animací
setTimeout(handleScrollAnimations, 1000);

// Discord Rich Presence Button funkcionalita
function setupDiscordButton() {
    const discordBtn = document.getElementById('discordRichPresenceBtn');
    
    if (discordBtn) {
        discordBtn.addEventListener('click', function() {
            // Animace při kliknutí
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 100);
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            // Aktivace Discord Rich Presence
            activateDiscordRichPresence();
        });
        
        // Hover efekty
        discordBtn.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.btn-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.filter = 'drop-shadow(0 0 10px #5865f2)';
            }
        });
        
        discordBtn.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.btn-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.filter = 'none';
            }
        });
    }
}

// Skutečný Discord status widget
function activateDiscordRichPresence() {
    // Zobrazí Discord status widget
    showDiscordStatusWidget();
}

// Získání Discord statusu (pomocí Lanyard API)
async function fetchDiscordStatus() {
    try {
        // Nahradte YOUR_DISCORD_USER_ID vaším skutečným Discord User ID
        const DISCORD_USER_ID = '876151017329291284'; // Zaměňte za svůj Discord ID
        
        console.log('Fetching Discord status for ID:', DISCORD_USER_ID);
        
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Discord API response:', data);
        
        if (data.success && data.data) {
            console.log('Successfully fetched Discord status:', data.data);
            return data.data;
        } else {
            throw new Error('API returned success: false or no data');
        }
    } catch (error) {
        console.error('Error fetching Discord status:', error);
        console.log('Using fallback Discord data');
        
        // Fallback data s vašimi skutečnými informacemi
        return {
            discord_user: {
                id: '876151017329291284',
                username: 'adiss17',
                discriminator: '0',
                avatar: '73bdab639963a6f12bc1ffd142a207fa',
                global_name: 'Adiss'
            },
            discord_status: 'online',
            activities: [],
            listening_to_spotify: false
        };
    }
}

// Zobrazí Discord status widget
async function showDiscordStatusWidget() {
    const discordData = await fetchDiscordStatus();
    
    // Zavření existujícího widgetu pokud existuje
    const existingWidget = document.querySelector('.discord-widget');
    if (existingWidget) {
        existingWidget.remove();
    }
    
    const widget = document.createElement('div');
    widget.className = 'discord-widget';
    
    // Získání avatar URL
    const avatarUrl = discordData.discord_user.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    // Status barvy
    const statusColors = {
        online: '#23a55a',
        idle: '#f0b232',
        dnd: '#f23f42',
        offline: '#80848e'
    };
    
    // Získání aktuální aktivity
    const currentActivity = discordData.activities && discordData.activities.length > 0 
        ? discordData.activities[0] 
        : null;
    
    // Spotify informace (preferuj Lanyard spotify objekt)
    const spotifyActivity = (discordData.listening_to_spotify && discordData.spotify)
        ? { details: discordData.spotify.song, state: discordData.spotify.artist }
        : (discordData.listening_to_spotify
            ? (discordData.activities && discordData.activities.find(activity => activity.name === 'Spotify'))
            : null);
    
    widget.innerHTML = `
        <div class="discord-widget-content">
            <div class="discord-widget-header">
                <div class="discord-avatar-container">
                    <img src="${avatarUrl}" alt="Discord Avatar" class="discord-avatar" />
                    <div class="discord-status-indicator" style="background-color: ${statusColors[discordData.discord_status] || statusColors.offline}"></div>
                </div>
                <div class="discord-user-info">
                    <h3 class="discord-username">${discordData.discord_user.global_name || discordData.discord_user.username}</h3>
                    <p class="discord-status-text">${getStatusText(discordData.discord_status)}</p>
                </div>
                <button class="discord-widget-close" onclick="closeDiscordWidget()">×</button>
            </div>
            
            ${currentActivity ? `
                <div class="discord-activity">
                    <div class="activity-icon">🎮</div>
                    <div class="activity-info">
                        <div class="activity-name">${currentActivity.name}</div>
                        ${currentActivity.details ? `<div class="activity-details">${currentActivity.details}</div>` : ''}
                        ${currentActivity.state ? `<div class="activity-state">${currentActivity.state}</div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${spotifyActivity ? `
                <div class="discord-spotify">
                    <div class="spotify-icon">🎵</div>
                    <div class="spotify-info">
                        <div class="spotify-track">${spotifyActivity.details || 'Unknown Track'}</div>
                        <div class="spotify-artist">by ${spotifyActivity.state || 'Unknown Artist'}</div>
                    </div>
                </div>
            ` : ''}
            
            <div class="discord-widget-footer">
                <small>Real-time Discord status</small>
                <div class="discord-last-updated">Updated now</div>
            </div>
        </div>
    `;
    
    // Přidání CSS stylů
    addDiscordWidgetStyles();
    
    document.body.appendChild(widget);
    
    // Aktualizace stavu tlačítka
    updateDiscordStatus('active');
    
    // Spuštění automatických aktualizací
    startDiscordWidgetUpdates();
}

// Získání textu pro status
function getStatusText(status) {
    switch(status) {
        case 'online': return 'Online';
        case 'idle': return 'Away';
        case 'dnd': return 'Do Not Disturb';
        case 'offline': return 'Offline';
        default: return 'Unknown';
    }
}

// Zavření Discord widgetu
function closeDiscordWidget() {
    const widget = document.querySelector('.discord-widget');
    if (widget) {
        widget.style.animation = 'slideOutRight 0.4s ease-out forwards';
        setTimeout(() => {
            if (widget.parentNode) {
                widget.remove();
            }
        }, 400);
    }
    
    // Aktualizace stavu tlačítka
    updateDiscordStatus('inactive');
    
    // Zastavení aktualizací
    if (window.discordUpdateInterval) {
        clearInterval(window.discordUpdateInterval);
        window.discordUpdateInterval = null;
    }
}

// Spuštění automatických aktualizací
function startDiscordWidgetUpdates() {
    // Zastavení existujícího intervalu
    if (window.discordUpdateInterval) {
        clearInterval(window.discordUpdateInterval);
    }
    
    // Nový interval pro aktualizace každých 15 sekund
    window.discordUpdateInterval = setInterval(async () => {
        const widget = document.querySelector('.discord-widget');
        if (widget) {
            try {
                const discordData = await fetchDiscordStatus();
                updateDiscordWidgetContent(discordData);
            } catch (error) {
                console.log('Error updating Discord widget:', error);
            }
        } else {
            // Widget již neexistuje, zastav aktualizace
            clearInterval(window.discordUpdateInterval);
            window.discordUpdateInterval = null;
        }
    }, 15000); // 15 sekund
}

// Aktualizace obsahu widgetu
function updateDiscordWidgetContent(discordData) {
    const widget = document.querySelector('.discord-widget');
    if (!widget) return;
    
    // Aktualizace avatar
    const avatar = widget.querySelector('.discord-avatar');
    const avatarUrl = discordData.discord_user.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    avatar.src = avatarUrl;
    
    // Aktualizace status indikátoru
    const statusIndicator = widget.querySelector('.discord-status-indicator');
    const statusColors = {
        online: '#23a55a',
        idle: '#f0b232',
        dnd: '#f23f42',
        offline: '#80848e'
    };
    statusIndicator.style.backgroundColor = statusColors[discordData.discord_status] || statusColors.offline;
    
    // Aktualizace status textu
    const statusText = widget.querySelector('.discord-status-text');
    statusText.textContent = getStatusText(discordData.discord_status);
    
    // Aktualizace času
    const lastUpdated = widget.querySelector('.discord-last-updated');
    lastUpdated.textContent = 'Updated now';
    
    // Animace pro znázornění aktualizace
    widget.style.transform = 'scale(1.02)';
    setTimeout(() => {
        widget.style.transform = 'scale(1)';
    }, 200);
}

// Přidání CSS stylů pro Discord widget
function addDiscordWidgetStyles() {
    // Kontrola, zda styly již neexistují
    if (document.querySelector('#discord-widget-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'discord-widget-styles';
    style.textContent = `
        .discord-widget {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            border: 1px solid rgba(88, 101, 242, 0.3);
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 60px rgba(88, 101, 242, 0.2);
            z-index: 1000;
            min-width: 350px;
            max-width: 400px;
            animation: slideInCenter 0.4s ease-out;
            font-family: 'Inter', sans-serif;
        }
        
        .discord-widget-content {
            padding: 20px;
        }
        
        .discord-widget-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .discord-avatar-container {
            position: relative;
            flex-shrink: 0;
        }
        
        .discord-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid rgba(88, 101, 242, 0.5);
            transition: all 0.3s ease;
        }
        
        .discord-status-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 3px solid rgba(30, 30, 30, 1);
            animation: statusPulse 2s ease-in-out infinite;
        }
        
        .discord-user-info {
            flex: 1;
            color: white;
        }
        
        .discord-username {
            margin: 0 0 5px 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
        }
        
        .discord-status-text {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.7;
            text-transform: capitalize;
        }
        
        .discord-widget-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.2s ease;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .discord-widget-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            transform: scale(1.1);
        }
        
        .discord-activity {
            background: rgba(88, 101, 242, 0.1);
            border: 1px solid rgba(88, 101, 242, 0.2);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .activity-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .activity-info {
            flex: 1;
            color: white;
        }
        
        .activity-name {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 4px;
            color: #5865f2;
        }
        
        .activity-details,
        .activity-state {
            font-size: 0.85rem;
            opacity: 0.8;
            margin-bottom: 2px;
            line-height: 1.3;
        }
        
        .discord-spotify {
            background: rgba(29, 185, 84, 0.1);
            border: 1px solid rgba(29, 185, 84, 0.3);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .spotify-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .spotify-info {
            flex: 1;
            color: white;
        }
        
        .spotify-track {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 4px;
            color: #1db954;
        }
        
        .spotify-artist {
            font-size: 0.85rem;
            opacity: 0.8;
        }
        
        .discord-widget-footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.75rem;
        }
        
        .discord-last-updated {
            font-weight: 500;
        }
        
        @keyframes slideInCenter {
            from {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes statusPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
            }
        }
        
        @media (max-width: 480px) {
            .discord-widget {
                min-width: 90vw;
                max-width: 90vw;
                margin: 0 5vw;
            }
            
            .discord-widget-content {
                padding: 15px;
            }
            
            .discord-avatar {
                width: 50px;
                height: 50px;
            }
            
            .discord-status-indicator {
                width: 14px;
                height: 14px;
                border-width: 2px;
            }
            
            .discord-username {
                font-size: 1rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Globální funkce pro zavření widgetu
window.closeDiscordWidget = closeDiscordWidget;

// Zobrazení notifikace o aktivaci Discord RPC
function showDiscordNotification() {
    const notification = document.createElement('div');
    notification.className = 'discord-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="discord-icon">💬</div>
            <div class="notification-text">
                <h4>Discord Rich Presence</h4>
                <p>Successfully activated! Your activity is now visible on Discord.</p>
            </div>
            <button class="close-notification" onclick="closeDiscordNotification()">×</button>
        </div>
    `;
    
    // CSS pro notifikaci
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .discord-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #5865f2, #4752c4);
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 8px 32px rgba(88, 101, 242, 0.3);
            z-index: 1000;
            max-width: 350px;
            animation: slideInRight 0.4s ease-out;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            color: white;
        }
        
        .discord-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .notification-text h4 {
            margin: 0 0 5px 0;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .notification-text p {
            margin: 0;
            font-size: 0.8rem;
            opacity: 0.9;
            line-height: 1.3;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }
        
        .close-notification:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 480px) {
            .discord-notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(notificationStyle);
    document.body.appendChild(notification);
    
    // Automatické zavření po 5 sekundách
    setTimeout(() => {
        closeDiscordNotification();
    }, 5000);
}

// Zavření Discord notifikace
function closeDiscordNotification() {
    const notification = document.querySelector('.discord-notification');
    if (notification) {
        notification.style.animation = 'slideOutRight 0.4s ease-out forwards';
        
        // Přidání keyframes pro slide out
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(slideOutStyle);
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 400);
    }
}

// Aktualizace Discord statusu na tlačítku
function updateDiscordStatus(status) {
    const discordBtn = document.getElementById('discordRichPresenceBtn');
    if (discordBtn) {
        if (status === 'active') {
            discordBtn.classList.add('discord-active');
            discordBtn.setAttribute('title', 'Discord Rich Presence Active');
        } else {
            discordBtn.classList.remove('discord-active');
            discordBtn.setAttribute('title', 'Activate Discord Rich Presence');
        }
    }
}

// Globální funkce pro zavření notifikace
window.closeDiscordNotification = closeDiscordNotification;

// VIEW COUNTER - Real-time počítadlo views
function initializeViewCounter() {
    // Získání nebo vytvoření fingerprinu návštěvníka
    const visitorFingerprint = getVisitorFingerprint();
    
    // Načtení současných statistik
    const stats = getViewStats();
    
    // Kontrola, jestli je to nová návštěva
    const isNewVisit = checkAndRecordVisit(visitorFingerprint, stats);
    
    // Aktualizace počítadel
    updateViewCounters(stats);
    
    // Spuštění real-time aktualizací
    startRealTimeUpdates();
    
    // Přidání event listenerů pro další akce
    setupViewTracking();
    
    // Inicializace minihry s kolečkem
    initializeClickGame();
}

// Vytvoření unikátního fingerprinu návštěvníka
function getVisitorFingerprint() {
    // Kombinace různých vlastností pro vytvoření fingerprinu
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('AdissProfile', 2, 2);
    
    const fingerprint = {
        screen: screen.width + 'x' + screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL(),
        userAgent: navigator.userAgent.slice(0, 50), // Zkráceno kvůli GDPR
        timestamp: Date.now()
    };
    
    // Vytvoření hash z fingerprinu
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return 'visitor_' + Math.abs(hash).toString(36);
}

// Načtení statistik z localStorage
function getViewStats() {
    const defaultStats = {
        totalViews: 0,
        uniqueViews: 0,
        visitors: {},
        dailyStats: {},
        lastUpdated: Date.now()
    };
    
    try {
        const saved = localStorage.getItem('adiss-profile-stats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch (error) {
        console.log('Loading default stats');
        return defaultStats;
    }
}

// Uložení statistik do localStorage
function saveViewStats(stats) {
    try {
        stats.lastUpdated = Date.now();
        localStorage.setItem('adiss-profile-stats', JSON.stringify(stats));
    } catch (error) {
        console.log('Could not save stats');
    }
}

// Kontrola a záznam návštěvy
function checkAndRecordVisit(fingerprint, stats) {
    const today = new Date().toDateString();
    const now = Date.now();
    
    // Inicializace denních statistik
    if (!stats.dailyStats[today]) {
        stats.dailyStats[today] = { views: 0, unique: 0 };
    }
    
    let isNewVisit = false;
    let isUniqueVisit = false;
    let shouldCountView = false;
    
    // Kontrola, jestli je návštěvník nový nebo se vrátil
    if (!stats.visitors[fingerprint]) {
        // Nový návštěvník - vždy se počítá
        stats.visitors[fingerprint] = {
            firstVisit: now,
            lastVisit: now,
            lastCountedVisit: now,
            visitCount: 1,
            sessions: [{ start: now, views: 1 }]
        };
        isNewVisit = true;
        isUniqueVisit = true;
        shouldCountView = true;
        stats.uniqueViews++;
        stats.dailyStats[today].unique++;
    } else {
        // Existující návštěvník
        const visitor = stats.visitors[fingerprint];
        const timeSinceLastCounted = now - visitor.lastCountedVisit;
        
        // Počítá se view pouze pokud uplynula hodina od posledního počítaného view
        if (timeSinceLastCounted > 60 * 60 * 1000) { // 60 minut = 1 hodina
            shouldCountView = true;
            visitor.lastCountedVisit = now;
        }
        
        // Nová session pokud byla přestávka více než 30 minut
        const timeSinceLastVisit = now - visitor.lastVisit;
        if (timeSinceLastVisit > 30 * 60 * 1000) {
            visitor.sessions.push({ start: now, views: 1 });
            isNewVisit = true;
        } else {
            // Pokračování ve stejné session
            visitor.sessions[visitor.sessions.length - 1].views++;
        }
        
        // Vždy se aktualizuje čas poslední návštěvy
        visitor.lastVisit = now;
        visitor.visitCount++;
    }
    
    // Aktualizace celkových statistik pouze pokud se má počítat view
    if (shouldCountView) {
        stats.totalViews++;
        stats.dailyStats[today].views++;
    }
    
    // Uložení statistik
    saveViewStats(stats);
    
    return { isNewVisit, isUniqueVisit, shouldCountView };
}

// Aktualizace počítadel na stránce
function updateViewCounters(stats) {
    const viewCountElement = document.getElementById('viewCount');
    
    if (viewCountElement) {
        // Animace číslic
        animateNumber(viewCountElement, parseInt(viewCountElement.textContent) || 0, stats.totalViews);
    }
}

// Animace přírůstku čísel
function animateNumber(element, startValue, endValue) {
    const duration = 1000; // 1 sekunda
    const startTime = performance.now();
    const difference = endValue - startValue;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing funkce pro smooth animaci
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (difference * easeOutQuart));
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Spuštění real-time aktualizací
function startRealTimeUpdates() {
    // Aktualizace každých 30 sekund pro zachycení změn z jiných tabů
    setInterval(() => {
        const currentStats = getViewStats();
        updateViewCounters(currentStats);
    }, 30000);
    
    // Listener pro změny v localStorage (jiné taby)
    window.addEventListener('storage', (e) => {
        if (e.key === 'adiss-profile-stats') {
            const newStats = JSON.parse(e.newValue || '{}');
            updateViewCounters(newStats);
        }
    });
}

// Nastavení trackingu dodatečných akcí
function setupViewTracking() {
    // Tracking času stráveného na stránce
    let startTime = Date.now();
    let isActive = true;
    
    // Tracking fokus/blur pro měření aktivního času
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            isActive = false;
            recordTimeSpent(Date.now() - startTime);
        } else {
            startTime = Date.now();
            isActive = true;
        }
    });
    
    // Tracking před zavřením stránky
    window.addEventListener('beforeunload', () => {
        if (isActive) {
            recordTimeSpent(Date.now() - startTime);
        }
    });
    
    // Tracking interakcí (kliky na prvky)
    document.addEventListener('click', (e) => {
        recordInteraction(e.target.tagName, e.target.className);
    });
}

// Záznam času stráveného na stránce
function recordTimeSpent(timeSpent) {
    if (timeSpent < 1000) return; // Ignorovat velmi krátké časy
    
    const stats = getViewStats();
    const fingerprint = getVisitorFingerprint();
    
    if (stats.visitors[fingerprint]) {
        const currentSession = stats.visitors[fingerprint].sessions.slice(-1)[0];
        currentSession.timeSpent = (currentSession.timeSpent || 0) + timeSpent;
        saveViewStats(stats);
    }
}

// Záznam interakcí
function recordInteraction(element, className) {
    const stats = getViewStats();
    const fingerprint = getVisitorFingerprint();
    
    if (stats.visitors[fingerprint]) {
        const currentSession = stats.visitors[fingerprint].sessions.slice(-1)[0];
        if (!currentSession.interactions) {
            currentSession.interactions = [];
        }
        currentSession.interactions.push({
            element,
            className,
            timestamp: Date.now()
        });
        saveViewStats(stats);
    }
}

// Debug funkce pro zobrazení statistik v konzoli
function showStats() {
    const stats = getViewStats();
    console.group('📊 Adiss Profile Stats');
    console.log('Total Views:', stats.totalViews);
    console.log('Unique Visitors:', stats.uniqueViews);
    console.log('Daily Stats:', stats.dailyStats);
    console.log('Visitors:', Object.keys(stats.visitors).length);
    console.groupEnd();
}

// Kontrola Discord RPC statusu při načtení stránky
function checkDiscordRPCStatus() {
    const discordData = localStorage.getItem('discord-rpc-data');
    if (discordData) {
        try {
            const data = JSON.parse(discordData);
            // Kontrola, zda je data stále platná (např. ne starší než 24 hodin)
            const daysPassed = (Date.now() - data.startTimestamp) / (1000 * 60 * 60 * 24);
            if (daysPassed < 1) {
                updateDiscordStatus('active');
            } else {
                // Vypršená data, vymazání
                localStorage.removeItem('discord-rpc-data');
            }
        } catch (error) {
            console.log('Error checking Discord RPC status');
        }
    }
}

// Inicializace kompaktního Discord statusu
async function initializeDiscordCompactStatus() {
    const compactWidget = document.getElementById('discordStatusCompact');
    if (!compactWidget) return;
    
    // Nejdříve zobrazíme fallback data okamžitě
    const fallbackData = {
        discord_user: {
            id: '876151017329291284',
            username: 'adiss17',
            discriminator: '0',
            avatar: '73bdab639963a6f12bc1ffd142a207fa',
            global_name: 'Adiss'
        },
        discord_status: 'online',
        activities: [],
        listening_to_spotify: false
    };
    
    console.log('Initializing Discord compact status with fallback data');
    updateCompactDiscordWidget(fallbackData);
    
    // Přidání click handleru pro otevření detailního widgetu
    compactWidget.addEventListener('click', () => {
        showDiscordStatusWidget();
    });
    
    try {
        // Pokusíme se získat skutečná data z API
        console.log('Trying to fetch real Discord data...');
        const discordData = await fetchDiscordStatus();
        
        // Aktualizace kompaktního widgetu se skutečnými daty
        console.log('Updating with real Discord data');
        updateCompactDiscordWidget(discordData);
        
        // Spuštění automatických aktualizací
        startCompactDiscordUpdates();
        
    } catch (error) {
        console.log('Error fetching real Discord data, keeping fallback:', error);
    }
}

// Aktualizace kompaktního Discord widgetu
function updateCompactDiscordWidget(discordData) {
    const compactImg = document.querySelector('.discord-compact-img');
    const compactName = document.querySelector('.discord-compact-name');
    const compactStatus = document.querySelector('.discord-compact-status');
    const compactIndicator = document.querySelector('.discord-compact-indicator');
    
    if (!compactImg || !compactName || !compactStatus || !compactIndicator) return;
    
    // Aktualizace avatar
    const avatarUrl = discordData.discord_user.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    compactImg.src = avatarUrl;
    
    // Aktualizace jména
    compactName.textContent = discordData.discord_user.global_name || discordData.discord_user.username;
    
    // Status barvy
    const statusColors = {
        online: '#23a55a',
        idle: '#f0b232',
        dnd: '#f23f42',
        offline: '#80848e'
    };
    
    // Aktualizace status indikátoru
    compactIndicator.style.backgroundColor = statusColors[discordData.discord_status] || statusColors.offline;
    
    // Aktualizace status textu
    const currentActivity = discordData.activities && discordData.activities.length > 0 
        ? discordData.activities[0] 
        : null;
    
    let statusText = getStatusText(discordData.discord_status);
    
    if (discordData.listening_to_spotify) {
        if (discordData.spotify && (discordData.spotify.song || discordData.spotify.artist)) {
            const song = discordData.spotify.song || 'Listening to Spotify';
            const artist = discordData.spotify.artist ? ` — ${discordData.spotify.artist}` : '';
            statusText = `🎵 ${song}${artist}`;
        } else {
            const spotifyActivity = discordData.activities && discordData.activities.find(activity => activity.name === 'Spotify');
            statusText = `🎵 ${spotifyActivity?.details || 'Listening to Spotify'}`;
        }
    } else if (currentActivity) {
        statusText = `🎮 ${currentActivity.name}`;
    }
    
    console.log('📱 Discord status updated:', statusText);
    compactStatus.textContent = statusText;
}

// Spuštění automatických aktualizací pro kompaktní widget
function startCompactDiscordUpdates() {
    // Zastavení existujícího intervalu
    if (window.discordCompactUpdateInterval) {
        clearInterval(window.discordCompactUpdateInterval);
    }
    
    // Nový interval pro aktualizace každých 20 sekund
    window.discordCompactUpdateInterval = setInterval(async () => {
        const compactWidget = document.getElementById('discordStatusCompact');
        if (compactWidget && compactWidget.style.display !== 'none') {
            try {
                const discordData = await fetchDiscordStatus();
                updateCompactDiscordWidget(discordData);
            } catch (error) {
                console.log('Error updating compact Discord widget:', error);
            }
        }
    }, 20000); // 20 sekund
}

// Globální funkce pro debug (můžete volat showStats() v konzoli)
window.showStats = showStats;

// Minihra s kolečkem - Click Counter
function initializeClickGame() {
    const clickCircle = document.getElementById('clickCircle');
    const clickCountElement = document.getElementById('clickCount');
    
    if (!clickCircle || !clickCountElement) return;
    
    // Načtení počtu kliků z localStorage
    let totalClicks = parseInt(localStorage.getItem('adiss-click-count') || '0');
    clickCountElement.textContent = totalClicks;
    
    // Click handler pro kolečko
    clickCircle.addEventListener('click', function() {
        // Zvýšení počtu kliků
        totalClicks++;
        clickCountElement.textContent = totalClicks;
        
        // Uložení do localStorage
        localStorage.setItem('adiss-click-count', totalClicks.toString());
        
        // Animace při kliknutí
        this.style.transform = 'scale(0.9)';
        this.style.background = 'linear-gradient(45deg, #ee5a24, #ff6b6b)';
        
        // Reset animace
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        }, 150);
        
        // Ripple efekt
        createClickRipple(this, event);
        
        // Zvukový efekt (volitelně)
        playClickSound();
    });
}

// Vytvoření ripple efektu při kliknutí
function createClickRipple(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${event.clientX - rect.left - size/2}px;
        top: ${event.clientY - rect.top - size/2}px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: clickRipple 0.6s linear;
        pointer-events: none;
        z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Odstranění ripple efektu
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Zvukový efekt při kliknutí (volitelně)
function playClickSound() {
    // Vytvoření jednoduchého zvukového efektu
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Přidání CSS pro ripple efekt
const clickRippleStyle = document.createElement('style');
clickRippleStyle.textContent = `
    @keyframes clickRipple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(clickRippleStyle);
