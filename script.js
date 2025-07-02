// ✅ إعداد Firebase
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

// ✅ تخزين الأكواد الديناميكية
let validTeachers = [];
let students = ['std001', 'std002', 'std003']; // تقدر تخلي الطلاب ديناميكيين كمان لو حبيت

// ✅ تحميل المعلمين من Firestore
db.collection("teachers").get().then(snapshot => {
  validTeachers = snapshot.docs.map(doc => doc.data().code);
});

// ✅ دالة تسجيل الدخول
function login() {
  const code = document.getElementById("login-code").value.trim();
  const error = document.getElementById("error-msg");

  localStorage.setItem("loginCode", code);

  if (code === '/YOUSSEF 982013/') {
    showAdmin();
  } else if (validTeachers.includes(code)) {
    showTeacher();
  } else if (students.includes(code)) {
    window.location.href = "student.html";
  } else {
    error.textContent = "⚠️ كود الدخول غير صحيح!";
  }
}

// ✅ إظهار لوحة المدير
function showAdmin() {
  hideAllPages();
  document.getElementById("admin-page").style.display = "block";
}

// ✅ إظهار لوحة المعلم
function showTeacher() {
  hideAllPages();
  document.getElementById("teacher-page").style.display = "block";
}

// ✅ إظهار صفحة تسجيل الدخول
function showLogin() {
  hideAllPages();
  document.getElementById("login-page").style.display = "block";
}

// ✅ إخفاء كل الصفحات
function hideAllPages() {
  const pages = ['login-page', 'admin-page', 'teacher-page'];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// ✅ اختبار الاتصال بـ Firebase
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

// ✅ إضافة معلم إلى Firestore
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
    validTeachers.push(fullCode); // تحديث القائمة محليًا فورًا
  }).catch((error) => {
    msg.style.color = "red";
    msg.textContent = "❌ فشل في الإضافة: " + error.message;
  });
}

// ✅ تسجيل الخروج
function logout() {
  localStorage.removeItem("loginCode");
  showLogin();
}
