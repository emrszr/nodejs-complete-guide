const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows, fieldData])=> {
    res.render("shop/product-list", {
      prods: rows,
      pageTitle: "All Products",
      path: "/products",
      hasProducts: rows.length > 0,
      activeShop: true,
      productCss: true,
    });
    
  }).catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.id;
  Product.findById(prodId).then(([product]) => {
    res.render("shop/product-detail", {
      product: product[0],
      path: "/products",
      pageTitle: product.title,
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([rows, fieldData]) => {
    res.render("shop/index", {
      prods: rows,
      pageTitle: "Shop",
      path: "/",
      
    });
  }).catch( err => {
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll().then(([rows, fieldData]) => {
      const cartProducts = [];
      for (var product of rows) {
        const cartProductData = cart.products.find(pd => pd.id === product.id);
        if (cartProductData) {
          cartProducts.push({productData: product, qty: cartProductData.qty});
        }
      }
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: cartProducts,
      });
    }).catch( err => {
      console.log(err);
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(([product]) => {
    Cart.addProduct(prodId, product[0].price);
  }).catch(err=> {
    console.log(err);
  });

  res.redirect("/cart");
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.body.productId;  
  console.log("prodId", prodId);
  
  Product.findById(prodId).then(([product]) => {
    Cart.deleteProduct(prodId, product[0].price);
  }).catch(err => {
    console.log(err);
  });
  res.redirect("/cart");
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};
