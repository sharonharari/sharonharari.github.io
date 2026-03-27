// ===== Cart System (localStorage + optional API sync) =====

var CART_KEY = 'myshop_cart';

// Local fallback product data (used when API is unavailable)
var LOCAL_PRODUCTS = [
  { id: 'prod-1', name: '\u05de\u05d5\u05e6\u05e8 1', price: 99.90,  description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 20 },
  { id: 'prod-2', name: '\u05de\u05d5\u05e6\u05e8 2', price: 79.90,  description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 15 },
  { id: 'prod-3', name: '\u05de\u05d5\u05e6\u05e8 3', price: 149.90, description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 10 },
  { id: 'prod-4', name: '\u05de\u05d5\u05e6\u05e8 4', price: 59.90,  description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 25 },
  { id: 'prod-5', name: '\u05de\u05d5\u05e6\u05e8 5', price: 129.90, description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 12 },
  { id: 'prod-6', name: '\u05de\u05d5\u05e6\u05e8 6', price: 89.90,  description: '\u05ea\u05d9\u05d0\u05d5\u05e8 \u05e7\u05e6\u05e8 \u05e9\u05dc \u05d4\u05de\u05d5\u05e6\u05e8 \u05e9\u05de\u05e1\u05d1\u05d9\u05e8 \u05dc\u05de\u05d4 \u05d4\u05d5\u05d0 \u05de\u05d9\u05d5\u05d7\u05d3', image: '', stock: 18 }
];

// Current products state (populated by loadProducts)
var currentProducts = [];

// ===== Products Loading =====

async function loadProducts() {
  var grid = document.getElementById('productGrid');
  if (!grid) return;

  try {
    var res = await fetch('/api/getProducts');
    if (res.ok) {
      currentProducts = await res.json();
    } else {
      currentProducts = LOCAL_PRODUCTS;
    }
  } catch (e) {
    currentProducts = LOCAL_PRODUCTS;
  }

  renderProducts(currentProducts);
}

function renderProducts(products) {
  var grid = document.getElementById('productGrid');
  if (!grid) return;

  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#636e72;">\u05d0\u05d9\u05df \u05de\u05d5\u05e6\u05e8\u05d9\u05dd \u05dc\u05d4\u05e6\u05d2\u05d4</p>';
    return;
  }

  var html = '';
  products.forEach(function (p, index) {
    var outOfStock = (p.stock != null && p.stock <= 0);
    var stockLabel = '';
    if (p.stock != null) {
      stockLabel = outOfStock
        ? '<span class="stock-label out-of-stock">\u05d0\u05d6\u05dc \u05d1\u05de\u05dc\u05d0\u05d9</span>'
        : '<span class="stock-label in-stock">\u05d1\u05de\u05dc\u05d0\u05d9: ' + p.stock + '</span>';
    }

    var badgeHtml = '';
    if (index < 2) badgeHtml = '<span class="product-badge">\u05d7\u05d3\u05e9</span>';
    if (index === 1 || index === 5) badgeHtml = '<span class="product-badge sale">\u05de\u05d1\u05e6\u05e2</span>';

    var btnDisabled = outOfStock ? ' disabled' : '';
    var btnText = outOfStock ? '\u05d0\u05d6\u05dc \u05d1\u05de\u05dc\u05d0\u05d9' : '\u05d4\u05d5\u05e1\u05e3 \u05dc\u05e1\u05dc';
    var btnClass = outOfStock ? 'btn btn-small btn-disabled' : 'btn btn-small';

    html +=
      '<div class="product-card' + (outOfStock ? ' product-out-of-stock' : '') + '">' +
        '<div class="product-image">' +
          badgeHtml +
          (p.image
            ? '<img src="' + p.image + '" alt="' + p.name + '">'
            : '<div class="product-image-placeholder">\ud83d\uddbc\ufe0f</div>') +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="product-description">' + (p.description || '') + '</p>' +
          stockLabel +
          '<div class="product-footer">' +
            '<span class="product-price">\u20aa' + p.price.toFixed(2) + '</span>' +
            '<button class="' + btnClass + '"' + btnDisabled +
              ' onclick="addProductToCart(\'' + p.id + '\',\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ')">' +
              btnText + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  });

  grid.innerHTML = html;
}

// ===== Stock Check for Purchase =====

async function buyProduct(productId, quantity) {
  try {
    var res = await fetch('/api/decreaseStock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, quantity: quantity })
    });

    if (!res.ok) {
      var err = await res.json();
      alert(err.error || '\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05e8\u05db\u05d9\u05e9\u05d4');
      return false;
    }

    // Refresh products to show updated stock
    await loadProducts();
    return true;
  } catch (e) {
    return true; // API unavailable — allow locally
  }
}

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
  // Check stock from current product data
  var product = currentProducts.find(function (p) { return p.id === productId; });
  if (product && product.stock != null && product.stock <= 0) {
    alert('\u05de\u05e6\u05d8\u05e2\u05e8\u05d9\u05dd, \u05d4\u05de\u05d5\u05e6\u05e8 \u05d0\u05d6\u05dc \u05d1\u05de\u05dc\u05d0\u05d9!');
    return;
  }
  var updated = addToCart({ productId: productId, name: name, price: price, quantity: 1 });
  renderCartPanel(updated);
}

// Load cart on page init
async function initCart() {
  var cart = getCartLocal();
  renderCartPanel(cart);
  await loadProducts();
}
