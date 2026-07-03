/* ==========================================================================
   إعدادات Firebase
   خطوات الحصول على القيم دي موجودة بالتفصيل في README.md
   ========================================================================== */

const firebaseConfig = {
  apiKey: "ضع_API_KEY_هنا",
  authDomain: "ضع_PROJECT_ID.firebaseapp.com",
  projectId: "ضع_PROJECT_ID_هنا",
  storageBucket: "ضع_PROJECT_ID.appspot.com",
  messagingSenderId: "ضع_SENDER_ID_هنا",
  appId: "ضع_APP_ID_هنا",
};

// الإيميل الوحيد اللي بيدخل صفحة الأدمن تلقائيًا (السوبر أدمن)
const SUPER_ADMIN_EMAIL = "osamabrazo@gmail.com";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
