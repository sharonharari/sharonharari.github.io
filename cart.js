// ===== Cart System (localStorage + optional API sync) =====

var CART_KEY = 'myshop_cart';

// --- localStorage cart storage ---
function getCartLocal() {
  try {
    var data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : { items: [] };
  } catch (e) {
    return { items: [] };
  }
}

function saveCartLocal(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// --- Public cart functions ---

function getCart() {
  return getCartLocal();
}

function addToCart(product) {
  var cart = getCartLocal();
  var existing = cart.items.find(function (item) {
    return item.productId === product.productId;
  });
  if (existing) {
    existing.quantity += (product.quantity || 1);
  } else {
    cart.items.push({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1
    });
  }
  cart.updatedAt = new Date().toISOString();
  saveCartLocal(cart);
  syncCartToAPI(cart);
  return cart;
}

function removeFromCart(productId) {
  var cart = getCartLocal();
  cart.items = cart.items.filter(function (item) {
    return item.productId !== productId;
  });
  cart.updatedAt = new Date().toISOString();
  saveCartLocal(cart);
  syncCartToAPI(cart);
  return cart;
}

function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) return removeFromCart(productId);
  var cart = getCartLocal();
  var item = cart.items.find(function (i) { return i.productId === productId; });
  if (item) item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  saveCartLocal(cart);
  syncCartToAPI(cart);
  return cart;
}

function clearCart() {
  var cart = { items: [], updatedAt: new Date().toISOString() };
  saveCartLocal(cart);
  syncCartToAPI(cart);
  return cart;
}

// Optional: sync to Azure API if available (fire-and-forget)
function syncCartToAPI(cart) {
  fetch('/api/saveCart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart.items })
  }).catch(function () { /* API not available, that's OK */ });
}

// ===== Cart UI Rendering =====

function renderCartPanel(cart) {
  var panel = document.getElementById('cartPanel');
  var countEl = document.getElementById('cartCount');
  var itemsEl = document.getElementById('cartItems');
  var totalEl = document.getElementById('cartTotal');

  if (!panel || !itemsEl) return;

  var items = (cart && cart.items) || [];
  var totalCount = items.reduce(function (sum, i) { return sum + i.quantity; }, 0);
  var totalPrice = items.reduce(function (sum, i) { return sum + (i.price * i.quantity); }, 0);

  // Update badge count
  if (countEl) {
    countEl.textContent = totalCount;
    countEl.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }

  // Render items
  if (items.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">\ud83d\uded2 \u05d4\u05e1\u05dc \u05e8\u05d9\u05e7</p>';
  } else {
    var html = '';
    items.forEach(function (item) {
      html +=
        '<div class="cart-item" data-id="' + item.productId + '">' +
          '<div class="cart-item-info">' +
            '<span class="cart-item-name">' + item.name + '</span>' +
            '<span class="cart-item-price">\u20aa' + item.price.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<button class="cart-qty-btn" onclick="changeQty(\'' + item.productId + '\', -1)">\u2212</button>' +
            '<span class="cart-item-qty">' + item.quantity + '</span>' +
            '<button class="cart-qty-btn" onclick="changeQty(\'' + item.productId + '\', 1)">+</button>' +
            '<button class="cart-remove-btn" onclick="removeItem(\'' + item.productId + '\')">\u2715</button>' +
          '</div>' +
        '</div>';
    });
    itemsEl.innerHTML = html;
  }

  // Total
  if (totalEl) {
    totalEl.textContent = '\u20aa' + totalPrice.toFixed(2);
  }
}

function toggleCart() {
  var panel = document.getElementById('cartPanel');
  if (panel) panel.classList.toggle('open');
}

function changeQty(productId, delta) {
  var cart = getCartLocal();
  var item = cart.items.find(function (i) { return i.productId === productId; });
  if (!item) return;
  var updated = updateCartQuantity(productId, item.quantity + delta);
  renderCartPanel(updated);
}

function removeItem(productId) {
  var updated = removeFromCart(productId);
  renderCartPanel(updated);
}

function clearCartUI() {
  var updated = clearCart();
  renderCartPanel(updated);
}

// Called from product "add to cart" buttons
function addProductToCart(productId, name, price) {
  var updated = addToCart({ productId: productId, name: name, price: price, quantity: 1 });
  renderCartPanel(updated);
}

// Load cart on page init
function initCart() {
  var cart = getCartLocal();
  renderCartPanel(cart);
}
