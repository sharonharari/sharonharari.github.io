const { CosmosClient } = require('@azure/cosmos');

let client;
let cartsContainer;
let productsContainer;

function getClient() {
  if (!client) {
    client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return client;
}

function getContainer() {
  if (!cartsContainer) {
    cartsContainer = getClient().database('myshop').container('carts');
  }
  return cartsContainer;
}

function getProductsContainer() {
  if (!productsContainer) {
    productsContainer = getClient().database('myshop').container('products');
  }
  return productsContainer;
}

module.exports = { getContainer, getProductsContainer };
