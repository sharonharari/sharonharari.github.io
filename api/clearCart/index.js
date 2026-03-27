const { getContainer } = require('../shared/cosmos');
const { getAuthUser } = require('../shared/auth');

module.exports = async function (context, req) {
  var user = getAuthUser(req);
  if (!user) {
    context.res = { status: 401, body: { error: 'Not authenticated' } };
    return;
  }

  var userId = user.userId;
  var container = getContainer();
  var doc = {
    id: userId,
    userId: userId,
    items: [],
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
    context.res = { status: 500, body: { error: 'Failed to clear cart' } };
  }
};
