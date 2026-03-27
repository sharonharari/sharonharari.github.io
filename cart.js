// ===== Cart Helper Functions =====
// Works with Azure Static Web Apps auth + /api/ Azure Functions

async function getCart() {
  try {
    var res = await fetch('/api/getCart');
    if (!res.ok) return { items: [] };
    return await res.json();
  } catch (e) {
    return { items: [] };
  }
}

async function addToCart(product) {
  var res = await fetch('/api/addToCart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: product })
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return await res.json();
}

async function removeFromCart(productId) {
  // Fetch current cart, filter out the product, save back
  var cart = await getCart();
  cart.items = cart.items.filter(function (item) {
    return item.productId !== productId;
  });
  return await saveCart(cart.items);
}

async function updateCartQuantity(productId, quantity) {
  var cart = await getCart();
  var item = cart.items.find(function (i) { return i.productId === productId; });
  if (item) {
    if (quantity <= 0) {
      return await removeFromCart(productId);
    }
    item.quantity = quantity;
  }
  return await saveCart(cart.items);
}

async function saveCart(items) {
  var res = await fetch('/api/saveCart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: items })
  });
  if (!res.ok) throw new Error('Failed to save cart');
  return await res.json();
}

async function clearCart() {
  var res = await fetch('/api/clearCart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return await res.json();
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
    itemsEl.innerHTML = '<p class="cart-empty">🛒 הסל ריק</p>';
  } else {
    var html = '';
    items.forEach(function (item) {
      html +=
        '<div class="cart-item" data-id="' + item.productId + '">' +
          '<div class="cart-item-info">' +
            '<span class="cart-item-name">' + item.name + '</span>' +
            '<span class="cart-item-price">₪' + item.price.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<button class="cart-qty-btn" onclick="changeQty(\'' + item.productId + '\', -1)">−</button>' +
            '<span class="cart-item-qty">' + item.quantity + '</span>' +
            '<button class="cart-qty-btn" onclick="changeQty(\'' + item.productId + '\', 1)">+</button>' +
            '<button class="cart-remove-btn" onclick="removeItem(\'' + item.productId + '\')">✕</button>' +
          '</div>' +
        '</div>';
    });
    itemsEl.innerHTML = html;
  }

  // Total
  if (totalEl) {
    totalEl.textContent = '₪' + totalPrice.toFixed(2);
  }
}

function toggleCart() {
  var panel = document.getElementById('cartPanel');
  if (panel) panel.classList.toggle('open');
}

async function changeQty(productId, delta) {
  var cart = await getCart();
  var item = cart.items.find(function (i) { return i.productId === productId; });
  if (!item) return;
  var newQty = item.quantity + delta;
  var updated = await updateCartQuantity(productId, newQty);
  renderCartPanel(updated);
}

async function removeItem(productId) {
  var updated = await removeFromCart(productId);
  renderCartPanel(updated);
}

async function clearCartUI() {
  var updated = await clearCart();
  renderCartPanel(updated);
}

// Called from product "add to cart" buttons
async function addProductToCart(productId, name, price) {
  var user = await getUser();
  if (!user) {
    window.location.href = '/.auth/login/google';
    return;
  }
  var updated = await addToCart({ productId: productId, name: name, price: price, quantity: 1 });
  renderCartPanel(updated);
}

// Load cart on page init (called from script.js after auth loads)
async function initCart() {
  var user = await getUser();
  if (user) {
    var cart = await getCart();
    renderCartPanel(cart);
  } else {
    renderCartPanel({ items: [] });
  }
}
