/* ==========================================================================
   نشر العروض + لوحة الأدمن
   ========================================================================== */

// ------------------------------------------------------------------
// نشر عرض جديد (للناشر والأدمن فقط)
// ------------------------------------------------------------------
function renderPublishPage() {
  const box = document.getElementById('publish-content');
  if (!currentUser || !(currentUser.role === 'publisher' || currentUser.role === 'admin')) {
    box.innerHTML = `<p class="empty">الصفحة دي متاحة بس للناشرين والأدمن.</p>`;
    return;
  }
  box.innerHTML = `
    <form id="publish-form" class="auth-form">
      <input type="text" id="offer-title" placeholder="عنوان العرض" required>
      <textarea id="offer-desc" placeholder="وصف العرض" required rows="4"></textarea>
      <input type="number" id="offer-price" placeholder="السعر ($)" required min="0" step="0.01">
      <input type="url" id="offer-image" placeholder="رابط صورة (اختياري)">
      <button type="submit" class="btn">نشر العرض</button>
      <p id="publish-msg" class="auth-error"></p>
    </form>
    <h4 style="margin-top:24px;">عروضك المنشورة</h4>
    <div id="my-offers-list"></div>
  `;

  document.getElementById('publish-form').onsubmit = async (e) => {
    e.preventDefault();
    const msg = document.getElementById('publish-msg');
    try {
      await db.collection('offers').add({
        title: document.getElementById('offer-title').value,
        description: document.getElementById('offer-desc').value,
        price: Number(document.getElementById('offer-price').value),
        image: document.getElementById('offer-image').value || '',
        authorUid: currentUser.uid,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      msg.style.color = 'var(--cryo)';
      msg.textContent = 'تم النشر بنجاح ✅';
      e.target.reset();
      loadMyOffers();
    } catch (err) {
      msg.textContent = 'حصل خطأ: ' + err.message;
    }
  };

  loadMyOffers();
}

async function loadMyOffers() {
  const list = document.getElementById('my-offers-list');
  const snap = await db.collection('offers').where('authorUid', '==', currentUser.uid)
    .orderBy('createdAt', 'desc').get();
  if (snap.empty) { list.innerHTML = '<p class="empty">لسه معندكش عروض منشورة</p>'; return; }
  list.innerHTML = snap.docs.map(doc => {
    const o = doc.data();
    return `<div class="offer-card">
      <strong>${o.title}</strong> — $${o.price}
      <button class="remove-btn" onclick="deleteOffer('${doc.id}')">🗑️</button>
    </div>`;
  }).join('');
}

async function deleteOffer(id) {
  await db.collection('offers').doc(id).delete();
  loadMyOffers();
}

// ------------------------------------------------------------------
// صفحة العروض العامة (تظهر للجميع، منشورة من ناشرين/أدمن)
// ------------------------------------------------------------------
async function renderOffersPage() {
  const grid = document.getElementById('offers-grid');
  grid.innerHTML = '<p class="empty">جاري التحميل...</p>';
  const snap = await db.collection('offers').orderBy('createdAt', 'desc').limit(30).get();
  if (snap.empty) { grid.innerHTML = '<p class="empty">مفيش عروض منشورة حاليًا</p>'; return; }
  grid.innerHTML = snap.docs.map(doc => {
    const o = doc.data();
    return `
      <div class="product-card">
        ${o.image ? `<div class="product-img" style="background-image:url('${o.image}')"></div>` : ''}
        <div class="product-body">
          <h4>${o.title}</h4>
          <p class="muted">${o.description}</p>
          <span class="muted">بواسطة ${o.authorName} · ${ROLE_LABELS[o.authorRole] || ''}</span>
          <div class="price-row"><span class="price">$${Number(o.price).toFixed(2)}</span></div>
        </div>
      </div>`;
  }).join('');
}

// ------------------------------------------------------------------
// لوحة الأدمن — إدارة الرتب (متاحة فقط لو role == admin،
// والتحقق الحقيقي بيحصل في Firestore Security Rules مش هنا بس)
// ------------------------------------------------------------------
function renderAdminPage() {
  const box = document.getElementById('admin-content');
  if (!currentUser || currentUser.role !== 'admin') {
    box.innerHTML = `<p class="empty">صفحة الأدمن غير متاحة لحسابك.</p>`;
    return;
  }
  box.innerHTML = `<p class="muted">جاري تحميل المستخدمين...</p>`;
  loadUsersForAdmin();
}

async function loadUsersForAdmin() {
  const box = document.getElementById('admin-content');
  const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
  box.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>الاسم</th><th>الإيميل</th><th>الرتبة</th><th>تغيير</th></tr></thead>
      <tbody>
        ${snap.docs.map(doc => {
          const u = doc.data();
          return `<tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="role-badge role-${u.role}">${ROLE_LABELS[u.role]}</span></td>
            <td>
              <select onchange="changeUserRole('${doc.id}', this.value)">
                <option value="member" ${u.role==='member'?'selected':''}>عضو</option>
                <option value="publisher" ${u.role==='publisher'?'selected':''}>ناشر</option>
                <option value="admin" ${u.role==='admin'?'selected':''}>أدمن</option>
              </select>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function changeUserRole(uid, newRole) {
  try {
    await db.collection('users').doc(uid).update({ role: newRole });
    toast('تم تحديث الرتبة');
  } catch (err) {
    alert('مفيش صلاحية لتغيير الرتبة: ' + err.message);
  }
}
