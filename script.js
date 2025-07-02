// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-shg2AbUOAtlLnzIezzcoiIAHCXcg5GY",
  authDomain: "bambozo3.firebaseapp.com",
  projectId: "bambozo3",
  storageBucket: "bambozo3.firebasestorage.app",
  messagingSenderId: "715439275225",
  appId: "1:715439275225:web:c5b6f07147105db6ab92c8"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// كودات الدخول
const MASTER_CODE = '/YOUSSEF 982013/';
const VALID_TEACHERS = ['heba 005', 'nermeen 005'];
const STUDENTS = ['std001', 'std002', 'std003'];

// تسجيل الدخول
function login() {
  const code = document.getElementById("login-code").value.trim();
  const error = document.getElementById("error-msg");
  localStorage.setItem("loginCode", code);

  if (code === MASTER_CODE) {
    showAdmin();
  } else if (VALID_TEACHERS.includes(code)) {
    showTeacher();
  } else if (STUDENTS.includes(code)) {
    window.location.href = "student.html";
  } else {
    error.textContent = "⚠️ كود الدخول غير صحيح!";
  }
}

// إظهار لوحة المدير
function showAdmin() {
  const loginCode = localStorage.getItem("loginCode");
  if (loginCode === MASTER_CODE) {
    hideAllPages();
    document.getElementById("admin-page").style.display = "block";
  } else {
    alert("🚫 غير مسموح لك بالدخول هنا!");
    showLogin();
  }
}

// إظهار لوحة المعلم
function showTeacher() {
  const loginCode = localStorage.getItem("loginCode");
  if (VALID_TEACHERS.includes(loginCode)) {
    hideAllPages();
    document.getElementById("teacher-page").style.display = "block";
  } else {
    alert("🚫 غير مسموح لك بالدخول هنا!");
    showLogin();
  }
}

// إظهار صفحة تسجيل الدخول
function showLogin() {
  hideAllPages();
  document.getElementById("login-page").style.display = "block";
}

// إخفاء كل الصفحات
function hideAllPages() {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("admin-page").style.display = "none";
  document.getElementById("teacher-page").style.display = "none";
}

// اختبار Firebase
function testFirebase() {
  db.collection("test").limit(1).get()
    .then(snapshot => {
      if (!snapshot.empty) {
        alert("✅ تم الاتصال بـ Firebase بنجاح!");
      } else {
        alert("⚠️ Firebase متصل، لكن لا توجد بيانات تجريبية.");
      }
    })
    .catch(error => {
      alert("❌ فشل الاتصال بـ Firebase: " + error.message);
    });
}

// إضافة معلم
function addTeacher() {
  const name = document.getElementById("teacher-name").value.trim().toLowerCase();
  const number = document.getElementById("teacher-number").value.trim();
  const msg = document.getElementById("admin-msg");

  if (name === "" || number === "") {
    msg.textContent = "⚠️ من فضلك أدخل الاسم والرقم.";
    return;
  }

  const fullCode = name + " " + number;

  db.collection("teachers").add({
    name: name,
    code: fullCode,
    createdAt: new Date()
  }).then(() => {
    msg.style.color = "green";
    msg.textContent = "✅ تم إضافة المعلم بالكود: " + fullCode;
    document.getElementById("teacher-name").value = "";
    document.getElementById("teacher-number").value = "";
  }).catch((error) => {
    msg.style.color = "red";
    msg.textContent = "❌ فشل في الإضافة: " + error.message;
  });
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("loginCode");
  showLogin();
}
