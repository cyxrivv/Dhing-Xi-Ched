/* ═══════════════════════════════════════════════════
   shop.js  —  filter, sort, search, render products
═══════════════════════════════════════════════════ */

/* ─── PRODUCT DATA ───────────────────────────────── */


/* ─── STATE ──────────────────────────────────────── */
let activeCategory = 'all';
let activeSort     = 'default';
let searchQuery    = '';
let priceMin       = null;
let priceMax       = null;
let viewMode       = 'grid';   // 'grid' | 'list'

/* ─── INIT ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
   
    bindEvents();
});

/* ─── BIND EVENTS ─────────────────────────────────── */
function bindEvents() {

    /* sidebar category list */
    document.querySelectorAll('#cat-list .cat-item').forEach(item => {
        item.addEventListener('click', () => {
            activeCategory = item.dataset.cat;
            syncCategoryUI();
            renderProducts();
        });
    });

    /* mobile chips */
    document.querySelectorAll('#cat-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            activeCategory = chip.dataset.cat;
            syncCategoryUI();
            renderProducts();
        });
    });

    /* search */
    document.getElementById('search-input').addEventListener('input', e => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProducts();
    });

    /* price apply */
    document.getElementById('apply-price').addEventListener('click', () => {
        const minVal = document.getElementById('price-min').value;
        const maxVal = document.getElementById('price-max').value;
        priceMin = minVal ? parseFloat(minVal) : null;
        priceMax = maxVal ? parseFloat(maxVal) : null;
        renderProducts();
    });

    /* sort */
    document.getElementById('sort-select').addEventListener('change', e => {
        activeSort = e.target.value;
        renderProducts();
    });

    /* clear */
    document.getElementById('clear-filters').addEventListener('click', clearAllFilters);

    /* grid / list toggle */
    document.getElementById('grid-btn').addEventListener('click', () => setView('grid'));
    document.getElementById('list-btn').addEventListener('click', () => setView('list'));
}

/* ─── SYNC CATEGORY UI ────────────────────────────── */
function syncCategoryUI() {
    /* sidebar */
    document.querySelectorAll('#cat-list .cat-item').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === activeCategory);
    });
    /* chips */
    document.querySelectorAll('#cat-chips .chip').forEach(el => {
        el.classList.toggle('active', el.dataset.cat === activeCategory);
    });
}

/* ─── FILTER + SORT ───────────────────────────────── */
function getFiltered() {
    let list = [...products];

    if (activeCategory !== 'all') {
        list = list.filter(p => p.cat === activeCategory);
    }

    if (searchQuery) {
        list = list.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.cat.toLowerCase().includes(searchQuery)
        );
    }

    if (priceMin !== null) list = list.filter(p => p.price >= priceMin);
    if (priceMax !== null) list = list.filter(p => p.price <= priceMax);

    switch (activeSort) {
        case 'price-asc':  list.sort((a, b) => a.price - b.price);  break;
        case 'price-desc': list.sort((a, b) => b.price - a.price);  break;
        case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc':  list.sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    return list;
}

/* ─── UPDATE COUNTS ───────────────────────────────── */
function updateCounts() {
    const cats = ['cpu','gpu','ram','storage','motherboard','psu','cooling','case','peripherals'];
    document.getElementById('count-all').textContent = products.length;
    cats.forEach(cat => {
        const el = document.getElementById('count-' + cat);
        if (el) el.textContent = products.filter(p => p.cat === cat).length;
    });
}

/* ─── RENDER ──────────────────────────────────────── */
function renderProducts() {
    const filtered = getFiltered();
    const grid     = document.getElementById('products-grid');
    const empty    = document.getElementById('shop-empty');
    const count    = document.getElementById('result-count');

    count.innerHTML = filtered.length === products.length
        ? `Showing <strong>all ${products.length}</strong> products`
        : `Showing <strong>${filtered.length}</strong> of ${products.length} products`;

    if (filtered.length === 0) {
        grid.innerHTML  = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    const catLabels = {
        cpu: 'CPU', gpu: 'GPU', ram: 'RAM', storage: 'Storage',
        motherboard: 'Motherboard', psu: 'Power Supply',
        cooling: 'Cooling', case: 'PC Case', peripherals: 'Peripherals'
    };

    const badgeClass = { Hot: 'hot', Sale: 'sale', New: 'new' };

    grid.innerHTML = filtered.map(p => {
        const badge    = p.badge ? `<span class="card-badge ${badgeClass[p.badge] || ''}">${p.badge}</span>` : '';
        const oldPrice = p.oldPrice ? `<span class="old-price">₱${p.oldPrice.toLocaleString()}</span>` : '';

        if (viewMode === 'list') {
            return `
            <div class="box" onclick="goProduct(${p.id})" style="cursor:pointer">
                <a href="product.html?id=${p.id}" class="img-wrap" onclick="event.stopPropagation()">
                    ${badge}
                    <img src="${p.img}" alt="${p.name}" loading="lazy">
                </a>
                <div class="box-body">
                    <div>
                        <p class="card-cat">${catLabels[p.cat] || p.cat}</p>
                        <h3>${p.name}</h3>
                        <p style="font-size:1.35rem;color:rgba(255,255,255,0.45);margin-top:.4rem;text-transform:none">${p.desc}</p>
                    </div>
                    <div class="price-row">
                        <span class="price">₱${p.price.toLocaleString()}</span>
                        ${oldPrice}
                    </div>
                    <a href="product.html?id=${p.id}" class="btn">View Product</a>
                </div>
            </div>`;
        }

        return `
        <div class="box" onclick="goProduct(${p.id})" style="cursor:pointer">
            <a href="product.html?id=${p.id}" class="img-wrap" onclick="event.stopPropagation()">
                ${badge}
                <img src="${p.img}" alt="${p.name}" loading="lazy">
            </a>
            <div class="box-body">
                <p class="card-cat">${catLabels[p.cat] || p.cat}</p>
                <h3>${p.name}</h3>
                <div class="price-row">
                    <span class="price">₱${p.price.toLocaleString()}</span>
                    ${oldPrice}
                </div>
                <a href="product.html?id=${p.id}" class="btn">View Product</a>
            </div>
        </div>`;
    }).join('');
}

/* ─── NAVIGATE TO PRODUCT ────────────────────────── */
function goProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

/* ─── VIEW MODE ──────────────────────────────────── */
function setView(mode) {
    viewMode = mode;
    const grid = document.getElementById('products-grid');
    grid.classList.toggle('grid-view', mode === 'grid');
    grid.classList.toggle('list-view', mode === 'list');
    document.getElementById('grid-btn').classList.toggle('active', mode === 'grid');
    document.getElementById('list-btn').classList.toggle('active', mode === 'list');
    renderProducts();
}

/* ─── CLEAR ALL FILTERS ───────────────────────────── */
function clearAllFilters() {
    activeCategory = 'all';
    activeSort     = 'default';
    searchQuery    = '';
    priceMin       = null;
    priceMax       = null;

    document.getElementById('search-input').value = '';
    document.getElementById('price-min').value    = '';
    document.getElementById('price-max').value    = '';
    document.getElementById('sort-select').value  = 'default';

    syncCategoryUI();
    renderProducts();
}