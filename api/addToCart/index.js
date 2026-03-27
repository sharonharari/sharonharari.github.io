const { getContainer } = require('../shared/cosmos');
const { getAuthUser } = require('../shared/auth');

module.exports = async function (context, req) {
  var user = getAuthUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  var userId = user.userId;
  var product = req.body && req.body.product;
  if (!product || !product.productId || !product.name || product.price == null) {
    context.res = { status: 400, body: { error: 'product with productId, name, and price is required' } };
    return;
  }

  var container = getContainer();
  var cart;

  try {
    var { resource } = await container.item(userId, userId).read();
    cart = resource || { id: userId, userId: userId, items: [] };
  } catch (err) {
    if (err.code === 404) {
      cart = { id: userId, userId: userId, items: [] };
    } else {
      context.res = { status: 500, body: { error: 'Failed to read cart' } };
      return;
    }
  }

  // Find existing item by productId — increment quantity or add new
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

  try {
    await container.items.upsert(cart);
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: cart
    };
  } catch (err) {
    context.res = { status: 500, body: { error: 'Failed to update cart' } };
  }
};
