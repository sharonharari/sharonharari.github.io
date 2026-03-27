const { getProductsContainer } = require('../shared/cosmos');
const { getAuthUser } = require('../shared/auth');

module.exports = async function (context, req) {
  var user = getAuthUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  var body = req.body;
  if (!body || !body.name || body.price == null) {
    context.res = { status: 400, body: { error: 'name and price are required' } };
    return;
  }

  var container = getProductsContainer();
  var doc = {
    id: body.id || ('prod-' + Date.now()),
    name: body.name,
    price: Number(body.price),
    description: body.description || '',
    image: body.image || '',
    stock: body.stock != null ? Number(body.stock) : 0,
    createdAt: new Date().toISOString()
  };

  try {
    await container.items.create(doc);
    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: doc
    };
  } catch (err) {
    if (err.code === 409) {
      context.res = { status: 409, body: { error: 'Product with this id already exists' } };
    } else {
      context.res = { status: 500, body: { error: 'Failed to create product' } };
    }
  }
};
