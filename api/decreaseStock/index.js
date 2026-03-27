const { getProductsContainer } = require('../shared/cosmos');
const { getAuthUser } = require('../shared/auth');

module.exports = async function (context, req) {
  var user = getAuthUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  var body = req.body;
  if (!body || !body.productId || !body.quantity || body.quantity <= 0) {
    context.res = { status: 400, body: { error: 'productId and positive quantity are required' } };
    return;
  }

  var container = getProductsContainer();
  var productId = body.productId;
  var quantity = Number(body.quantity);

  try {
    // Read current product
    var { resource } = await container.item(productId, productId).read();
    if (!resource) {
      context.res = { status: 404, body: { error: 'Product not found' } };
      return;
    }

    if (resource.stock < quantity) {
      context.res = {
        status: 400,
        body: { error: 'Out of stock', requested: quantity, available: resource.stock }
      };
      return;
    }

    // Safe replace using _etag for optimistic concurrency
    resource.stock -= quantity;
    await container.item(productId, productId).replace(resource, {
      accessCondition: { type: 'IfMatch', condition: resource._etag }
    });

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { id: productId, stock: resource.stock, purchased: quantity }
    };
  } catch (err) {
    if (err.code === 412) {
      context.res = { status: 409, body: { error: 'Conflict — please retry' } };
    } else {
      context.res = { status: 500, body: { error: 'Failed to decrease stock' } };
    }
  }
};
