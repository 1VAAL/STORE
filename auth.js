/* ==========================================================================
   نظام الحسابات والرتب
   الرتب: member (عضو) | publisher (ناشر) | admin (أدمن)
   ========================================================================== */

let currentUser = null;   // { uid, email, name, role }

const ROLE_LABELS = { member: 'عضو', publisher: 'ناشر', admin: 'أدمن' };

// ------------------------------------------------------------------
// مراقبة حالة تسجيل الدخول
// ------------------------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const doc = await db.collection('users').doc(user.uid).get();
    let role = 'member';
    let name = user.email.split('@')[0];

    if (doc.exists) {
      role = doc.data().role || 'member';
      name = doc.data().name || name;
    } else {
      // أول مرة يسجل فيها — ننشئ سجله
      role = (user.email === SUPER_ADMIN_EMAIL) ? 'admin' : 'member';
      await db.collection('users').doc(user.uid).set({
        email: user.email, name, role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
    currentUser = { uid: user.uid, email: user.email, name, role };
  } else {
    currentUser = null;
  }
  renderAccountUI();
  updateNavVisibility();
});

// ------------------------------------------------------------------
// تسجيل حساب جديد
// ------------------------------------------------------------------
async function registerUser(name, email, password) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const role = (email === SUPER_ADMIN_EMAIL) ? 'admin' : 'member';
  await db.collection('users').doc(cred.user.uid).set({
    email, name, role,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function loginUser(email, password) {
  await auth.signInWithEmailAndPassword(email, password);
}

function logoutUser() {
  auth.signOut();
}

// ------------------------------------------------------------------
// واجهة أيقونة الحساب
// ------------------------------------------------------------------
function renderAccountUI() {
  const box = document.getElementById('account-menu');
  if (!currentUser) {
    box.innerHTML = `
      <button class="dropdown-item" onclick="openAuthModal('login')">تسجيل الدخول</button>
      <button class="dropdown-item" onclick="openAuthModal('register')">إنشاء حساب</button>
    `;
    return;
  }
  box.innerHTML = `
    <div class="dropdown-header">
      <strong>${currentUser.name}</strong>
      <span class="role-badge role-${currentUser.role}">${ROLE_LABELS[currentUser.role]}</span>
    </div>
    <button class="dropdown-item" onclick="navigate('orders')">طلباتي السابقة</button>
    <button class="dropdown-item" onclick="navigate('wishlist')">المفضلة</button>
    <button class="dropdown-item" onclick="navigate('profile')">بيانات الحساب</button>
    ${(currentUser.role === 'publisher' || currentUser.role === 'admin')
      ? `<button class="dropdown-item" onclick="navigate('publish')">نشر عرض جديد</button>` : ''}
    ${currentUser.role === 'admin'
      ? `<button class="dropdown-item" onclick="navigate('admin')">لوحة الأدمن</button>` : ''}
    <button class="dropdown-item logout" onclick="logoutUser()">تسجيل الخروج</button>
  `;
}

function updateNavVisibility() {
  const offersLink = document.getElementById('nav-offers-publish');
  if (offersLink) {
    offersLink.style.display =
      currentUser && (currentUser.role === 'publisher' || currentUser.role === 'admin')
        ? 'inline-block' : 'none';
  }
}

// ------------------------------------------------------------------
// مودال تسجيل الدخول / إنشاء حساب
// ------------------------------------------------------------------
function openAuthModal(mode) {
  const sheet = document.getElementById('auth-sheet');
  const isLogin = mode === 'login';
  sheet.innerHTML = `
    <button class="close-btn" onclick="closeOverlay('auth-overlay')">✕</button>
    <div style="clear:both"></div>
    <h2>${isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
    <form id="auth-form" class="auth-form">
      ${!isLogin ? `<input type="text" id="auth-name" placeholder="الاسم" required>` : ''}
      <input type="email" id="auth-email" placeholder="البريد الإلكتروني" required>
      <input type="password" id="auth-password" placeholder="كلمة المرور" required minlength="6">
      <p id="auth-error" class="auth-error"></p>
      <button type="submit" class="btn">${isLogin ? 'دخول' : 'إنشاء الحساب'}</button>
    </form>
    <p class="auth-switch">
      ${isLogin ? 'معندكش حساب؟' : 'عندك حساب بالفعل؟'}
      <a href="#" onclick="openAuthModal('${isLogin ? 'register' : 'login'}'); return false;">
        ${isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
      </a>
    </p>
  `;
  document.getElementById('auth-overlay').classList.add('open');

  document.getElementById('auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        const name = document.getElementById('auth-name').value.trim();
        await registerUser(name, email, password);
      }
      closeOverlay('auth-overlay');
    } catch (err) {
      errorEl.textContent = translateAuthError(err.code);
    }
  };
}

function translateAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'الإيميل ده مسجل بالفعل.',
    'auth/invalid-email': 'صيغة الإيميل غير صحيحة.',
    'auth/weak-password': 'كلمة المرور لازم تكون 6 حروف على الأقل.',
    'auth/user-not-found': 'مفيش حساب بالإيميل ده.',
    'auth/wrong-password': 'كلمة المرور غلط.',
    'auth/invalid-credential': 'بيانات الدخول غير صحيحة.',
  };
  return map[code] || 'حصل خطأ، حاول تاني.';
}
