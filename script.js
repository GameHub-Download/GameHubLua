// ============================================
// GAMEHUB - GŁÓWNY PLIK SKRYPTU - SYSTEM 3 POBRAŃ
// ============================================

/* ---------- KONFIGURACJA FIREBASE ---------- */
const firebaseConfig = {
    apiKey: "AIzaSyDh6qLX9PeCHvSdS3OE-Bh-yyhy4BSWr3k",
    authDomain: "projekt-2dec4.firebaseapp.com",
    projectId: "projekt-2dec4",
    storageBucket: "projekt-2dec4.firebasestorage.app",
    messagingSenderId: "606918379913",
    appId: "1:606918379913:web:fb0ce0db9fe67ca2c33958"
};

// Inicjalizacja Firebase
let app, db, auth, analytics;

try {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        analytics = firebase.analytics();
        console.log('✅ Firebase zainicjalizowany');
    } else {
        console.warn('⚠️ Firebase nie jest dostępny');
    }
} catch (error) {
    console.error('❌ Błąd Firebase:', error);
}

/* ---------- ZMIENNE GLOBALNE ---------- */
let currentUser = null;
let userDownloadCount = 0; // Ilość pobrań użytkownika
let lastDownloadTime = null;
const DOWNLOAD_COOLDOWN = 2 * 60 * 60 * 1000; // 2 godziny
const FREE_DOWNLOADS = 3; // 3 darmowe pobrania
let downloadTimerInterval = null;

/* ---------- LISTA GIER PREMIUM ---------- */
const PREMIUM_GAMES = [
    'Cyberpunk 2077', 'The Witcher 3', 'Fallout 4', 'Red Dead Redemption 2',
    'Forza Horizon 5', 'The Crew 2', 'Forza Horizon 4', 'Far Cry Primal',
    'Far Cry 6', 'Far Cry 5', 'Far Cry 4', 'Far Cry 3', 'WWE 2K25',
    'A Way Out', 'Mirrors Edge Catalyst', 'Sekiro Shadows Die Twice',
    'Just Cause 2', 'Split Fiction', 'Max Payne 3', 'God of War',
    'The Long Drive', 'South Park Fractured but Whole', 'Lens Island',
    'Ready or Not', 'The Long Dark', 'Sons Of The Forest',
    'Marvels SpiderMan 2', 'Call of Duty Modern Warfare 3',
    'Metal Gear Solid Phantom Pain', 'Call of Duty Black Ops',
    'Call of Duty Black Ops II', 'Call of Duty Black Ops III',
    'Assassins Creed Valhalla', 'Assassins Creed Syndicate',
    'Castlevania Lords of Shadow 2', 'Clair Obscur Expedition 33',
    'Assassins Creed III Remastered', 'Call of Duty Modern Warfare 2',
    'Bodycam', 'LEGO Batman 2 DC Super Heroes', 'LEGO Batman 3 Beyond Gotham',
    'Metro 2033 Redux', 'Metro Exodus', 'EA SPORTS FC 25',
    'HITMAN World of Assassination', 'Hello Neighbor Hide and Seek',
    'Farming Simulator 25', 'Phasmophobia', 'Outlast 2', 'Hello Neighbor 2',
    'Dying Light The Beast', 'Garrys Mod', 'Police Simulator Patrol Officers',
    'Green Hell', 'Raft', 'LEGO MARVEL Super Heroes 2',
    'The LEGO Movie Videogame', 'The LEGO NINJAGO Movie Video Game',
    'Grand Theft Auto V Legacy', 'STAR WARS Jedi Fallen Order',
    'Company of Heroes 3', 'Assassins Creed Origins', 'Assassins Creed Rogue',
    'Assassins Creed IV Black Flag', 'Assassins Creed Mirage',
    'Battlefield 4', 'Watch Dogs 2', 'Dragon Age Inquisition', 'MISERY',
    'Escape Simulator 2', 'Dead Space 2', 'Dead Space 3', 'Watch Dogs',
    'Detroit Become Human', 'Crusader Kings III', 'Watch Dogs Legion', 
	'Mad Max', 'Riders Republic', 'Call of Duty Modern Warfare II', 
	'No Mans Sky', 'Until Dawn', 'Diablo II Resurrected', 'Sonic Colors Ultimate',
	'Sonic Frontiers', 'Far Cry 4', 'A Plague Tale Innocence', 'Tom Clancys Ghost Recon Wildlands',
    'God of War Ragnarök', 'Call of Duty Infinite Warfare',	'Mafia II Classic', 'Tom Clancys Splinter Cell Blacklist',
	'Company of Heroes 3', 'Far Cry 6', 'Assassins Creed Mirage', 'Need for Speed Hot Pursuit', 'Assassins Creed Valhalla', 
	'Forza Horizon 5', 'Forza Horizon 4', 'The Witcher 3 Wild Hunt', 'Raft', 'Cyberpunk 2077', 'Fallout 4', 'Call of Duty Black Ops',
	'Sekiro Shadows Die Twice', 'Split Fiction', 'Marvels SpiderMan 2', 'Outlast 2', 'Detroit Become Human', 'Battlefield 4', 'Grand Theft Auto V Legacy',
	'Castlevania Lords of Shadow 2', 'Sons Of The Forest', 'Resident Evil Village', 'Call of Duty Modern Warfare 3', 'Call of Duty Black Ops II',
];

/* ---------- LINKI DO POBRANIA ---------- */
const DOWNLOAD_LINKS = {
    'Watch Dogs Legion': 'https://pixeldrain.com/u/2ZWZLR2P',
    'The Forest': 'https://shrinkme.click/theforest',
    'Mad Max': 'https://pixeldrain.com/u/Wy6YAiwx',
    'Riders Republic': 'https://pixeldrain.com/u/affyWTms',
    'London 2012': 'https://pixeldrain.com/u/sBbzmgpi',
    'Call of Duty Modern Warfare II': 'https://pixeldrain.com/u/ahEFdGEx',
    'Roadside Research': 'https://pixeldrain.com/u/yAhtzFxr',
    'No Mans Sky': 'https://pixeldrain.com/u/SS7SkZXk',
	'Until Dawn': 'https://pixeldrain.com/u/biasRniG',
	'Diablo II Resurrected': 'https://pixeldrain.com/u/uCrWRbyX',
	'Sonic Colors Ultimate': 'https://pixeldrain.com/u/5TpxzYXx',
	'Sonic Frontiers': 'https://pixeldrain.com/u/iq3Phv71',
	'My Village Life': 'https://pixeldrain.com/u/5ZuRPuNu',
	'Log Riders': 'https://pixeldrain.com/u/4MBBDFAA',
	'Plants vs Zombies Replante': 'https://pixeldrain.com/u/hiiuRZrX',
	'Far Cry 4': 'https://pixeldrain.com/u/cfhNwnRU',
	'A Plague Tale Innocence': 'https://pixeldrain.com/u/JYTwn81T',
	'Call of Duty 4 Modern Warfare (2007)': 'https://pixeldrain.com/u/bMfWWJkf',
	'Kao the Kangaroo Round 2': 'https://pixeldrain.com/u/f4vehFcu',
	'Pure Farming 2018': 'https://pixeldrain.com/u/E9mubpR1',
	'Tom Clancys Ghost Recon Wildlands': '',
	'A Plague Tale Innocence': 'https://pixeldrain.com/u/JYTwn81T',
	'My Winter Car': 'https://pixeldrain.com/u/ANnm2gfc',
	'Medieval Dynasty': 'https://pixeldrain.com/u/9f5fRV9Z',
	'House Flipper': 'https://pixeldrain.com/u/sttUyr8b',
	'God of War Ragnarök': 'https://pixeldrain.com/u/GMkxEXm2',
	'Call of Duty Infinite Warfare': 'https://pixeldrain.com/u/vZYhqTaf',
	'Mafia II Classic': 'https://pixeldrain.com/u/Liwuqq4m',
	'Company of Heroes 3': 'https://pixeldrain.com/u/7TT2nNDW',
	'Tom Clancys Splinter Cell Blacklist': 'https://pixeldrain.com/u/mjud5T9d',
	'Far Cry 6': 'https://pixeldrain.com/u/6fy5ZYJG',
	'Far Cry 3': 'https://pixeldrain.com/u/iomsLQLM',
	'Assassins Creed Brotherhood': 'https://pixeldrain.com/u/sngW2xEz',
	'American Truck Simulator': 'https://pixeldrain.com/u/KuxBs4VP',
	'Need for Speed Hot Pursuit': 'https://pixeldrain.com/u/HHmvpCPi',
	'Assassins Creed Valhalla': 'https://pixeldrain.com/u/gppbfjrw',
	'Assassins Creed Mirage': 'https://pixeldrain.com/u/LnYiR5ko',
	'Age of History II': 'https://pixeldrain.com/u/imS9zXwF',
	'Heavy Cargo': 'https://pixeldrain.com/u/pyPD9aw8',
	'OHV': 'https://pixeldrain.com/u/nJtUtaTH',
	'Lens Island': 'https://e.pcloud.link/publink/show?code=XZOBc6ZB9r1XbteCPJQAXJMxw1TbYu2Yc7X',
	'Phasmophobia': 'https://pixeldrain.com/u/gcawYNuS',
	'Metro 2033 Redux': 'https://pixeldrain.com/u/zusjP9Q2',
	'Just Cause 2': 'https://pixeldrain.com/u/pBXdPvqD',
	'Max Payne 3': 'https://pixeldrain.com/u/EWEuGMNq',
	'Forza Horizon 5': 'https://pixeldrain.com/u/e2h9tKUc',
	'Forza Horizon 4': 'https://pixeldrain.com/u/YGMwPSDL',
	'The Witcher 3 Wild Hunt': 'https://pixeldrain.com/u/aqgLWgtR',
	'Medal of Honor': 'https://pixeldrain.com/u/zWFJoUjg',
	'Firefighting Simulator Ignite': 'https://pixeldrain.com/u/ixxiXjUv',
	'Kebab Chefs Restaurant Simulator': 'https://pixeldrain.com/u/W1mCX642',
	'Watch Dogs 2': 'https://pixeldrain.com/u/yvo9kDzE',
	'RoadCraft': 'https://pixeldrain.com/u/xSvjHFu8',
	'DOOM The Dark Ages': 'https://pixeldrain.com/u/D6ygV5LF',
	'Outlast': 'https://pixeldrain.com/u/b9cybqfq',
	'Battlefield 3': 'https://pixeldrain.com/u/a6CQ9sbj',
	'Sejm The Game': 'https://pixeldrain.com/u/h2b2Lq6R',
	'Fallout 4': 'https://pixeldrain.com/u/XeL4obrv',
	'Raft': 'https://pixeldrain.com/u/mVY3snsX',
	'Cyberpunk 2077': 'https://pixeldrain.com/u/K4aXk76t',
	'Call of Duty Black Ops': 'https://pixeldrain.com/u/z7zvMAK9',
	'HAM The Game': 'https://shrinkme.click/HAMTheGame',
	'Split Fiction': 'https://pixeldrain.com/u/rhVvj3io',
	'Sekiro Shadows Die Twice': 'https://pixeldrain.com/u/JBSgsvNZ',
	'Marvels SpiderMan 2': 'https://pixeldrain.com/u/GAwrH36J',
	'Raft': 'https://shrinkme.click/Rafttt',
	'Car Service Together': 'https://shrinkme.click/CarServiceTogether',
	'Outlast 2': 'https://pixeldrain.com/u/NyBMqjse',
	'Detroit Become Human': 'https://pixeldrain.com/u/soQczpED',
	'Battlefield 4': 'https://pixeldrain.com/u/GFGJ1W6v',
	'Hello Neighbor 2': 'https://shrinkme.click/helloo',
	'Geometry Dash': 'https://shrinkme.click/Geometry',
	'Sifu': 'https://shrinkme.click/sifu',
	'Castlevania Lords of Shadow 2': 'https://pixeldrain.com/u/WY8RDYaV',
	'Grand Theft Auto V Legacy': 'https://pixeldrain.com/u/3HEzYK2W',
	'Sons The Forest': 'https://pixeldrain.com/u/BWXQvuqd',
	'Schedule I': 'https://shrinkme.click/schedule',
	'Scam Line': 'https://shrinkme.click/scamline',
	'Boat Together': 'https://shrinkme.click/boattogether',
	'Resident Evil Village': 'https://pixeldrain.com/u/KfLQRrnN',
	'Call of Duty Black Ops II': 'https://pixeldrain.com/u/x6581yxB',
	'Call of Duty Modern Warfare 3': 'https://pixeldrain.com/u/LWnJ5jBB',
};

/* ---------- FUNKCJE MODALI ---------- */
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

function toggleAuthForms() {
    const container = document.getElementById('authContainer');
    if (container) container.classList.toggle('active');
}

function showPremiumModal() {
    if (!currentUser) {
        showNotification('Musisz się zalogować, aby kupić premium', 'error');
        openAuthModal();
        return;
    }
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.style.display = 'flex';
        
        const userIdSpan = document.getElementById('premiumUserId');
        if (userIdSpan && currentUser) {
            userIdSpan.textContent = currentUser.uid;
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

/* ---------- LOGOWANIE / REJESTRACJA ---------- */
function loginUser(email, password) {
    if (!auth) {
        showNotification('Błąd połączenia z bazą danych', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                premium: false
            };
            checkPremiumStatus();
            updateAuthUI();
            closeAuthModal();
            showNotification('Zalogowano pomyślnie!', 'success');
        })
        .catch((error) => {
            let message = 'Nieprawidłowy email lub hasło';
            if (error.code === 'auth/user-not-found') message = 'Nie znaleziono użytkownika';
            if (error.code === 'auth/wrong-password') message = 'Nieprawidłowe hasło';
            if (error.code === 'auth/too-many-requests') message = 'Zbyt wiele prób. Spróbuj później';
            showNotification(message, 'error');
        });
}

function registerUser(username, email, password) {
    if (!auth || !db) {
        showNotification('Błąd połączenia z bazą danych', 'error');
        return;
    }
    
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
    if (password !== confirmPassword) {
        showNotification('Hasła nie są identyczne', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Hasło musi mieć co najmniej 6 znaków', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return user.updateProfile({ displayName: username }).then(() => {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: username,
                    premium: false,
                    downloadCount: 0 // Nowe konto - 0 pobrań
                };
                return db.collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    premium: false,
                    downloadCount: 0, // Zaczyna z 0
                    registrationDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            });
        })
        .then(() => {
            updateAuthUI();
            closeAuthModal();
            showNotification('Zarejestrowano pomyślnie!', 'success');
        })
        .catch((error) => {
            let message = error.message;
            if (error.code === 'auth/email-already-in-use') message = 'Ten email jest już zajęty';
            if (error.code === 'auth/invalid-email') message = 'Nieprawidłowy email';
            showNotification(message, 'error');
        });
}

function logoutUser() {
    if (!auth) {
        currentUser = null;
        userDownloadCount = 0;
        updateAuthUI();
        showNotification('Wylogowano', 'info');
        return;
    }
    
    auth.signOut()
        .then(() => {
            currentUser = null;
            userDownloadCount = 0;
            updateAuthUI();
            showNotification('Wylogowano pomyślnie!', 'info');
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.remove('active');
        })
        .catch(() => {
            showNotification('Błąd podczas wylogowywania', 'error');
        });
}

/* ---------- INTERFEJS UŻYTKOWNIKA ---------- */
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;
    
    if (currentUser) {
        const firstLetter = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U';
        authButtons.innerHTML = `
            <div class="user-avatar" id="userAvatar" onclick="toggleUserDropdown()">
                ${firstLetter}
            </div>
        `;
        
        const firstDropdownItem = document.querySelector('.user-dropdown a:nth-child(1)');
        if (firstDropdownItem) {
            firstDropdownItem.innerHTML = `<i class="fas fa-user"></i> ${currentUser.displayName || 'Użytkownik'}`;
        }
        
        const thirdDropdownItem = document.querySelector('.user-dropdown a:nth-child(3)');
        if (thirdDropdownItem) {
            if (currentUser.premium) {
                thirdDropdownItem.innerHTML = `<i class="fas fa-crown" style="color: gold;"></i> <span style="color: gold;">Premium Aktywne</span>`;
            } else {
                thirdDropdownItem.innerHTML = `<i class="fas fa-crown"></i> Premium`;
            }
        }
    } else {
        authButtons.innerHTML = `
            <a href="#" class="btn btn-outline" id="loginBtn" style="padding: 8px 20px;">Zaloguj się</a>
        `;
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openAuthModal();
            });
        }
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

/* ---------- PREMIUM ---------- */
function checkPremiumStatus() {
    if (!currentUser || !db) return;
    
    db.collection("users").doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                currentUser.premium = doc.data().premium || false;
                currentUser.downloadCount = doc.data().downloadCount || 0;
                userDownloadCount = currentUser.downloadCount;
                if (doc.data().lastDownload) {
                    lastDownloadTime = doc.data().lastDownload;
                }
            } else {
                currentUser.premium = false;
                currentUser.downloadCount = 0;
                userDownloadCount = 0;
            }
            updateAuthUI();
            updatePremiumGameButtons();
        })
        .catch(() => {
            currentUser.premium = false;
        });
}

function updatePremiumGameButtons() {
    document.querySelectorAll('.game-card.premium .download-btn').forEach(btn => {
        if (currentUser && currentUser.premium) {
            btn.textContent = 'Pobierz';
            btn.classList.remove('premium-locked');
        } else {
            btn.textContent = 'Odblokuj';
            btn.classList.add('premium-locked');
        }
    });
}

/* ---------- FORMATOWANIE KODU PSC ---------- */
function formatPscCode(input) {
    if (!input) return;
    
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += '-';
        formatted += value[i];
    }
    input.value = formatted;
    
    const codeDisplay = document.getElementById('codeDisplay');
    if (codeDisplay) {
        if (value.length > 0) {
            let display = '';
            for (let i = 0; i < 16; i++) {
                if (i < value.length) {
                    display += value[i];
                } else {
                    display += '•';
                }
                if ((i + 1) % 4 === 0 && i < 15) display += ' ';
            }
            codeDisplay.textContent = display;
        } else {
            codeDisplay.textContent = '•••• •••• •••• ••••';
        }
    }
}

/* ---------- WERYFIKACJA KODU PSC ---------- */
function verifyPscCode() {
    const pscCode = document.getElementById('pscCodeInput')?.value.trim();
    
    if (!currentUser) {
        showNotification('Musisz się zalogować, aby aktywować premium', 'error');
        openAuthModal();
        return;
    }
    
    if (!pscCode) {
        showNotification('Musisz wpisać kod PSC', 'error');
        return;
    }
    
    if (pscCode.replace(/-/g, '').length !== 16) {
        showNotification('Kod musi zawierać 16 cyfr', 'error');
        return;
    }

    const userId = currentUser.uid;
    
    if (db) {
        db.collection("pscCodes").add({
            userId: userId,
            code: pscCode,
            status: "pending",
            date: new Date().toISOString(),
            email: currentUser.email,
            username: currentUser.displayName
        }).catch(() => {});
    }
    
    closeModal('premiumModal');
    showPremiumInstructions(pscCode, userId);
    
    setTimeout(() => {
        window.open('https://discord.gg/RSgdhyKGSS', '_blank');
    }, 3000);
}

/* ---------- INSTRUKCJA PREMIUM ---------- */
function showPremiumInstructions(pscCode, userId) {
    const oldInstructions = document.getElementById('premium-instructions');
    if (oldInstructions) oldInstructions.remove();
    
    const instructionsDiv = document.createElement('div');
    instructionsDiv.id = 'premium-instructions';
    instructionsDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(165deg, #0f0a05 0%, #1f150c 100%);
        border: 1px solid rgba(255,170,0,0.4);
        border-radius: 24px;
        padding: 28px;
        max-width: 480px;
        width: 90%;
        z-index: 10000;
        box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,170,0,0.2), 0 0 30px rgba(255,170,0,0.2);
        color: white;
        font-family: 'Source Code Pro', monospace;
        backdrop-filter: blur(10px);
        animation: premiumPopup 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes premiumPopup {
            from {
                opacity: 0;
                transform: translate(-50%, -30%) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    const shortUserId = userId.substring(0, 10) + '...';
    
    instructionsDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ffaa00, #ff8c00); border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(255,170,0,0.3);">
                <i class="fas fa-check" style="font-size: 2rem; color: #0f0a05;"></i>
            </div>
            <div style="flex: 1;">
                <h3 style="color: #ffaa00; margin: 0 0 5px 0; font-size: 1.6rem; font-weight: 700; letter-spacing: 1px;">KOD PRZYJĘTY!</h3>
                <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 0.9rem;">Za chwilę zostaniesz przeniesiony na Discorda</p>
            </div>
            <span onclick="document.getElementById('premium-instructions').remove()" style="color: #ccb699; font-size: 2rem; cursor: pointer; line-height: 1; opacity: 0.7; transition: 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</span>
        </div>
        
        <div style="background: rgba(0,0,0,0.4); border-radius: 18px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,170,0,0.2); backdrop-filter: blur(5px);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed rgba(255,170,0,0.3);">
                <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase;">Kod PSC</div>
                <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase;">ID Firebase</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,170,0,0.1); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,170,0,0.3);">
                    <i class="fas fa-key" style="color: #ffaa00; font-size: 0.8rem;"></i>
                    <span style="color: #ffaa00; font-family: monospace; font-size: 1rem; font-weight: 600; letter-spacing: 1px;">${pscCode}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,170,0,0.1); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,170,0,0.3);">
                    <i class="fas fa-id-card" style="color: #ffaa00; font-size: 0.8rem;"></i>
                    <span style="color: #ffaa00; font-family: monospace; font-size: 0.9rem; font-weight: 600; max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${userId}">${shortUserId}</span>
                    <button onclick="copyToClipboard('${userId}')" style="background: rgba(255,170,0,0.2); border: 1px solid #ffaa00; color: #ffaa00; padding: 4px 8px; border-radius: 8px; font-size: 0.7rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255,170,0,0.3)'" onmouseout="this.style.background='rgba(255,170,0,0.2)'">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <div style="background: rgba(88,101,242,0.1); border-radius: 18px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #5865F2; backdrop-filter: blur(5px);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
                <div style="width: 45px; height: 45px; background: #5865F2; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fab fa-discord" style="font-size: 1.8rem; color: white;"></i>
                </div>
                <div>
                    <div style="color: white; font-size: 1.1rem; font-weight: 600;">discord.gg/RSgdhyKGSS</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Dołącz do naszego serwera</div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="width: 28px; height: 28px; background: rgba(88,101,242,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #5865F2; font-weight: bold; font-size: 0.9rem;">1</div>
                    <div style="flex: 1; color: rgba(255,255,255,0.9);">Wejdź na naszego <strong style="color: #5865F2;">Discorda</strong> (przekierowanie za chwilę)</div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="width: 28px; height: 28px; background: rgba(88,101,242,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #5865F2; font-weight: bold; font-size: 0.9rem;">2</div>
                    <div style="flex: 1; color: rgba(255,255,255,0.9);">Utwórz ticket na kanale <strong style="color: #ffaa00; background: rgba(255,170,0,0.1); padding: 2px 8px; border-radius: 20px;">💌・support</strong></div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="width: 28px; height: 28px; background: rgba(88,101,242,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #5865F2; font-weight: bold; font-size: 0.9rem;">3</div>
                    <div style="flex: 1; color: rgba(255,255,255,0.9);">Podaj swój <strong style="color: #ffaa00;">kod PSC</strong> i <strong style="color: #ffaa00;">ID użytkownika</strong> (skopiuj wyżej)</div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="width: 28px; height: 28px; background: rgba(88,101,242,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #5865F2; font-weight: bold; font-size: 0.9rem;">4</div>
                    <div style="flex: 1; color: rgba(255,255,255,0.9);">Administracja zweryfikuje kod i nada Ci rangę <strong style="color: #ffaa00;">PREMIUM</strong></div>
                </div>
            </div>
        </div>
        
        <div style="background: rgba(255,170,0,0.08); border-radius: 30px; padding: 18px; margin-bottom: 20px; text-align: center; border: 1px dashed rgba(255,170,0,0.3);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                <i class="fas fa-clock" style="color: #ffaa00;"></i>
                <span style="color: white; font-weight: 500;">Czas weryfikacji</span>
            </div>
            <div style="color: #ffaa00; font-size: 1.3rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px;">⏳ DO 24 GODZIN</div>
            <div style="color: rgba(255,255,255,0.5); font-size: 0.85rem; max-width: 300px; margin: 0 auto;">
                Administracja sprawdzi Twój kod i aktywuje konto premium. Zazwyczaj trwa to krócej, ale może potrwać do 24h.
            </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
            <button onclick="document.getElementById('premium-instructions').remove()" style="flex: 1; padding: 12px; background: transparent; border: 1px solid rgba(255,170,0,0.3); color: white; border-radius: 14px; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: 0.2s;" onmouseover="this.style.borderColor='#ffaa00'; this.style.background='rgba(255,170,0,0.05)'" onmouseout="this.style.borderColor='rgba(255,170,0,0.3)'; this.style.background='transparent'">
                <i class="fas fa-times" style="margin-right: 6px;"></i> Zamknij
            </button>
            <button onclick="window.open('https://discord.gg/RSgdhyKGSS', '_blank')" style="flex: 1; padding: 12px; background: linear-gradient(90deg, #5865F2, #4752C4); border: none; color: white; border-radius: 14px; cursor: pointer; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 8px 20px rgba(88,101,242,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 25px rgba(88,101,242,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(88,101,242,0.3)'">
                <i class="fab fa-discord"></i> Discord
            </button>
        </div>
    `;
    
    document.body.appendChild(instructionsDiv);
}

/* ---------- KOPIUJ DO SCHOWKA ---------- */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Skopiowano ID użytkownika!', 'success');
    }).catch(() => {
        showNotification('❌ Nie udało się skopiować', 'error');
    });
}

/* ========== POPRAWIONA FUNKCJA POBIERANIA - 3 DARMOWE POBRANIA ========== */
function checkAuthBeforeDownload(gameName, category, imageUrl) {
    console.log('Próba pobrania:', gameName);
    
    // Sprawdź czy użytkownik jest zalogowany
    if (!currentUser) {
        showNotification('Musisz się zalogować, aby pobrać grę', 'error');
        openAuthModal();
        return;
    }
    
    // Sprawdź czy to gra premium
    const isPremiumGame = PREMIUM_GAMES.includes(gameName);
    
    // Jeśli gra premium a użytkownik nie ma premium - pokaż modal premium
    if (isPremiumGame && !currentUser.premium) {
        showNotification('Ta gra wymaga konta premium!', 'error');
        showPremiumModal();
        return;
    }
    
    const now = new Date();
    
    // SPRAWDZAMY CZY UŻYTKOWNIK MA JESZCZE DARMOWE POBRANIA
    if (!currentUser.premium) {
        // Użytkownik bez premium - sprawdzamy liczbę pobrań
        if (userDownloadCount < FREE_DOWNLOADS) {
            // MA DARMOWE POBRANIA - POBIERA BEZ LIMITU
            userDownloadCount++;
            
            // Zwiększ licznik w bazie
            if (db && currentUser) {
                db.collection('users').doc(currentUser.uid).update({
                    downloadCount: userDownloadCount,
                    lastDownload: new Date().toISOString()
                }).catch(() => {});
            }
            
            lastDownloadTime = now.toISOString();
            
            const link = DOWNLOAD_LINKS[gameName];
            if (link && link !== '#') {
                window.open(link, '_blank');
                showNotification(`Pobieranie gry "${gameName}" rozpoczęte! (${userDownloadCount}/${FREE_DOWNLOADS} darmowych)`, 'success');
            } else {
                showNotification('Link do pobrania jest tymczasowo niedostępny', 'error');
            }
            return;
        } else {
            // NIE MA JUŻ DARMOWYCH POBRAŃ - SPRAWDZAMY LIMIT CZASOWY
            const lastDownload = lastDownloadTime ? new Date(lastDownloadTime) : null;
            
            if (!lastDownload || (now - lastDownload) >= DOWNLOAD_COOLDOWN) {
                // Minął limit czasu - można pobrać
                userDownloadCount = FREE_DOWNLOADS; // Utrzymujemy licznik na 3
                lastDownloadTime = now.toISOString();
                
                if (db && currentUser) {
                    db.collection('users').doc(currentUser.uid).update({
                        lastDownload: new Date().toISOString()
                    }).catch(() => {});
                }
                
                const link = DOWNLOAD_LINKS[gameName];
                if (link && link !== '#') {
                    window.open(link, '_blank');
                    showNotification(`Pobieranie gry "${gameName}" rozpoczęte! (limit czasowy)`, 'success');
                } else {
                    showNotification('Link do pobrania jest tymczasowo niedostępny', 'error');
                }
            } else {
                // Limit czasowy nie minął - pokaż modal z czasem
                showDownloadLimitModal(lastDownload);
            }
            return;
        }
    } else {
        // Użytkownik premium - pobiera bez ograniczeń
        if (db && currentUser) {
            db.collection('users').doc(currentUser.uid).update({
                lastDownload: new Date().toISOString()
            }).catch(() => {});
        }
        
        const link = DOWNLOAD_LINKS[gameName];
        if (link && link !== '#') {
            window.open(link, '_blank');
            showNotification(`Pobieranie gry "${gameName}" rozpoczęte! (premium)`, 'success');
        } else {
            showNotification('Link do pobrania jest tymczasowo niedostępny', 'error');
        }
    }
}

/* ---------- LIMIT POBIERANIA ---------- */
function showDownloadLimitModal(lastDownloadTime) {
    const modal = document.getElementById('downloadLimitModal');
    const countdownElement = document.getElementById('timerCountdown');
    
    if (!modal || !countdownElement) return;
    
    const now = new Date();
    const lastDownload = new Date(lastDownloadTime);
    const nextDownloadTime = new Date(lastDownload.getTime() + DOWNLOAD_COOLDOWN);
    let remainingTime = nextDownloadTime - now;
    
    if (downloadTimerInterval) clearInterval(downloadTimerInterval);
    
    function updateTimer() {
        remainingTime -= 1000;
        if (remainingTime <= 0) {
            clearInterval(downloadTimerInterval);
            countdownElement.textContent = '00:00:00';
            closeModal('downloadLimitModal');
            return;
        }
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        countdownElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTimer();
    downloadTimerInterval = setInterval(updateTimer, 1000);
    modal.style.display = 'flex';
}

/* ---------- POWIADOMIENIA ---------- */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 22px;
        border-radius: 50px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        font-size: 0.95rem;
        border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    
    if (type === 'success') notification.style.background = 'linear-gradient(90deg, #1e3c1e, #2a5a2a)';
    if (type === 'error') notification.style.background = 'linear-gradient(90deg, #3c1e1e, #5a2a2a)';
    if (type === 'info') notification.style.background = 'linear-gradient(90deg, #1e2a3c, #2a3a5a)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

/* ---------- PAGINACJA ---------- */
function initPagination() {
    const allGameCards = Array.from(document.querySelectorAll('.game-card')).filter(card => 
        card.style.display !== 'none'
    );
    
    const gamesPerPage = 12;
    const totalPages = Math.ceil(allGameCards.length / gamesPerPage);
    let currentPage = 1;
    
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (!prevPageBtn || !nextPageBtn || !currentPageSpan || !totalPagesSpan) return;
    
    totalPagesSpan.textContent = totalPages || 1;
    
    function showPage(page) {
        document.querySelectorAll('.game-card').forEach(card => {
            if (card.style.display !== 'none') {
                card.dataset.tempDisplay = card.style.display;
            }
        });
        
        document.querySelectorAll('.game-card').forEach(card => {
            card.style.display = 'none';
        });
        
        const visibleCards = allGameCards.filter(card => card.dataset.tempDisplay !== 'none');
        const startIndex = (page - 1) * gamesPerPage;
        const endIndex = Math.min(startIndex + gamesPerPage, visibleCards.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (visibleCards[i]) {
                visibleCards[i].style.display = 'block';
            }
        }
        
        currentPageSpan.textContent = page;
        currentPage = page;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    prevPageBtn.onclick = () => {
        if (currentPage > 1) showPage(currentPage - 1);
    };
    
    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) showPage(currentPage + 1);
    };
    
    showPage(1);
}

/* ---------- FILTROWANIE GIER ---------- */
function filterGames() {
    const searchInput = document.getElementById('game-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    const gameCards = document.querySelectorAll('.game-card');
    
    let visibleCount = 0;
    
    gameCards.forEach(card => {
        const title = card.querySelector('.game-title')?.textContent || '';
        const cardCategories = card.dataset.category ? card.dataset.category.split(' ') : [];
        
        let matchesCategory = false;
        if (activeCategory === 'all') {
            matchesCategory = true;
        } else if (activeCategory === 'premium') {
            matchesCategory = card.classList.contains('premium');
        } else {
            matchesCategory = cardCategories.includes(activeCategory);
        }
        
        let matchesSearch = true;
        if (searchTerm.length > 0) {
            matchesSearch = title.toLowerCase().includes(searchTerm);
        }
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    setTimeout(initPagination, 100);
}

/* ---------- INICJALIZACJA ---------- */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicjalizacja strony...');
    
    const modals = ['downloadLimitModal', 'authModal', 'premiumModal', 'gameDetailsModal'];
    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const searchInput = document.getElementById('game-search');
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthForms();
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthForms();
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            if (email && password) loginUser(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername')?.value;
            const email = document.getElementById('registerEmail')?.value;
            const password = document.getElementById('registerPassword')?.value;
            if (username && email && password) registerUser(username, email, password);
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterGames();
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
    }
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !e.target.closest('#userAvatar') && !e.target.closest('.user-dropdown')) {
            dropdown.classList.remove('active');
        }
    });
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || 'User',
                    premium: false,
                    downloadCount: 0
                };
                checkPremiumStatus();
            } else {
                currentUser = null;
                userDownloadCount = 0;
            }
            updateAuthUI();
            updatePremiumGameButtons();
        });
    } else {
        updateAuthUI();
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.padding = '10px 0';
                header.style.background = 'rgba(10, 10, 10, 0.95)';
            } else {
                header.style.padding = '15px 0';
                header.style.background = 'var(--darker)';
            }
        }
    });
    
    setTimeout(filterGames, 500);
    console.log('✅ Inicjalizacja zakończona');
});
