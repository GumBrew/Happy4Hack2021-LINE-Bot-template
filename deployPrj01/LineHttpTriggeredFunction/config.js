// @ts-check

const config = {
    endpoint: "https://dbchacha.documents.azure.com:443/",
    key: "9PLYaFZaviXUJJvud1RXhPlzGJsyG0ZdthkLquSQ70C5nqsPV4TvviwI6ZaUNkTT2XFwnessLeoXDfqVnMfd6Q==",
    databaseId: "Tasks",
    containerId: "Items",
    partitionKey: { kind: "Hash", paths: ["/category"] }
  };
  
  module.exports = config;