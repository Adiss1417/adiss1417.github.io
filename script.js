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
    // Wire fav movie button (open provided TikTok link in new tab)
    try {
        const favBtn = document.getElementById('favMovieBtn');
        if (favBtn && favBtn.tagName === 'BUTTON') {
            // only wire JS opener for button elements; anchors use native navigation
            favBtn.addEventListener('click', function () {
                window.open('https://www.tiktok.com/@roxpowmg/video/7521183819693657350', '_blank', 'noopener');
            });
        }
    } catch (e) {
        console.error('fav movie button wiring failed', e);
    }
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

    // Skrytí hlavního obsahu vizuálně, ale necháme pod ním tlačítka interaktivní
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.filter = 'blur(20px)';
            // don't disable pointer events so underlying buttons can be clicked
    }

    // Přidání overlay na stránku
    document.body.appendChild(overlay);

        // Click handler for overlay: forward click to underlying element (if any) and start music
        overlay.addEventListener('click', function(e) {
            if (e.target.id === 'muteButton') return; // ignore clicks on mute

            const x = e.clientX;
            const y = e.clientY;

            // Temporarily make overlay ignore pointer events to detect underlying element
            overlay.style.pointerEvents = 'none';
            const underlying = document.elementFromPoint(x, y);
            // restore overlay pointer handling
            overlay.style.pointerEvents = 'auto';

            // If user actually clicked a button/link underneath, trigger it
            try {
                if (underlying) {
                    const tag = underlying.tagName;
                    if (tag === 'BUTTON' || tag === 'A' || underlying.classList.contains('click-circle') || underlying.classList.contains('fav-movie-btn') || underlying.classList.contains('social-link')) {
                        // trigger click on underlying element
                        underlying.click();
                        window.__userClickedAButton = true;
                    }
                }
            } catch (err) {
                console.warn('Forward click failed', err);
            }

            // Fade out overlay and unblur content
            overlay.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                overlay.remove();
                if (mainContent) mainContent.style.filter = 'none';
            }, 500);

            // Start music on any overlay click
            startBackgroundMusic();
        });
    
    // Mute tlačítko (funguje i pokud audio ještě nebylo vytvořeno)
    const muteButton = document.getElementById('muteButton');
    let isMuted = false;
    
    muteButton.addEventListener('click', function(e) {
        e.stopPropagation();
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
        } else {
            // Pokud audio ještě neexistuje, update ikonu jen vizuálně
            this.querySelector('.mute-icon').textContent = isMuted ? '🔇' : '🔊';
            this.title = isMuted ? 'Unmute' : 'Mute';
        }
    });
    
    // Přidání CSS stylů pro overlay
    addOverlayStyles();
}

// Initialize and update the small compact Discord status block inside the profile card
async function initializeDiscordCompactStatus() {
    const container = document.getElementById('discordStatusCompact');
    if (!container) return;

    async function updateCompact() {
        try {
            const DISCORD_USER_ID = '876151017329291284';
            const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            if (!res.ok) throw new Error('Lanyard fetch failed');
            const payload = await res.json();
            const data = payload && payload.data ? payload.data : null;

            if (!data) throw new Error('No data');

            const nameEl = container.querySelector('.discord-compact-name');
            const statusEl = container.querySelector('.discord-compact-status');
            const imgEl = container.querySelector('.discord-compact-img');
            const indicator = container.querySelector('.discord-compact-indicator');

            if (nameEl) nameEl.textContent = data.discord_user.global_name || data.discord_user.username || nameEl.textContent;
            // prefer showing Spotify in compact if available; otherwise show game/activity
            let activityText = '';
            try {
                // if Spotify is active, prefer showing it in compact
                if (data.listening_to_spotify && data.spotify) {
                    activityText = `Listening: ${data.spotify.song || 'Unknown'} — ${data.spotify.artist || 'Unknown'}`;
                } else {
                    // find first non-Spotify activity (game)
                    let gameActivity = null;
                    if (data.activities && data.activities.length > 0) {
                        gameActivity = data.activities.find(a => {
                            const name = (a.name || '').toLowerCase();
                            return name && !name.includes('spotify') && name !== '';
                        }) || null;
                    }

                    if (gameActivity) {
                        activityText = gameActivity.name || '';
                        if (gameActivity.details) activityText += `: ${gameActivity.details}`;
                        if (gameActivity.state) activityText += ` — ${gameActivity.state}`;
                    } else if (data.activities && data.activities.length > 0) {
                        const act = data.activities[0];
                        activityText = act.name || getStatusText(data.discord_status) || data.discord_status || 'Offline';
                    } else {
                        activityText = getStatusText(data.discord_status) || data.discord_status || 'Offline';
                    }
                }
            } catch (e) {
                activityText = getStatusText(data.discord_status) || data.discord_status || 'Offline';
            }

            if (statusEl) {
                statusEl.textContent = activityText;
                // keep full status info in title for hover
                statusEl.title = JSON.stringify({ status: data.discord_status, activities: data.activities || [], spotify: data.spotify || null });
            }
            if (imgEl && data.discord_user && data.discord_user.avatar) {
                imgEl.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`;
            }
            if (indicator) {
                const map = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f42', offline: '#80848e' };
                indicator.style.backgroundColor = map[data.discord_status] || map.offline;
            }
        } catch (err) {
            console.warn('Failed to update compact Discord status:', err);
        }
    }

    // initial update and periodic refresh every 20s
    updateCompact();
    // make compact block interactive: open full widget on click / Enter / Space
    try {
        if (!container.dataset.discordInteractive) {
            container.style.cursor = 'pointer';
            container.setAttribute('role', 'button');
            container.tabIndex = 0;
            container.addEventListener('click', function (e) {
                e.preventDefault();
                showDiscordStatusWidget();
            });
            container.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showDiscordStatusWidget();
                }
            });
            container.dataset.discordInteractive = '1';
        }
    } catch (err) {
        console.warn('Failed to attach compact discord handlers', err);
    }

    setInterval(updateCompact, 20000);
}

// Simple check to toggle visual state for RPC button (keeps backward compatibility)
function checkDiscordRPCStatus() {
    const discordBtn = document.getElementById('discordRichPresenceBtn');
    if (!discordBtn) return;
    // if user previously activated RPC, mark it visually
    const active = !!localStorage.getItem('discord_rpc_active');
    if (active) discordBtn.classList.add('discord-active');
    else discordBtn.classList.remove('discord-active');
}

// Spuštění hudby
function startBackgroundMusic() {
    // configurable start time in seconds (set to desired offset)
    const MUSIC_START_SEC = 30; // <-- change this number to start later/earlier in the track

    const audio = document.createElement('audio');
    audio.id = 'backgroundMusic';
    audio.src = 'assets/music/song1.mp3';
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';

    // Seek to configured start time after metadata loads (safe across browsers)
    const trySeekAndPlay = () => {
        try {
            if (typeof MUSIC_START_SEC === 'number' && MUSIC_START_SEC > 0 && audio.duration && MUSIC_START_SEC < audio.duration) {
                audio.currentTime = MUSIC_START_SEC;
            }
        } catch (err) {
            // some browsers throw if seeking too early — ignore and let playback continue
            console.warn('Seeking failed or not available yet:', err);
        }

        // Attempt to play; promise may reject due to autoplay rules but will succeed after user interaction
        audio.play().catch(error => {
            console.log('Audio play attempt failed (will retry on interaction):', error);
        });
    };

    // If metadata loaded, we can seek immediately; otherwise wait for loadedmetadata
    audio.addEventListener('loadedmetadata', trySeekAndPlay, { once: true });

    // In case metadata already available (cached), try immediately
    if (audio.readyState >= 1) {
        trySeekAndPlay();
    }

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
            background: linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.85) 100%);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto; /* overlay catches clicks which JS will forward */
            animation: fadeIn 0.5s ease-out;
        }
        
        .overlay-content {
            text-align: center;
            color: white;
            animation: pulse 2s ease-in-out infinite;
            pointer-events: none;
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
            pointer-events: auto; /* make mute interactive */
            z-index: 10001;
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

    // pick game activity (first non-spotify) and spotify activity separately
    let gameActivity = null;
    if (discordData.activities && discordData.activities.length > 0) {
        gameActivity = discordData.activities.find(a => { const n = (a.name||'').toLowerCase(); return n && !n.includes('spotify'); }) || null;
    }
    const currentActivity = gameActivity || (discordData.activities && discordData.activities.length > 0 ? discordData.activities[0] : null);
    const spotifyActivity = (discordData.listening_to_spotify && discordData.spotify)
        ? { details: discordData.spotify.song, state: discordData.spotify.artist }
        : (discordData.activities ? discordData.activities.find(activity => (activity.name || '').toLowerCase() === 'spotify') : null);

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

// VIEW COUNTER - Real-time počítadlo views (count once per visitor per hour)
function initializeViewCounter() {
    const viewCountEl = document.getElementById('viewCount');
    if (!viewCountEl) return;

    const STORAGE_KEY = 'site_views_stats';       // uloží celkový počet
    const TRACKER_KEY = 'site_views_tracker';     // uloží poslední čas pro každého visitorId
    const HOUR_MS = 60 * 60 * 1000;

    const visitorId = getVisitorFingerprint();
    const now = Date.now();

    // načti data
    let stats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"total":0}');
    let tracker = JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}');

    const lastSeen = tracker[visitorId] || 0;

    // pokud uplynula více než hodina, zvýšíme counter a uložíme čas
    if (now - lastSeen > HOUR_MS) {
        stats.total = (stats.total || 0) + 1;
        tracker[visitorId] = now;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
    }

    updateViewCounters(stats);
}

/* Vytvoření (nebo získání) unikátního ID návštěvníka uloženého v localStorage */
function getVisitorFingerprint() {
    const KEY = 'visitor_unique_id';
    let id = localStorage.getItem(KEY);
    if (id) return id;

    // moderní prohlížeče: crypto.randomUUID(), fallback generátor
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
    } else {
        id = 'v-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
    }

    localStorage.setItem(KEY, id);
    return id;
}

/* Aktualizace DOM s počtem z localStorage */
function updateViewCounters(stats) {
    const el = document.getElementById('viewCount');
    if (!el) return;
    const newVal = (stats && stats.total) ? stats.total : 0;
    // jednoduchý okamžitý update; pokud chcete animaci, použijte animateNumber()
    el.textContent = newVal;
}

/* (Volitelně) animace čísel - použít místo přímého update pokud chcete pozvolný nárůst */
function animateNumber(element, startValue, endValue, duration = 600) {
    const start = +startValue || 0;
    const end = +endValue || 0;
    const range = end - start;
    if (range === 0) {
        element.textContent = end;
        return;
    }
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        element.textContent = Math.floor(start + range * t);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// spustit při načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    try { initializeViewCounter(); } catch (e) { console.error(e); }
});

/* --- GLOBAL CLICK COUNTER (shared) ---
   Uses https://api.countapi.xyz to store a global count across visitors.
   Falls back to a localStorage counter if the API fails. */
const COUNTAPI_NAMESPACE = 'adiss1417';
const COUNTAPI_KEY = 'global_clicks';

async function fetchGlobalClickCount() {
    const el = document.getElementById('clickCount');
    if (!el) return;
    try {
        const res = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`);
        if (!res.ok) throw new Error('countapi get failed');
        const json = await res.json();
        el.textContent = (typeof json.value === 'number') ? json.value : 0;
    } catch (err) {
        console.warn('Global click fetch failed, using fallback:', err);
        const fallback = parseInt(localStorage.getItem('local_global_clicks') || '0', 10) || 0;
        el.textContent = fallback;
    }
}

async function hitGlobalClick() {
    const el = document.getElementById('clickCount');
    try {
        const res = await fetch(`https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${COUNTAPI_KEY}`);
        if (!res.ok) throw new Error('countapi hit failed');
        const json = await res.json();
        if (el && typeof json.value === 'number') el.textContent = json.value;
    } catch (err) {
        console.warn('Global click increment failed, using fallback:', err);
        // fallback: local increment
        const current = parseInt(localStorage.getItem('local_global_clicks') || '0', 10) || 0;
        const next = current + 1;
        localStorage.setItem('local_global_clicks', next);
        if (el) el.textContent = next;
    }
}

function setupGlobalClickHandlers() {
    const clickEl = document.getElementById('clickCircle');
    if (clickEl) {
        clickEl.addEventListener('click', function (e) {
            e.preventDefault();
            hitGlobalClick();
        });
        // keyboard accessibility
        clickEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hitGlobalClick();
            }
        });
    }
    // fetch current value on init
    fetchGlobalClickCount();
}

// initialize click handlers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try { setupGlobalClickHandlers(); } catch (e) { console.error('setupGlobalClickHandlers failed', e); }
});

/* Reset view counter (vymaže aktuální uložené views a trackery) */
function resetViewCounter() {
    try {
        localStorage.removeItem('site_views_stats');
        localStorage.removeItem('site_views_tracker');
        // ponecháme visitor_unique_id, aby návštěvník zůstal stejný
        if (typeof updateViewCounters === 'function') {
            updateViewCounters({ total: 0 });
        } else {
            const el = document.getElementById('viewCount');
            if (el) el.textContent = '0';
        }
        console.log('✅ View counters reset to 0 (localStorage cleared).');
    } catch (e) {
        console.error('Error resetting view counters:', e);
    }
}

// Pokud chcete automaticky resetovat při načtení přidáním ?resetViews=1 do URL
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(location.search);
    if (params.get('resetViews') === '1') {
        resetViewCounter();
    }
});
