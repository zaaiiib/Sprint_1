(function () {
    'use strict';

    const CART_STORAGE_KEY = 'desinuts_cart_items_v1';

    let productsById = {};

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();

            products.forEach(product => {
                productsById[product.id] = product;
            });
        } catch (e) {
            console.error('Failed to load products from the server', e);
        }
    }

    async function initCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();

            grid.innerHTML = categories.map(category => `
                <div class="category-card">
                    <div class="category-imgdiv">
                        <img src="${category.imageUrl}" alt="${category.name}" class="category-img">
                    </div>
                    <h2 class="category-head">${category.name}</h2>
                </div>
            `).join('');
        } catch (e) {
            console.error('Failed to load categories from the server', e);
            grid.innerHTML = '<p class="categories-loading">Could not load categories.</p>';
        }
    }

    function getCart() {
        try {
            const data = localStorage.getItem(CART_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load cart from localStorage', e);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            updateCartBadge();
            renderCartPage();
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }

    function addToCart(product) {
        const cart = getCart();
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += (product.quantity || 1);
        } else {
            cart.push({
                id: product.id,
                productId: product.productId,
                weightGrams: product.weightGrams,
                name: product.name,
                image: product.image,
                weightLabel: product.weightLabel,
                price: product.price,
                quantity: product.quantity || 1
            });
        }

        saveCart(cart);
        showToast(`Added "${product.name} (${product.weightLabel})" to cart!`);
    }

    function updateItemQuantity(itemId, change) {
        let cart = getCart();
        const item = cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== itemId);
            showToast('Item removed from cart');
        }
        saveCart(cart);
    }

    function removeItem(itemId) {
        let cart = getCart();
        cart = cart.filter(i => i.id !== itemId);
        saveCart(cart);
        showToast('Item removed from cart');
    }

    function clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            saveCart([]);
            showToast('Cart cleared');
        }
    }

    function updateCartBadge() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        const cartIcons = document.querySelectorAll('.ri-shopping-cart-fill');
        cartIcons.forEach(icon => {
            let badge = icon.parentElement.querySelector('.cart-count-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-count-badge';
                icon.parentElement.style.position = 'relative';
                icon.parentElement.appendChild(badge);
            }

            if (totalItems > 0) {
                badge.textContent = totalItems > 99 ? '99+' : totalItems;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    function initShopPricing() {
        const itemCards = document.querySelectorAll('.item1div, .item2div, .item3div, .item4div');
        if (!itemCards || itemCards.length === 0) return;

        itemCards.forEach((card) => {
            const select = card.querySelector('.weightselect');
            const addBtn = card.querySelector('.addtocart');
            const head = card.querySelector('.item1head, .item2head, .item3head, .item4head');
            const img = card.querySelector('img');
            const productId = parseInt(card.dataset.productId, 10);

            if (!select || !addBtn || !head || !productId) return;

            const product = productsById[productId];
            if (!product) return;

            let priceEl = card.querySelector('.card-price-display');
            if (!priceEl) {
                priceEl = document.createElement('div');
                priceEl.className = 'card-price-display';
                select.parentNode.insertBefore(priceEl, select);
            }

            function findPrice(weightGrams) {
                return product['price' + weightGrams + 'g'] || 0;
            }

            function updatePriceDisplay() {
                const selectedWeight = parseInt(select.value, 10);
                const price = findPrice(selectedWeight);

                priceEl.innerHTML = `
                    <span class="price-currency">₹</span><span class="price-val">${price.toLocaleString('en-IN')}</span>
                    <span class="price-per-tag">/ ${select.options[select.selectedIndex].text}</span>
                `;
            }

            updatePriceDisplay();

            select.addEventListener('change', updatePriceDisplay);

            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedWeight = parseInt(select.value, 10);
                const weightLabel = select.options[select.selectedIndex].text;
                const price = findPrice(selectedWeight);

                addToCart({
                    id: `${productId}-${selectedWeight}`,
                    productId: productId,
                    weightGrams: selectedWeight,
                    name: head.textContent.trim(),
                    image: img ? img.getAttribute('src') : product.imageUrl,
                    weightLabel: weightLabel,
                    price: price,
                    quantity: 1
                });
            });
        });
    }

    const WEIGHT_OPTIONS = [
        { grams: 100, label: '100 gram' },
        { grams: 250, label: '250 gram' },
        { grams: 500, label: '500 gram' },
        { grams: 1000, label: '1 kg' },
        { grams: 2000, label: '2 kg' },
        { grams: 5000, label: '5 kg' }
    ];

    async function initProductDetailPage() {
        const container = document.getElementById('productDetailContainer');
        if (!container) return;

        const productId = parseInt(getQueryParam('id'), 10);

        if (Object.keys(productsById).length === 0) {
            await loadProducts();
        }

        const product = productsById[productId];

        if (!product) {
            container.innerHTML = `<p class="product-not-found">Product not found. <a href="shop.html">Back to Shop</a></p>`;
            return;
        }

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-img">
                    <img src="${product.imageUrl}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h1 class="product-detail-name">${product.name}</h1>
                    <div class="product-detail-price" id="productDetailPrice"></div>

                    <label for="productWeight">Weight</label>
                    <select id="productWeight">
                        ${WEIGHT_OPTIONS.map(w => `<option value="${w.grams}">${w.label}</option>`).join('')}
                    </select>

                    <label for="productQty">Quantity</label>
                    <input type="number" id="productQty" value="1" min="1">

                    <div class="product-detail-actions">
                        <button type="button" id="productAddToCart" class="product-add-btn">Add to Cart</button>
                        <button type="button" id="productBuyNow" class="product-buy-btn">Buy Now</button>
                    </div>
                </div>
            </div>
        `;

        const weightSelect = document.getElementById('productWeight');
        const qtyInput = document.getElementById('productQty');
        const priceEl = document.getElementById('productDetailPrice');

        function currentPrice() {
            const weight = parseInt(weightSelect.value, 10);
            return product['price' + weight + 'g'] || 0;
        }

        function updatePrice() {
            priceEl.textContent = `₹${currentPrice().toLocaleString('en-IN')}`;
        }

        updatePrice();
        weightSelect.addEventListener('change', updatePrice);

        function buildCartItem() {
            const weight = parseInt(weightSelect.value, 10);
            const qty = parseInt(qtyInput.value, 10) || 1;

            return {
                id: `${productId}-${weight}`,
                productId: productId,
                weightGrams: weight,
                name: product.name,
                image: product.imageUrl,
                weightLabel: weightSelect.options[weightSelect.selectedIndex].text,
                price: currentPrice(),
                quantity: qty
            };
        }

        document.getElementById('productAddToCart').addEventListener('click', () => {
            addToCart(buildCartItem());
        });

        document.getElementById('productBuyNow').addEventListener('click', () => {
            addToCart(buildCartItem());
            window.location.href = 'checkout.html';
        });
    }

    function renderCartPage() {
        const container = document.getElementById('cartPageBody');
        if (!container) return;

        const cart = getCart();

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-state">
                    <i class="ri-shopping-cart-2-line empty-cart-icon"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any premium dry fruits or nuts yet.</p>
                    <a href="shop.html" class="cart-shop-now-btn">Explore Shop</a>
                </div>
            `;
            return;
        }

        let subtotal = 0;
        let itemsHtml = '<div class="cart-items-list">';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            itemsHtml += `
                <div class="cart-item-row" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-meta">
                            <span class="cart-item-weight">${item.weightLabel}</span>
                            <span class="cart-item-unitprice">₹${item.price} each</span>
                        </div>
                        <div class="cart-item-actions">
                            <div class="cart-qty-stepper">
                                <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                                <span class="qty-number">${item.quantity}</span>
                                <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                            </div>
                            <span class="cart-item-total">₹${itemTotal.toLocaleString('en-IN')}</span>
                            <button class="cart-item-remove" data-id="${item.id}" title="Remove Item">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        itemsHtml += '</div>';

        const shipping = subtotal >= 999 ? 0 : 60;
        const grandTotal = subtotal + shipping;

        container.innerHTML = `
            ${itemsHtml}
            <div class="cart-page-summary">
                <div class="cart-page-summary-row">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="cart-page-summary-row">
                    <span>Estimated Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : '₹60'}</span>
                </div>
                <div class="cart-page-summary-row total">
                    <span>Grand Total</span>
                    <span>₹${grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div class="cart-page-actions">
                    <a href="shop.html" class="continue-shopping-link">&larr; Continue Shopping</a>
                    <a href="checkout.html" class="checkout-btn">Proceed to Checkout</a>
                </div>
            </div>
        `;

        container.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => updateItemQuantity(btn.dataset.id, -1));
        });
        container.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => updateItemQuantity(btn.dataset.id, 1));
        });
        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeItem(btn.dataset.id));
        });
    }

    function initCartPage() {
        if (!document.getElementById('cartPageBody')) return;
        renderCartPage();
    }

    function renderCheckoutSummary() {
        const summaryEl = document.getElementById('checkoutSummary');
        if (!summaryEl) return null;

        const cart = getCart();

        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return null;
        }

        let subtotal = 0;
        let itemsHtml = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            itemsHtml += `
                <div class="checkout-summary-item">
                    <span>${item.name} (${item.weightLabel}) x ${item.quantity}</span>
                    <span>₹${itemTotal.toLocaleString('en-IN')}</span>
                </div>
            `;
        });

        const shipping = subtotal >= 999 ? 0 : 60;
        const grandTotal = subtotal + shipping;

        summaryEl.innerHTML = `
            <h3>Order Summary</h3>
            ${itemsHtml}
            <div class="checkout-summary-row">
                <span>Subtotal</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="checkout-summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '₹60'}</span>
            </div>
            <div class="checkout-summary-row total">
                <span>Total</span>
                <span>₹${grandTotal.toLocaleString('en-IN')}</span>
            </div>
        `;

        return cart;
    }

    function initCheckoutPage() {
        const form = document.getElementById('checkoutForm');
        if (!form) return;

        renderCheckoutSummary();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('checkoutError');
            errorEl.style.display = 'none';

            const cart = getCart();
            if (cart.length === 0) {
                window.location.href = 'cart.html';
                return;
            }

            const orderPayload = {
                customerName: document.getElementById('checkoutName').value.trim(),
                phone: document.getElementById('checkoutPhone').value.trim(),
                address: document.getElementById('checkoutAddress').value.trim(),
                items: cart.map(item => ({
                    productId: item.productId,
                    weightGrams: item.weightGrams,
                    quantity: item.quantity
                }))
            };

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });

                const order = await response.json();

                if (!response.ok) {
                    errorEl.textContent = order.message || 'Could not place order';
                    errorEl.style.display = 'block';
                    return;
                }

                saveCart([]);

                form.style.display = 'none';
                document.getElementById('checkoutSummary').style.display = 'none';

                const successEl = document.getElementById('checkoutSuccess');
                successEl.innerHTML = `
                    <h3>Order #${order.id} placed successfully!</h3>
                    <p>We've received your order for ₹${order.totalAmount.toLocaleString('en-IN')}. We'll get in touch shortly to arrange payment and delivery.</p>
                    <a href="shop.html" class="checkout-continue-link">Continue Shopping</a>
                `;
                successEl.style.display = 'block';
            } catch (err) {
                console.error('Failed to place order', err);
                errorEl.textContent = 'Something went wrong. Please try again.';
                errorEl.style.display = 'block';
            }
        });
    }

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                name: form.querySelector('.inputname').value.trim(),
                mobile: form.querySelector('.inputmob').value.trim(),
                email: form.querySelector('.inputemail').value.trim(),
                subject: form.querySelector('.inputsubject').value.trim(),
                message: form.querySelector('.msgbox').value.trim()
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                showToast(result.message || 'Message sent!');

                if (response.ok) {
                    form.reset();
                }
            } catch (err) {
                console.error('Failed to send contact message', err);
                showToast('Could not send your message. Please try again.');
            }
        });
    }

    async function initAuthNav() {
        const navItem = document.getElementById('authNavItem');
        if (!navItem) return;

        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!data.loggedIn) return;

            navItem.innerHTML = `
                <div class="authnav-trigger" id="authNavTrigger">
                    <i class="ri-user-3-fill"></i>
                    <span>${data.fullName}</span>
                </div>
                <div class="authnav-dropdown" id="authNavDropdown">
                    <button type="button" id="authLogoutBtn" class="authnav-logout-btn">
                        <i class="ri-logout-box-r-line"></i> Logout
                    </button>
                </div>
            `;

            const trigger = document.getElementById('authNavTrigger');
            const dropdown = document.getElementById('authNavDropdown');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!navItem.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });

            document.getElementById('authLogoutBtn').addEventListener('click', async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = 'index.html';
            });
        } catch (err) {
            console.error('Failed to check login status', err);
        }
    }

    function initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('loginError');
            errorEl.style.display = 'none';

            const payload = {
                email: document.getElementById('loginEmail').value.trim(),
                password: document.getElementById('loginPassword').value
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    errorEl.textContent = result.message || 'Login failed';
                    errorEl.style.display = 'block';
                    return;
                }

                window.location.href = 'index.html';
            } catch (err) {
                console.error('Login failed', err);
                errorEl.textContent = 'Something went wrong. Please try again.';
                errorEl.style.display = 'block';
            }
        });
    }

    function initRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('registerError');
            errorEl.style.display = 'none';

            const payload = {
                fullName: document.getElementById('registerName').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                password: document.getElementById('registerPassword').value
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    errorEl.textContent = result.message || 'Registration failed';
                    errorEl.style.display = 'block';
                    return;
                }

                showToast('Account created! Please log in.');
                window.location.href = 'login.html';
            } catch (err) {
                console.error('Registration failed', err);
                errorEl.textContent = 'Something went wrong. Please try again.';
                errorEl.style.display = 'block';
            }
        });
    }

    function initNewsletterModal() {
        const subInput = document.querySelector('.subinput');
        const subBtn = document.querySelector('.subbutton');

        if (!subBtn || !subInput) return;

        let modal = document.getElementById('newsletter-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'newsletter-modal';
            modal.className = 'newsletter-modal-overlay';
            modal.innerHTML = `
                <div class="newsletter-modal-card">
                    <button class="modal-close-btn" id="modal-close-btn">&times;</button>
                    <div class="modal-badge-icon">✨</div>
                    <h2 class="modal-title">Thank You for Subscribing!</h2>
                    <p class="modal-subtitle">Stay updated with us for all our latest news, fresh arrivals, and updates.</p>
                    <button class="modal-shop-btn" id="modal-ok-btn" style="cursor: pointer; border: none; margin-top: 15px;">Got It, Thanks!</button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });

            document.getElementById('modal-close-btn').addEventListener('click', () => {
                modal.classList.remove('open');
            });

            document.getElementById('modal-ok-btn').addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        subBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = subInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailRegex.test(email)) {
                showToast('Please enter a valid email address (e.g. name@gmail.com)');
                subInput.focus();
                return;
            }

            subInput.value = '';
            modal.classList.add('open');
        });
    }

    function showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `
            <i class="ri-checkbox-circle-fill toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    window.showDesiToast = showToast;

    document.addEventListener('DOMContentLoaded', async () => {
        updateCartBadge();
        initNewsletterModal();
        initContactForm();
        initAuthNav();
        initLoginForm();
        initRegisterForm();
        initCartPage();
        initCheckoutPage();
        initCategories();

        await loadProducts();
        initShopPricing();
        initProductDetailPage();
    });

})();
