const { getProductsContainer } = require('../shared/cosmos');

module.exports = async function (context, req) {
  var productId = req.query.id;
  if (!productId) {
    context.res = { status: 400, body: { error: 'id query parameter is required' } };
    return;
  }

  var container = getProductsContainer();

  try {
    var { resource } = await container.item(productId, productId).read();
    if (!resource) {
      context.res = { status: 404, body: { error: 'Product not found' } };
      return;
    }
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resource
    };
  } catch (err) {
    if (err.code === 404) {
      context.res = { status: 404, body: { error: 'Product not found' } };
    } else {
      context.res = { status: 500, body: { error: 'Failed to fetch product' } };
    }
  }
};
