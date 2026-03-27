const { getProductsContainer } = require('../shared/cosmos');

module.exports = async function (context, req) {
  var container = getProductsContainer();

  try {
    var { resources } = await container.items
      .query('SELECT * FROM c WHERE c.stock >= 0 ORDER BY c.name')
      .fetchAll();

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resources || []
    };
  } catch (err) {
    context.res = { status: 500, body: { error: 'Failed to fetch products' } };
  }
};
