const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(null, title, imageUrl, price, description);
  product.save().then(()=> {
    res.redirect("/");

  }).catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.id;
  Product.findById(prodId).then(([rows, fieldData]) => {
    res.render("admin/edit-product", {
      product: rows[0],
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true
    });
  }).catch( err => {
    console.log(err);
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body;
  
  const updatedProduct = new Product(id, title, imageUrl, price, description);
  updatedProduct.save();
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      hasProducts: products.length > 0,
      activeShop: true,
      productCss: true,
    });
  });
};


exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.delete(productId);
  res.redirect("/admin/products");
};