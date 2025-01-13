const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://node-shop:node-shop@node-rest-shop.dnhdu.mongodb.net/?retryWrites=true&w=majority&appName=node-rest-shop"
  )
    .then(client => {
      console.log("connected");
      callback(client);
      _db = client.db();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};


const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'no database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb =  getDb;
