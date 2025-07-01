// =================================================================
// 1. إعداد Firebase - الخطوة الوحيدة التي يجب عليك القيام بها
// =================================================================

// !!!!!! الصق كود firebaseConfig الخاص بك هنا !!!!!!
const firebaseConfig = {
  apiKey: "AIzaSy_REPLACE_WITH_YOUR_OWN_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-ABCDEFGHIJ"
};

// تهيئة تطبيق وخدمات Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =================================================================
// 2. منطق التطبيق (لا تلمس أي شيء تحت هذا الخط)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    let gameState = { activeGameConfig: null, gameInstance: null };
    let allGamesCache = [];
    const VALID_CODES = ['heba 005', 'nermeen 005'];
    const screens = { login: document.getElementById('login-container'), dashboard: document.getElementById('dashboard-container'), setup: document.getElementById('setup-container'), teamSetup: document.getElementById('team-setup-container'), game: document.getElementById('game-container') };
    const loader = document.getElementById('loader');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const showScreen = (screenName) => { Object.values(screens).forEach(screen => screen.style.display = 'none'); screens[screenName].style.display = 'block'; };

    const fetchAndRenderGames = async () => {
        showScreen('dashboard');
        loader.style.display = 'block';
        const list = document.getElementById('saved-games-list');
        list.innerHTML = '';
        try {
            const snapshot = await db.collection('games').orderBy('createdAt', 'desc').get();
            allGamesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (allGamesCache.length === 0) { list.innerHTML = '<p>لم يتم إنشاء أي ألعاب بعد.</p>'; }
            else { allGamesCache.forEach(game => { const li = document.createElement('li'); li.className = 'saved-game-item'; li.innerHTML = `<span>${game.title}</span><div><button class="btn-play" data-id="${game.id}">لعب</button><button class="btn-delete" data-id="${game.id}">حذف</button></div>`; list.appendChild(li); }); }
        } catch (error) { console.error("Error fetching games: ", error); list.innerHTML = '<p style="color: red;">حدث خطأ أثناء تحميل الألعاب.</p>'; }
        finally { loader.style.display = 'none'; }
    };

    const deleteGame = async (gameId) => {
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذه اللعبة نهائياً؟')) return;
        try { await db.collection('games').doc(gameId).delete(); fetchAndRenderGames(); }
        catch (error) { console.error("Error removing game: ", error); alert('حدث خطأ أثناء حذف اللعبة.'); }
    };

    const createGameInDb = async (newGame) => { await db.collection('games').add(newGame); };

    document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); const code = document.getElementById('login-code').value.trim().toLowerCase(); if (VALID_CODES.includes(code)) { fetchAndRenderGames(); } else { document.getElementById('login-error').textContent = 'كود الدخول غير صحيح.'; } });
    
    document.getElementById('saved-games-list').addEventListener('click', (e) => { 
        const gameId = e.target.dataset.id; 
        if (!gameId) return; 
        if (e.target.matches('.btn-play')) { 
            const gameToPlay = allGamesCache.find(game => game.id === gameId); 
            if (gameToPlay) { 
                gameState.activeGameConfig = gameToPlay; 
                document.getElementById('team-setup-game-title').textContent = gameToPlay.title; 
                showScreen('teamSetup'); 
            } 
        } else if (e.target.matches('.btn-delete')) { 
            deleteGame(gameId); 
        } 
    });
      const setupForm = document.getElementById('setup-form');
    const questionsContainer = document.getElementById('questions-container');

    const createItemCard = (type) => { 
        const div = document.createElement('div'); 
        div.className = 'item-card'; 
        div.dataset.type = type; 
        const removeBtn = document.createElement('button'); 
        removeBtn.type = 'button'; 
        removeBtn.className = 'remove-item-btn'; 
        removeBtn.textContent = 'X'; 
        removeBtn.addEventListener('click', () => div.remove());
        div.appendChild(removeBtn); 
        return div; 
    };

    document.getElementById('add-question-btn').addEventListener('click', () => { 
        const card = createItemCard('question'); 
        card.innerHTML += `<h4>سؤال</h4><input type="text" placeholder="اكتب السؤال هنا" class="question-input" required><input type="text" placeholder="اكتب الإجابة هنا" class="answer-input" required>`; 
        questionsContainer.appendChild(card); 
    });

    document.getElementById('add-powerup-btn').addEventListener('click', () => { 
        const card = createItemCard('powerup-points'); 
        card.innerHTML += `<h4>مكافأة (نقاط)</h4><input type="text" placeholder="وصف المكافأة" class="powerup-text-input" required><input type="number" placeholder="قيمة النقاط" class="powerup-points-input" required>`; 
        questionsContainer.appendChild(card); 
    });

    document.getElementById('add-swap-powerup-btn').addEventListener('click', () => { 
        const card = createItemCard('powerup-swap'); 
        card.innerHTML += `<h4>مكافأة (تبادل نقاط)</h4><p>هذه المكافأة تسمح بتبادل النقاط.</p>`; 
        questionsContainer.appendChild(card); 
    });

    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = document.getElementById('save-game-btn');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'جارٍ الحفظ...';
        try {
            const newGame = { title: document.getElementById('game-title').value, pointsCorrect: parseInt(document.getElementById('points-correct').value, 10), items: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            document.querySelectorAll('.item-card').forEach(card => {
                const type = card.dataset.type;
                if (type === 'question') newGame.items.push({ type: 'question', question: card.querySelector('.question-input').value, answer: card.querySelector('.answer-input').value });
                else if (type === 'powerup-points') newGame.items.push({ type: 'powerup', subType: 'points', text: card.querySelector('.powerup-text-input').value, points: parseInt(card.querySelector('.powerup-points-input').value, 10) });
                else if (type === 'powerup-swap') newGame.items.push({ type: 'powerup', subType: 'swap', text: 'تبادل النقاط!' });
            });
            if (newGame.items.length === 0) { alert('يجب إضافة سؤال واحد على الأقل!'); submitButton.disabled = false; submitButton.textContent = originalButtonText; return; }
            
            await createGameInDb(newGame);
            fetchAndRenderGames(); 

        } catch (error) {
            console.error("Save failed:", error);
            alert("فشل الحفظ، يرجى المحاولة مرة أخرى.");
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
      // --- شاشة إعداد الفرق ---
    const teamNamesContainer = document.getElementById('team-names-container');
    document.getElementById('num-teams').addEventListener('change', (e) => { 
        const num = e.target.value; 
        teamNamesContainer.innerHTML = ''; 
        for (let i = 1; i <= num; i++) { 
            teamNamesContainer.innerHTML += `<label>اسم الفريق ${i}:</label><input type="text" class="team-name-input" value="الفريق ${i}" required>`; 
        } 
    });
    
    document.getElementById('team-setup-form').addEventListener('submit', (e) => { 
        e.preventDefault(); 
        const teams = Array.from(document.querySelectorAll('.team-name-input')).map(input => ({ name: input.value, score: 0 })); 
        const activeConfig = gameState.activeGameConfig; 
        gameState.gameInstance = { 
            ...activeConfig, 
            items: [...activeConfig.items].sort(() => Math.random() - 0.5), 
            teams, 
            currentTeamIndex: 0, 
            tilesLeft: activeConfig.items.length, 
            lastClickedTile: null 
        }; 
        renderGame(); 
        showScreen('game'); 
    });
    
    // --- منطق اللعبة الفعلي (تم تعديله) ---
    const renderGame = () => { 
        const game = gameState.gameInstance; 
        document.getElementById('game-title-display').textContent = game.title; 
        const scoreboard = document.getElementById('scoreboard'); 
        scoreboard.innerHTML = ''; 
        game.teams.forEach((team, index) => { 
            const teamDiv = document.createElement('div'); 
            teamDiv.className = `team-score ${index === game.currentTeamIndex ? 'active' : ''}`; 
            teamDiv.innerHTML = `<h3>${team.name}</h3><p>${team.score} نقطة</p>`; 
            scoreboard.appendChild(teamDiv); 
        }); 
        const gameBoard = document.getElementById('game-board'); 
        gameBoard.innerHTML = ''; 
        game.items.forEach((_, index) => { 
            const tile = document.createElement('div'); 
            tile.className = 'tile'; 
            tile.textContent = index + 1; 
            tile.dataset.index = index; 
            // نعيد استخدام addEventListener هنا لأن renderGame تعيد بناء اللوحة بالكامل
            tile.addEventListener('click', handleTileClick, { once: true }); 
            gameBoard.appendChild(tile); 
        }); 
    };

    function handleTileClick(e) { 
        const tile = e.target; 
        tile.style.visibility = 'hidden'; 
        gameState.gameInstance.lastClickedTile = tile;
        const itemIndex = parseInt(tile.dataset.index, 10); 
        const item = gameState.gameInstance.items[itemIndex]; 
        gameState.gameInstance.tilesLeft--; 
        if (item.type === 'question') { 
            showQuestionModal(item); 
        } else if (item.type === 'powerup') { 
            showPowerupModal(item); 
        } 
    }
      function showQuestionModal(item) { 
        modalBody.innerHTML = `<p id="modal-question">${item.question}</p><p id="modal-answer" style="display: none;">${item.answer}</p><div class="modal-controls"><button id="show-answer-btn">أظهر الإجابة</button><button id="correct-btn" style="display: none;" class="btn-play">صحيح</button><button id="incorrect-btn" style="display: none;" class="btn-delete">خطأ</button></div>`; 
        modal.style.display = 'flex'; 
        document.getElementById('show-answer-btn').onclick = (e) => { 
            document.getElementById('modal-answer').style.display = 'block'; 
            e.target.style.display = 'none'; 
            document.getElementById('correct-btn').style.display = 'inline-block'; 
            document.getElementById('incorrect-btn').style.display = 'inline-block'; 
        }; 
        document.getElementById('correct-btn').onclick = () => updateScore(gameState.gameInstance.pointsCorrect); 
        document.getElementById('incorrect-btn').onclick = () => closeModalAndNextTurn(); 
    }

    function showPowerupModal(item) { 
        if (item.subType === 'swap') { 
            let options = gameState.gameInstance.teams.map((team, index) => index !== gameState.gameInstance.currentTeamIndex ? `<option value="${index}">${team.name}</option>` : '').join(''); 
            if (!options) { closeModalAndNextTurn(); return; } 
            modalBody.innerHTML = `<p id="modal-powerup">${item.text}</p><p>اختر فريقًا لتبادل النقاط معه:</p><select id="swap-team-select">${options}</select><button id="confirm-swap-btn">تأكيد</button>`; 
            document.getElementById('confirm-swap-btn').onclick = () => { 
                const targetIndex = document.getElementById('swap-team-select').value; 
                const currentIndex = gameState.gameInstance.currentTeamIndex; 
                const currentScore = gameState.gameInstance.teams[currentIndex].score; 
                gameState.gameInstance.teams[currentIndex].score = gameState.gameInstance.teams[targetIndex].score; 
                gameState.gameInstance.teams[targetIndex].score = currentScore; 
                closeModalAndNextTurn(); 
            }; 
        } else { 
            modalBody.innerHTML = `<p id="modal-powerup">${item.text}</p><button id="apply-powerup-btn">تطبيق</button>`; 
            document.getElementById('apply-powerup-btn').onclick = () => updateScore(item.points); 
        } 
        modal.style.display = 'flex'; 
    }

    function updateScore(points) { 
        gameState.gameInstance.teams[gameState.gameInstance.currentTeamIndex].score += points; 
        closeModalAndNextTurn(); 
    }

    function closeModalAndNextTurn() { 
        const tileToDisable = gameState.gameInstance.lastClickedTile;
        if (tileToDisable) {
            tileToDisable.style.visibility = 'visible';
            tileToDisable.classList.add('disabled');
        }
        modal.style.display = 'none'; 
        if (gameState.gameInstance.tilesLeft === 0) { 
            endGame(); 
        } else { 
            gameState.gameInstance.currentTeamIndex = (gameState.gameInstance.currentTeamIndex + 1) % gameState.gameInstance.teams.length; 
            // لا نحتاج لإعادة رسم اللوحة هنا لأننا غيرنا المربع فقط
            // لكن سنعيد رسم لوحة النتائج لتحديث الفريق النشط
            const scoreboard = document.getElementById('scoreboard');
            scoreboard.innerHTML = '';
            gameState.gameInstance.teams.forEach((team, index) => {
                const teamDiv = document.createElement('div');
                teamDiv.className = `team-score ${index === gameState.gameInstance.currentTeamIndex ? 'active' : ''}`;
                teamDiv.innerHTML = `<h3>${team.name}</h3><p>${team.score} نقطة</p>`;
                scoreboard.appendChild(teamDiv);
            });
        } 
    }
    
    function endGame() { 
        const game = gameState.gameInstance; 
        const scores = game.teams.map(t => t.score); 
        const maxScore = Math.max(...scores); 
        const winners = game.teams.filter(t => t.score === maxScore); 
        let message = winners.length > 1 ? `انتهت اللعبة! تعادل بين: ${winners.map(w => w.name).join(' و ')}` : `انتهت اللعبة! الفائز هو فريق "${winners[0].name}"`; 
        document.getElementById('game-board').innerHTML = `<h2>${message} بنتيجة ${maxScore} نقطة!</h2>`; 
    }

    // --- أزرار التنقل والإعداد الأولي ---
    document.getElementById('create-new-game-btn').addEventListener('click', () => { 
        setupForm.reset(); 
        questionsContainer.innerHTML = ''; 
        const submitButton = document.getElementById('save-game-btn'); 
        submitButton.disabled = false; 
        submitButton.textContent = 'حفظ اللعبة'; 
        showScreen('setup'); 
    });

    document.getElementById('back-to-dashboard-btn').addEventListener('click', fetchAndRenderGames);
    document.getElementById('team-setup-back-btn').addEventListener('click', fetchAndRenderGames);
    document.getElementById('game-back-btn').addEventListener('click', fetchAndRenderGames);
    document.querySelector('.close-btn').onclick = () => { 
        // إذا تم إغلاق النافذة يدويًا، يجب أيضًا تعطيل المربع
        const tileToDisable = gameState.gameInstance.lastClickedTile;
        if (tileToDisable) {
            tileToDisable.style.visibility = 'visible';
            tileToDisable.classList.add('disabled');
        }
        modal.style.display = 'none';
        gameState.gameInstance.currentTeamIndex = (gameState.gameInstance.currentTeamIndex + 1) % gameState.gameInstance.teams.length;
    };
    
    // بدء التطبيق
    showScreen('login');
    document.getElementById('num-teams').dispatchEvent(new Event('change'));
});