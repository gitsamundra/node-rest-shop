const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../../models/order');
const Product = require('../../models/product');
const checkAuth = require('../../middleware/check-auth');

// =====GET ROUTES======
router.get('/', checkAuth, (req, res) => {
  Order.find()
    .populate('product', 'name')
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return{
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity
          }
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:orderID', checkAuth, (req, res) => {
  const id = req.params.orderID;
  Order.findById(id)
    .exec()
    .then(order => {
      if(!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }
      res.status(200).json({
        order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' 
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// ====POST ROUTES=======
router.post('/', checkAuth, (req, res) => {
  Product.findById(req.body.productID)
    .then(product => {
      if(!product) {
        res.status(404).json({
          message: 'Product not found'
        });
      }
      const order = new Order({
       _id: mongoose.Types.ObjectId(),
       quantity: req.body.quantity,
       product: req.body.productID
     });
     return order.save();
    })
    .then(newOrder => {
      res.status(201).json({
        message: 'Order stored',
        newOrder: {
          productID: newOrder.product,
          quantity: newOrder.quantity
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Product not found.',
        error: err
      });
    });
});

router.patch('/:orderID', (req, res) => {

});

router.delete('/:orderID', checkAuth, (req, res) => {
  Order.deleteOne({_id: req.params.orderID})
    .exec()
    .then(result => {
      if(!result) {
        res.status(404).json({
          message: 'Order not found'
        });
      }
      res.status(200).json({
        message: 'Order deleted'
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    });
});

module.exports = router;