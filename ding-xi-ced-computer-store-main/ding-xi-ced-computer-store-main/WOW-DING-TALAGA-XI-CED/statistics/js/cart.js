const totalDisplay = document.querySelector('.cart-total h2');
const cartItemsContainer = document.querySelector('.cart-items');
const checkoutBtn = document.querySelector('.checkout-btn');

function getPrice(item) {
    const text = item.querySelector('.item-details p').textContent;
    return parseFloat(text.replace(/[^\d.]/g, ''));
}

function recalcTotal() {
    const items = document.querySelectorAll('.cart-item');
    let total = 0;

    items.forEach(item => {
        const price = getPrice(item);
        const qty = parseInt(item.querySelector('input[type="number"]').value) || 1;
        total += price * qty;
    });

    totalDisplay.textContent = `Total: ₱${total.toLocaleString()}`;
}

function removeItem(item) {
    item.style.transition = 'opacity .25s ease, transform .25s ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(2rem)';

    setTimeout(() => {
        item.remove();
        recalcTotal();
        checkEmpty();
    }, 250);
}

function checkEmpty() {
    const items = document.querySelectorAll('.cart-item');

    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <p>Your cart is empty.</p>
                <a href="index.html" class="btn">Go Back to Shop</a>
            </div>
        `;
        totalDisplay.textContent = 'Total: ₱0';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '.4';
        checkoutBtn.style.cursor = 'not-allowed';
    }
}

/* ── EVENT LISTENERS ─────────────────── */

cartItemsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
        removeItem(e.target.closest('.cart-item'));
    }
});

cartItemsContainer.addEventListener('change', e => {
    if (e.target.type === 'number') {
        if (parseInt(e.target.value) < 1 || isNaN(parseInt(e.target.value))) {
            e.target.value = 1;
        }
        recalcTotal();
    }
});

cartItemsContainer.addEventListener('input', e => {
    if (e.target.type === 'number') recalcTotal();
});

checkoutBtn.addEventListener('click', () => {
    const items = document.querySelectorAll('.cart-item');
    if (items.length === 0) return;

    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;

    setTimeout(() => {
        alert('Order placed! Thank you.');
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.disabled = false;
    }, 1500);
});

/* ── INIT ────────────────────────────── */
recalcTotal();