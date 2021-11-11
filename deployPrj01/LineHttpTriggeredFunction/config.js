// @ts-check

const config = {
    endpoint: "https://dbchacha2.documents.azure.com:443/",
    key: "HtK7HKRi0tyVySDj2m4cUP41GyjJ4lU2GnpJw7QEQAtsoAt8ZyLiUfdRdGuhX5wFBUlJ4E5fekDAvys14lyNVw==",
    databaseId: "Tasks",
    containerId: "Items",
    partitionKey: { kind: "Hash", paths: ["/category"] }
  };
  
  module.exports = config;