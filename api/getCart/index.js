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

  try {
    var { resource } = await container.item(userId, userId).read();
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resource || { id: userId, userId: userId, items: [], updatedAt: null }
    };
  } catch (err) {
    if (err.code === 404) {
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { id: userId, userId: userId, items: [], updatedAt: null }
      };
    } else {
      context.res = { status: 500, body: { error: 'Failed to retrieve cart' } };
    }
  }
};
