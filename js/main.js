/* e-electronics — shared site functionality */
const STORE = {
  name: 'e-electronics',
  whatsapp: '916204208196', // Replace with your WhatsApp number, country code included, no + or spaces.
  phone: '+91 62042 08196',  // Replace with your phone number.
  email: 'radhekant239@gmail.com', // Replace with your email.
  upi: 'yourupi@bank', // Replace with your real UPI ID.
  currency: '₹'
};

const CART_KEY = 'eElectronicsCart';

function money(value) { return `${STORE.currency}${Number(value).toLocaleString('en-IN')}`; }
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function getProduct(id) { return PRODUCTS.find(p => p.id === Number(id)); }
function cartCount() { return getCart().reduce((sum, item) => sum + item.qty, 0); }
function cartTotal() { return getCart().reduce((sum, item) => { const p = getProduct(item.id); return sum + (p ? p.price * item.qty : 0); }, 0); }

function updateCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cartCount());
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function addToCart(id, qty = 1) {
  const product = getProduct(id); if (!product) return;
  const cart = getCart(); const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += qty; else cart.push({ id: product.id, qty });
  saveCart(cart); showToast(`${product.name} added to cart`);
}
function changeQty(id, delta) {
  const cart = getCart(); const item = cart.find(i => i.id === Number(id));
  if (!item) return; item.qty += delta;
  if (item.qty <= 0) saveCart(cart.filter(i => i.id !== Number(id))); else saveCart(cart);
  renderCart();
}
function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== Number(id))); renderCart(); }

function productCard(product) {
  return `<article class="product-card">
    <a href="product.html?id=${product.id}" aria-label="View ${product.name}">
      <div class="product-image-wrap"><img src="${product.image}" alt="${product.name} — e-electronics" loading="lazy">${product.badge ? `<span class="badge">${product.badge}</span>` : ''}</div>
    </a>
    <div class="product-body">
      <div class="product-category">${product.category}</div>
      <a href="product.html?id=${product.id}"><div class="product-name">${product.name}</div></a>
      <div class="rating">★ ${product.rating} <span>(${product.reviews})</span></div>
      <div class="price-row"><span class="price">${money(product.price)}</span>${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
      <div class="card-actions"><button class="btn btn-primary" data-add="${product.id}">Add to cart</button></div>
    </div>
  </article>`;
}

function renderProductGrid(target, products) { const el = document.querySelector(target); if (el) el.innerHTML = products.map(productCard).join(''); }

function setupNav() {
  const menuBtn = document.querySelector('[data-menu]'); const menu = document.querySelector('[data-mobile-menu]');
  if (menuBtn && menu) menuBtn.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? '×' : '☰'; });
}
function setupGlobalEvents() {
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'); if (add) addToCart(add.dataset.add);
    const plus = e.target.closest('[data-plus]'); if (plus) changeQty(plus.dataset.plus, 1);
    const minus = e.target.closest('[data-minus]'); if (minus) changeQty(minus.dataset.minus, -1);
    const remove = e.target.closest('[data-remove]'); if (remove) removeFromCart(remove.dataset.remove);
  });
}

function renderCart() {
  const list = document.querySelector('[data-cart-items]'); const subtotal = document.querySelector('[data-subtotal]'); const grand = document.querySelector('[data-grand-total]'); const empty = document.querySelector('[data-empty-cart]');
  if (!list) return;
  const cart = getCart();
  if (!cart.length) { list.innerHTML = ''; if (empty) empty.hidden = false; if (subtotal) subtotal.textContent = money(0); if (grand) grand.textContent = money(0); return; }
  if (empty) empty.hidden = true;
  list.innerHTML = cart.map(item => { const p = getProduct(item.id); if (!p) return ''; return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)} each</p><div class="qty-control"><button aria-label="Decrease quantity" data-minus="${p.id}">−</button><span>${item.qty}</span><button aria-label="Increase quantity" data-plus="${p.id}">+</button></div><br><button class="remove-btn" data-remove="${p.id}">Remove</button></div><strong>${money(p.price * item.qty)}</strong></div>`; }).join('');
  if (subtotal) subtotal.textContent = money(cartTotal()); if (grand) grand.textContent = money(cartTotal());
}

function renderProductDetail() {
  const root = document.querySelector('[data-product-detail]'); if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || 1; const p = getProduct(id);
  if (!p) { root.innerHTML = '<div class="empty-state"><h2>Product not found</h2><p>That product is no longer available.</p><a class="btn btn-primary" href="shop.html">Back to shop</a></div>'; return; }
  document.title = `${p.name} | e-electronics`;
  root.innerHTML = `<div class="detail-image"><img src="${p.image}" alt="${p.name} product image"></div><div><div class="detail-category">${p.category}</div><h1 class="detail-title">${p.name}</h1><div class="rating">★ ${p.rating} <span>(${p.reviews} reviews)</span></div><div class="detail-price">${money(p.price)} ${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ''}</div><p class="detail-description">${p.description}</p><ul class="detail-features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul><div class="detail-actions"><button class="btn btn-primary" data-add="${p.id}">Add to cart</button><a class="btn btn-secondary" href="cart.html">View cart</a></div></div>`;
}

function setupShop() {
  const grid = document.querySelector('[data-shop-grid]'); if (!grid) return;
  const search = document.querySelector('[data-search]'); const filter = document.querySelector('[data-filter]');
  const apply = () => { const q = (search?.value || '').toLowerCase().trim(); const cat = filter?.value || 'all'; const items = PRODUCTS.filter(p => (cat === 'all' || p.category === cat) && p.name.toLowerCase().includes(q)); grid.innerHTML = items.length ? items.map(productCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><h2>No products found</h2><p>Try another search or category.</p></div>'; };
  if (search) search.addEventListener('input', apply); if (filter) filter.addEventListener('change', apply); apply();
}

function setupCheckout() {
  const form = document.querySelector('[data-checkout-form]'); if (!form) return;
  const total = document.querySelector('[data-checkout-total]'); if (total) total.textContent = money(cartTotal());
  const upi = document.querySelector('[data-upi-id]'); if (upi) upi.textContent = STORE.upi;
  form.addEventListener('submit', e => {
    e.preventDefault(); const cart = getCart(); if (!cart.length) { showToast('Your cart is empty'); return; }
    const data = new FormData(form); const lines = cart.map(i => { const p = getProduct(i.id); return `${p.name} x ${i.qty} = ${money(p.price * i.qty)}`; }).join('\n');
    const message = `Hello e-electronics, I want to place an order.\n\nCustomer: ${data.get('name')}\nPhone: ${data.get('phone')}\nAddress: ${data.get('address')}\n\nOrder:\n${lines}\n\nTotal: ${money(cartTotal())}\nPayment: ${data.get('payment')}`;
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  });
}

function hydrateContact() {
  document.querySelectorAll('[data-store-phone]').forEach(el => { el.textContent = STORE.phone; if (el.tagName === 'A') el.href = `tel:${STORE.phone.replace(/\s/g,'')}`; });
  document.querySelectorAll('[data-store-email]').forEach(el => { el.textContent = STORE.email; if (el.tagName === 'A') el.href = `mailto:${STORE.email}`; });
  document.querySelectorAll('[data-whatsapp-link]').forEach(el => { el.href = `https://wa.me/${STORE.whatsapp}`; });
}

function init() { setupNav(); setupGlobalEvents(); updateCartCount(); renderProductDetail(); setupShop(); renderCart(); setupCheckout(); hydrateContact(); }
document.addEventListener('DOMContentLoaded', init);
