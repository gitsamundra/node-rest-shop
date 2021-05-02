const router = require('express').Router();
const Product = require('../../models/product');
const mongoose = require('mongoose');
const multer  = require('multer');
const checkAuth = require('../../middleware/check-auth');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if( file.mimetype ==='image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg')
    cb(null, true);
  else 
    cb(null, false);
};

const upload = multer({storage, limits: 
  {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

// =====GET ROUTES======
router.get('/', (req, res) => {
  Product.find()
    .select('name price productImage')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id 
            }
          }
        })
      }
      if(docs.length >= 0) {
        res.status(200).json(response);
      } else {
        res.status(404).json('Entry not found');
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:productID', (req, res) => {
  const id = req.params.productID;
  Product.findById(id)
    .exec()
    .then(doc => {
      if(doc) {
        res.status(200).json({
          doc: {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
          }
      });
      } else {
        res.status(404).json({message: 'No valid entry found.'});
      }
    })
    .catch(err => {
      res.status(500).json({
        message: err
      })
    });
});

// ====POST ROUTES=======
router.post('/', checkAuth, upload.single('productImage'),  (req, res) => {
  const { name, price } = req.body;
  const product = {
    _id: new mongoose.Types.ObjectId,
    name, price, 
    productImage: req.file.path
  }
  new Product(product)
    .save()
    .then(product => {
      res.status(201).json({
        message: 'Product item created', 
        newProduct: product
      });
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
});

router.patch('/:productID', checkAuth, (req, res) => {
  const id = req.params.productID;
  const {name, price} = req.body;
  // const updateOps = {};
  // for(const ops of req.body) {
  //   updateOps[ops.propName] = ops.value;
  // }
  Product.findByIdAndUpdate({_id: id}, {name, price})
    .exec()
    .then(result => {
      res.status(200).json({
        result: {
          type: 'GET',
          url: 'http://localhost:3000/products/' + result._id
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    })
});

router.delete('/:productID', checkAuth, (req, res) => {
  const id = req.params.productID;
  console.log(id);
  Product.deleteOne({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products/'
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    })
});

module.exports = router;