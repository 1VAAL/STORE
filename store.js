/* ==========================================================================
   منطق المتجر العام
   ========================================================================== */

let cart = {};          // { productId: { qty, variant } }
let wishlist = new Set();
let currentFilter = { category: null, query: '', maxPrice: 1000 };

function navigate(page, params = {}) {
  window.__params = params;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
  closeAllDropdowns();

  if (page === 'shop') renderProductGrid();
  if (page === 'product') renderProductDetail(params.id);
  if (page === 'cart') renderCartPage();
  if (page === 'checkout') renderCheckoutPage();
  if (page === 'wishlist') renderWishlistPage();
  if (page === 'publish') renderPublishPage();
  if (page === 'admin') renderAdminPage();
  if (page === 'offers') renderOffersPage();
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
}

// ------------------------------------------------------------------
// الصفحة الرئيسية — التصنيفات
// ------------------------------------------------------------------
function renderHomeCategories() {
  const wrap = document.getElementById('home-categories');
  wrap.innerHTML = CATEGORIES.map(c => `
    <div class="cat-card" onclick="filterByCategory('${c.id}')">
      <div class="cat-emoji">${c.emoji}</div>
      <span>${c.label}</span>
    </div>
  `).join('');

  const featured = document.getElementById('home-featured');
  featured.innerHTML = PRODUCTS.slice(0, 4).map(productCardHTML).join('');
}

function filterByCategory(catId) {
  currentFilter.category = catId;
  navigate('shop');
}

// ------------------------------------------------------------------
// بطاقة منتج
// ------------------------------------------------------------------
function productCardHTML(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  return `
    <div class="product-card">
      ${discount ? `<span class="discount-badge">-${discount}%</span>` : ''}
      <div class="product-img" style="background-image:url('${p.image}')" onclick="navigate('product',{id:'${p.id}'})">
        <div class="hover-actions">
          <button title="نظرة سريعة" onclick="event.stopPropagation(); quickView('${p.id}')">👁️</button>
          <button title="المفضلة" onclick="event.stopPropagation(); toggleWishlist('${p.id}')">${wishlist.has(p.id) ? '❤️' : '🤍'}</button>
          <button title="مقارنة" onclick="event.stopPropagation(); alert('تمت الإضافة للمقارنة')">⚖️</button>
        </div>
      </div>
      <div class="product-body">
        <h4 onclick="navigate('product',{id:'${p.id}'})">${p.name}</h4>
        <div class="stars">${stars} <span class="muted">(${p.reviews})</span></div>
        <div class="price-row">
          <span class="price">$${p.price.toFixed(2)}</span>
          ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}
        </div>
        <button class="btn small" onclick="addToCart('${p.id}')">أضف للسلة</button>
      </div>
    </div>`;
}

function quickView(id) { navigate('product', { id }); }

function toggleWishlist(id) {
  if (wishlist.has(id)) wishlist.delete(id); else wishlist.add(id);
  if (document.getElementById('page-shop').classList.contains('active')) renderProductGrid();
  if (document.getElementById('page-home').classList.contains('active')) renderHomeCategories();
}

// ------------------------------------------------------------------
// صفحة المتجر — بحث وفلاتر
// ------------------------------------------------------------------
function renderProductGrid() {
  document.getElementById('cat-filter').innerHTML =
    `<option value="">كل التصنيفات</option>` +
    CATEGORIES.map(c => `<option value="${c.id}" ${currentFilter.category===c.id?'selected':''}>${c.label}</option>`).join('');

  let items = PRODUCTS.filter(p => {
    if (currentFilter.category && p.category !== currentFilter.category) return false;
    if (currentFilter.query && !p.name.includes(currentFilter.query)) return false;
    if (p.price > currentFilter.maxPrice) return false;
    return true;
  });

  const grid = document.getElementById('shop-grid');
  grid.innerHTML = items.length
    ? items.map(productCardHTML).join('')
    : `<p class="empty">مفيش منتجات مطابقة للبحث.</p>`;
}

function onSearchInput(value) {
  currentFilter.query = value;
  renderSearchSuggestions(value);
  if (document.getElementById('page-shop').classList.contains('active')) renderProductGrid();
}

function renderSearchSuggestions(value) {
  const box = document.getElementById('search-suggestions');
  if (!value) { box.innerHTML=''; box.style.display='none'; return; }
  const matches = PRODUCTS.filter(p => p.name.includes(value)).slice(0, 5);
  box.style.display = matches.length ? 'block' : 'none';
  box.innerHTML = matches.map(p => `
    <div class="suggestion-item" onclick="navigate('product',{id:'${p.id}'})">${p.name}</div>
  `).join('');
}

function onCategoryFilterChange(value) {
  currentFilter.category = value || null;
  renderProductGrid();
}

function onPriceFilterChange(value) {
  currentFilter.maxPrice = Number(value);
  document.getElementById('price-filter-label').textContent = `$${value}`;
  renderProductGrid();
}

// ------------------------------------------------------------------
// صفحة تفاصيل المنتج
// ------------------------------------------------------------------
function renderProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const el = document.getElementById('product-detail-content');
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  el.innerHTML = `
    <div class="pd-gallery">
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div class="pd-info">
      <h2>${p.name}</h2>
      <div class="stars">${stars} <span class="muted">(${p.reviews} تقييم)</span></div>
      <div class="price-row" style="margin:14px 0;">
        <span class="price big">$${p.price.toFixed(2)}</span>
        ${p.oldPrice ? `<span class="old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}
      </div>
      ${p.variants?.size ? `
        <div class="variant-row">
          <label>المقاس</label>
          <div class="variant-options" id="size-options">
            ${p.variants.size.map((s,i) => `<button class="variant-btn ${i===0?'selected':''}" onclick="selectVariant(this)">${s}</button>`).join('')}
          </div>
        </div>` : ''}
      <div class="variant-row">
        <label>الكمية</label>
        <div class="qty-control">
          <button onclick="stepQty(-1)">−</button>
          <span id="pd-qty">1</span>
          <button onclick="stepQty(1)">+</button>
        </div>
      </div>
      <div class="pd-actions">
        <button class="btn" onclick="addToCart('${p.id}', true)">أضف للسلة</button>
        <button class="btn outline" onclick="addToCart('${p.id}', true); navigate('checkout')">اشترِ الآن</button>
      </div>
      <p class="pd-desc">${p.description}</p>
      <h4>المواصفات</h4>
      <ul class="specs-list">${p.specs.map(s=>`<li>${s}</li>`).join('')}</ul>
    </div>
  `;

  document.getElementById('reviews-list').innerHTML = `
    <div class="review"><strong>سارة</strong><div class="stars">★★★★★</div><p>جودة ممتازة والتغليف كان محترف جدًا.</p></div>
    <div class="review"><strong>أحمد</strong><div class="stars">★★★★☆</div><p>المنتج حلو بس التوصيل اتأخر شوية.</p></div>
  `;

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  document.getElementById('related-products').innerHTML = related.map(productCardHTML).join('');
}

let pdQty = 1;
let pdVariant = null;
function stepQty(delta) {
  pdQty = Math.max(1, pdQty + delta);
  document.getElementById('pd-qty').textContent = pdQty;
}
function selectVariant(btn) {
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  pdVariant = btn.textContent;
}

// ------------------------------------------------------------------
// السلة
// ------------------------------------------------------------------
function addToCart(id, fromDetail = false) {
  const qty = fromDetail ? pdQty : 1;
  const variant = fromDetail ? pdVariant : null;
  const key = id + (variant ? '-' + variant : '');
  if (!cart[key]) cart[key] = { id, variant, qty: 0 };
  cart[key].qty += qty;
  pdQty = 1; pdVariant = null;
  updateCartCount();
  if (!fromDetail) toast('تمت الإضافة للسلة');
}

function updateCartCount() {
  const count = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = count;
  el.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartPage() {
  const entries = Object.entries(cart);
  const wrap = document.getElementById('cart-content');
  if (!entries.length) {
    wrap.innerHTML = `<p class="empty">السلة فاضية دلوقتي</p>`;
    return;
  }
  let total = 0;
  const rows = entries.map(([key, item]) => {
    const p = PRODUCTS.find(x => x.id === item.id);
    const subtotal = p.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-row">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-row-info">
          <strong>${p.name}</strong>
          ${item.variant ? `<span class="muted">المقاس: ${item.variant}</span>` : ''}
          <span class="price">$${p.price.toFixed(2)}</span>
        </div>
        <div class="qty-control">
          <button onclick="changeCartQty('${key}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeCartQty('${key}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${key}')">🗑️</button>
      </div>`;
  }).join('');

  wrap.innerHTML = `
    ${rows}
    <div class="cart-total-row">
      <span>الإجمالي</span>
      <span class="price big">$${total.toFixed(2)}</span>
    </div>
    <button class="btn" onclick="navigate('checkout')">إتمام الشراء (Checkout)</button>
  `;
}

function changeCartQty(key, delta) {
  cart[key].qty += delta;
  if (cart[key].qty <= 0) delete cart[key];
  updateCartCount();
  renderCartPage();
}

function removeFromCart(key) {
  delete cart[key];
  updateCartCount();
  renderCartPage();
}

// ------------------------------------------------------------------
// صفحة الدفع
// ------------------------------------------------------------------
function renderCheckoutPage() {
  const entries = Object.entries(cart);
  let total = 0;
  const summary = entries.map(([key, item]) => {
    const p = PRODUCTS.find(x => x.id === item.id);
    total += p.price * item.qty;
    return `<div class="summary-row"><span>${p.name} × ${item.qty}</span><span>$${(p.price*item.qty).toFixed(2)}</span></div>`;
  }).join('');

  document.getElementById('checkout-summary').innerHTML = `
    ${summary || '<p class="empty">السلة فاضية</p>'}
    <div class="cart-total-row"><span>الإجمالي</span><span class="price big">$${total.toFixed(2)}</span></div>
  `;

  document.getElementById('checkout-form').onsubmit = (e) => {
    e.preventDefault();
    cart = {};
    updateCartCount();
    toast('تم تأكيد طلبك بنجاح 🎉');
    navigate('home');
  };
}

// ------------------------------------------------------------------
// المفضلة
// ------------------------------------------------------------------
function renderWishlistPage() {
  const items = PRODUCTS.filter(p => wishlist.has(p.id));
  document.getElementById('wishlist-grid').innerHTML = items.length
    ? items.map(productCardHTML).join('')
    : `<p class="empty">مفيش منتجات في المفضلة لسه</p>`;
}

// ------------------------------------------------------------------
// تنبيه بسيط
// ------------------------------------------------------------------
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ------------------------------------------------------------------
// بداية التشغيل
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderHomeCategories();
  navigate('home');
});
