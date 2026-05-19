/* ═══════════════════════════════════════════════════
   dashboard.js — CRUD frontend for sellers & admins
   Talks to Flask API at /api/*
═══════════════════════════════════════════════════ */

const API = '/api';

/* ─── STATE ──────────────────────────────────────── */
let currentUser = null;       // populated from /api/me
let deleteCallback = null;    // stores pending delete fn

/* ─── INIT ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    initSidebar();
    initModals();
    initProductForm();
    initUserForm();
    initSearch();
    switchView('overview');
});

/* ─── AUTH / SESSION ─────────────────────────────── */
async function loadCurrentUser() {
    try {
        const res = await apiFetch('/api/me');
        currentUser = res;
        renderUserInfo();
        revealRoleContent();
    } catch {
        // Not logged in → redirect
        window.location.href = 'login.html';
    }
}

function renderUserInfo() {
    const { name, role } = currentUser;
    document.getElementById('su-name').textContent = name;
    document.getElementById('su-role').textContent = role === 'admin' ? 'Administrator' : 'Seller';
    document.getElementById('su-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('topbar-greeting').textContent = `Welcome back, ${name.split(' ')[0]}!`;
}

function revealRoleContent() {
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('visible'));
    }
}

document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await apiFetch('/api/logout', { method: 'POST' });
    window.location.href = 'login.html';
});

/* ─── SIDEBAR & VIEW SWITCHING ───────────────────── */
function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // nav links
    document.querySelectorAll('.nav-item[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
            sidebar.classList.remove('open');
        });
    });
}

function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');

    const navLink = document.querySelector(`.nav-item[data-view="${name}"]`);
    if (navLink) navLink.classList.add('active');

    // load data for the view
    if (name === 'overview')      loadOverview();
    if (name === 'products')      loadMyProducts();
    if (name === 'all-products')  loadAllProducts();
    if (name === 'users')         loadUsers();
}

/* ═══════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════ */
async function loadOverview() {
    const [myProds, statsData] = await Promise.all([
        apiFetch('/api/products'),
        currentUser.role === 'admin' ? apiFetch('/api/admin/stats') : null
    ]);

    const active = myProds.filter(p => p.status === 'active');
    document.getElementById('stat-products').textContent = myProds.length;
    document.getElementById('stat-active').textContent   = active.length;

    if (statsData) {
        document.getElementById('stat-users').textContent       = statsData.total_users;
        document.getElementById('stat-all-products').textContent = statsData.total_products;
    }

    // recent table (last 5)
    const recent = [...myProds].reverse().slice(0, 5);
    renderProductRows(recent, 'recent-tbody', true);
}

/* ═══════════════════════════════════════════════════
   MY PRODUCTS (Seller + Admin)
═══════════════════════════════════════════════════ */
async function loadMyProducts(query = '') {
    const url = query ? `/api/products?search=${encodeURIComponent(query)}` : '/api/products';
    const products = await apiFetch(url);
    renderProductRows(products, 'products-tbody');

    const empty = document.getElementById('products-empty');
    const table = document.getElementById('products-table');
    if (products.length === 0) {
        empty.style.display = 'block';
        table.style.display = 'none';
    } else {
        empty.style.display = 'none';
        table.style.display = '';
    }
}

function renderProductRows(products, tbodyId, compact = false) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.image_url
                ? `<img class="td-img" src="${p.image_url}" alt="${p.name}">`
                : `<div class="td-img-placeholder"><i class="fas fa-image"></i></div>`}
            </td>
            <td>${p.name}</td>
            ${compact ? '' : `<td>${p.category || '—'}</td>`}
            <td>₱${Number(p.price).toLocaleString()}</td>
            ${compact ? '' : `<td>${p.old_price ? '₱' + Number(p.old_price).toLocaleString() : '—'}</td>`}
            <td><span class="badge badge-${p.status}">${p.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" title="Edit" onclick="openEditProduct(${p.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="confirmDeleteProduct(${p.id}, '${escHtml(p.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ═══════════════════════════════════════════════════
   ALL PRODUCTS (Admin)
═══════════════════════════════════════════════════ */
async function loadAllProducts(query = '') {
    const url = query ? `/api/admin/products?search=${encodeURIComponent(query)}` : '/api/admin/products';
    const products = await apiFetch(url);
    const tbody = document.getElementById('all-products-tbody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.image_url
                ? `<img class="td-img" src="${p.image_url}" alt="${p.name}">`
                : `<div class="td-img-placeholder"><i class="fas fa-image"></i></div>`}
            </td>
            <td>${p.name}</td>
            <td>${p.seller_name || '—'}</td>
            <td>${p.category || '—'}</td>
            <td>₱${Number(p.price).toLocaleString()}</td>
            <td><span class="badge badge-${p.status}">${p.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" title="Edit" onclick="openEditProduct(${p.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="confirmDeleteProduct(${p.id}, '${escHtml(p.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ═══════════════════════════════════════════════════
   USERS (Admin)
═══════════════════════════════════════════════════ */
async function loadUsers(query = '') {
    const url = query ? `/api/admin/users?search=${encodeURIComponent(query)}` : '/api/admin/users';
    const users = await apiFetch(url);
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="badge badge-${u.role}">${u.role}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" title="Edit" onclick="openEditUser(${u.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="confirmDeleteUser(${u.id}, '${escHtml(u.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ═══════════════════════════════════════════════════
   PRODUCT CRUD
═══════════════════════════════════════════════════ */
document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());

function openProductModal(product = null) {
    const isEdit = !!product;
    document.getElementById('product-modal-title').textContent = isEdit ? 'Edit Product' : 'Add Product';
    document.getElementById('product-id').value   = isEdit ? product.id : '';
    document.getElementById('f-name').value        = isEdit ? product.name : '';
    document.getElementById('f-category').value    = isEdit ? (product.category || '') : '';
    document.getElementById('f-price').value       = isEdit ? product.price : '';
    document.getElementById('f-old-price').value   = isEdit ? (product.old_price || '') : '';
    document.getElementById('f-desc').value        = isEdit ? (product.description || '') : '';
    document.getElementById('f-badge').value       = isEdit ? (product.badge || '') : 'New';
    document.getElementById('f-status').value      = isEdit ? product.status : 'active';

    const preview = document.getElementById('img-preview');
    if (isEdit && product.image_url) {
        preview.src = product.image_url;
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }

    openModal('product-modal');
}

async function openEditProduct(id) {
    const product = await apiFetch(`/api/products/${id}`);
    openProductModal(product);
}

function initProductForm() {
    // file drop zone
    const drop = document.getElementById('file-drop');
    const fileInput = document.getElementById('f-image');
    const preview = document.getElementById('img-preview');

    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.style.borderColor = 'crimson'; });
    drop.addEventListener('dragleave', () => { drop.style.borderColor = ''; });
    drop.addEventListener('drop', (e) => {
        e.preventDefault();
        drop.style.borderColor = '';
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    document.getElementById('save-product-btn').addEventListener('click', saveProduct);
}

async function saveProduct() {
    const id       = document.getElementById('product-id').value;
    const name     = document.getElementById('f-name').value.trim();
    const price    = document.getElementById('f-price').value;

    if (!name || !price) { showToast('Name and price are required.', 'error'); return; }

    const formData = new FormData();
    formData.append('name',        name);
    formData.append('category',    document.getElementById('f-category').value.trim());
    formData.append('price',       price);
    formData.append('old_price',   document.getElementById('f-old-price').value || '');
    formData.append('description', document.getElementById('f-desc').value.trim());
    formData.append('badge',       document.getElementById('f-badge').value);
    formData.append('status',      document.getElementById('f-status').value);

    const fileInput = document.getElementById('f-image');
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

    try {
        if (id) {
            await apiFetch(`/api/products/${id}`, { method: 'PUT', body: formData, raw: true });
            showToast('Product updated!', 'success');
        } else {
            await apiFetch('/api/products', { method: 'POST', body: formData, raw: true });
            showToast('Product added!', 'success');
        }
        closeModal('product-modal');
        loadMyProducts();
        loadOverview();
    } catch (err) {
        showToast(err.message || 'Something went wrong.', 'error');
    }
}

function confirmDeleteProduct(id, name) {
    document.getElementById('confirm-msg').textContent = `Delete "${name}"? This cannot be undone.`;
    deleteCallback = async () => {
        await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted.', 'success');
        closeModal('confirm-modal');
        loadMyProducts();
        loadOverview();
        if (currentUser.role === 'admin') loadAllProducts();
    };
    openModal('confirm-modal');
}

/* ═══════════════════════════════════════════════════
   USER CRUD (Admin)
═══════════════════════════════════════════════════ */
document.getElementById('add-user-btn')?.addEventListener('click', () => openUserModal());

function openUserModal(user = null) {
    const isEdit = !!user;
    document.getElementById('user-modal-title').textContent = isEdit ? 'Edit User' : 'Add User';
    document.getElementById('user-id').value    = isEdit ? user.id : '';
    document.getElementById('u-name').value     = isEdit ? user.name : '';
    document.getElementById('u-email').value    = isEdit ? user.email : '';
    document.getElementById('u-role').value     = isEdit ? user.role : 'seller';

    const pwGroup = document.getElementById('u-password-group');
    pwGroup.style.display = isEdit ? 'none' : 'block';
    document.getElementById('u-password').required = !isEdit;

    openModal('user-modal');
}

async function openEditUser(id) {
    const user = await apiFetch(`/api/admin/users/${id}`);
    openUserModal(user);
}

function initUserForm() {
    document.getElementById('save-user-btn').addEventListener('click', saveUser);
}

async function saveUser() {
    const id    = document.getElementById('user-id').value;
    const name  = document.getElementById('u-name').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const role  = document.getElementById('u-role').value;
    const pw    = document.getElementById('u-password').value;

    if (!name || !email) { showToast('Name and email are required.', 'error'); return; }
    if (!id && !pw)       { showToast('Password is required for new users.', 'error'); return; }

    const payload = { name, email, role };
    if (pw) payload.password = pw;

    try {
        if (id) {
            await apiFetch(`/api/admin/users/${id}`, { method: 'PUT', json: payload });
            showToast('User updated!', 'success');
        } else {
            await apiFetch('/api/admin/users', { method: 'POST', json: payload });
            showToast('User created!', 'success');
        }
        closeModal('user-modal');
        loadUsers();
    } catch (err) {
        showToast(err.message || 'Something went wrong.', 'error');
    }
}

function confirmDeleteUser(id, name) {
    document.getElementById('confirm-msg').textContent = `Delete user "${name}"? This cannot be undone.`;
    deleteCallback = async () => {
        await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        showToast('User deleted.', 'success');
        closeModal('confirm-modal');
        loadUsers();
        loadOverview();
    };
    openModal('confirm-modal');
}

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (deleteCallback) deleteCallback();
});

/* ─── SEARCH ─────────────────────────────────────── */
function initSearch() {
    debounceInput('product-search',     (q) => loadMyProducts(q));
    debounceInput('all-product-search', (q) => loadAllProducts(q));
    debounceInput('user-search',        (q) => loadUsers(q));
}

function debounceInput(id, fn, delay = 300) {
    const el = document.getElementById(id);
    if (!el) return;
    let timer;
    el.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(el.value.trim()), delay);
    });
}

/* ─── MODALS ─────────────────────────────────────── */
function initModals() {
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

/* ─── TOAST ──────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ─── API HELPER ─────────────────────────────────── */
async function apiFetch(url, opts = {}) {
    const options = {
        method: opts.method || 'GET',
        credentials: 'include',   // send session cookie
    };

    if (opts.json) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(opts.json);
    } else if (opts.raw) {
        // FormData — let browser set Content-Type with boundary
        options.body = opts.body;
    }

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

/* ─── UTIL ───────────────────────────────────────── */
function escHtml(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}