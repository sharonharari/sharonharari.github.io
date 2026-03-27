const { getContainer } = require('../shared/cosmos');
const { getAuthUser } = require('../shared/auth');

module.exports = async function (context, req) {
  var user = getAuthUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  var userId = user.userId;
  var items = req.body && req.body.items;
  if (!Array.isArray(items)) {
    context.res = { status: 400, body: { error: 'items array is required' } };
    return;
  }

  var container = getContainer();
  var doc = {
    id: userId,
    userId: userId,
    items: items,
    updatedAt: new Date().toISOString()
  };

  try {
    await container.items.upsert(doc);
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: doc
    };
  } catch (err) {
    context.res = { status: 500, body: { error: 'Failed to save cart' } };
  }
};
