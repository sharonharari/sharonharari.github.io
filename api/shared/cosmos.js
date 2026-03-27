const { CosmosClient } = require('@azure/cosmos');

let container;

function getContainer() {
  if (!container) {
    var client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    var database = client.database('myshop');
    container = database.container('carts');
  }
  return container;
}

module.exports = { getContainer };
