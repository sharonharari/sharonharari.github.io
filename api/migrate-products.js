// Migration script: seeds existing products into Cosmos DB "products" container
// Run once: node migrate-products.js
// Requires: COSMOS_CONNECTION_STRING environment variable

const { CosmosClient } = require('@azure/cosmos');

var connectionString = process.env.COSMOS_CONNECTION_STRING;
if (!connectionString) {
  console.error('ERROR: Set COSMOS_CONNECTION_STRING environment variable');
  process.exit(1);
}

// Existing products to migrate (matches the current site)
var oldProducts = [
  { id: 'prod-1', name: 'מוצר 1', price: 99.90,  description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 20 },
  { id: 'prod-2', name: 'מוצר 2', price: 79.90,  description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 15 },
  { id: 'prod-3', name: 'מוצר 3', price: 149.90, description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 10 },
  { id: 'prod-4', name: 'מוצר 4', price: 59.90,  description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 25 },
  { id: 'prod-5', name: 'מוצר 5', price: 129.90, description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 12 },
  { id: 'prod-6', name: 'מוצר 6', price: 89.90,  description: 'תיאור קצר של המוצר שמסביר למה הוא מיוחד', image: '', stock: 18 }
];

async function migrate() {
  var client = new CosmosClient(connectionString);

  // Ensure database exists
  var { database } = await client.databases.createIfNotExists({ id: 'myshop' });
  console.log('Database: myshop');

  // Ensure products container exists (partition key: /id)
  var { container } = await database.containers.createIfNotExists({
    id: 'products',
    partitionKey: { paths: ['/id'] }
  });
  console.log('Container: products');

  // Ensure carts container exists (partition key: /userId)
  await database.containers.createIfNotExists({
    id: 'carts',
    partitionKey: { paths: ['/userId'] }
  });
  console.log('Container: carts');

  // Insert products, skip duplicates
  for (var product of oldProducts) {
    var doc = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      createdAt: new Date().toISOString()
    };

    try {
      await container.items.create(doc);
      console.log('Created: ' + product.name + ' (' + product.id + ')');
    } catch (err) {
      if (err.code === 409) {
        console.log('Skipped (already exists): ' + product.name + ' (' + product.id + ')');
      } else {
        console.error('Error creating ' + product.id + ':', err.message);
      }
    }
  }

  console.log('\nMigration complete!');
}

migrate().catch(function (err) {
  console.error('Migration failed:', err);
  process.exit(1);
});
