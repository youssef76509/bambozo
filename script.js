
const VALID_CODES = ['heba 005', 'nermeen 005', '/YOUSSEF 982013/'];
let currentUser = '';

function login() {
  const code = document.getElementById('login-code').value.trim();
  if (VALID_CODES.includes(code)) {
    currentUser = code;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    document.getElementById('user-code').textContent = currentUser;
  } else {
    document.getElementById('login-error').textContent = 'كود غير صحيح';
  }
}

function logout() {
  location.reload();
}

function startTeamSetup() {
  document.getElementById('game-section').style.display = 'none';
  document.getElementById('team-setup').style.display = 'block';
  generateTeamInputs();
}

function generateTeamInputs() {
  const num = parseInt(document.getElementById('num-teams').value);
  const container = document.getElementById('teams-container');
  container.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const div = document.createElement('div');
    div.className = 'team-block';
    div.innerHTML = `
      <label>اسم الفريق ${i}:</label>
      <input type="text" placeholder="اسم الفريق" />
      <label>لاعب 1:</label>
      <input type="text" placeholder="اسم اللاعب" />
      <input type="text" placeholder="الصف الدراسي" />
    `;
    container.appendChild(div);
  }
}

function confirmTeams() {
  alert("✅ تم تسجيل الفرق! (نسخة تجريبية)");
}
