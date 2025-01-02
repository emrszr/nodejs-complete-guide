const db = require('../util/database');

const Cart = require("./cart");

module.exports = class Product {
  constructor(id, title, imageUrl, price, description ) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
   return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', [this.title, this.price, this.description, this.imageUrl]);
  }

  static delete(id) {
    return db.execute('DELETE FROM products WHERE products.id =?', [id])
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products')
  }
  
  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
