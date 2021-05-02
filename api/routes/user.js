const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

// ======POST ROUTE=====
router.post('/signup', (req, res) => {
  const {email, password } = req.body;
  User.find({email})
    .exec()
    .then(user => {
      if(user.length >= 1)
        return res.status(409).json({
          message: "Email exists"
        });
      else 
        new User({
          _id: new mongoose.Types.ObjectId,
          email, password
        })
          .save()
          .then(newUser => {
            const token = jwt.sign({id: newUser._id, email}, 'super secret', {expiresIn: '1h'})
            res.status(201).json({
              message: 'New user is created.',
              newUser: {
                _id: newUser._id,
                email: newUser.email,
                token
              }
            });
          })
          .catch(err => {
            res.status(500).json({
              error: err.message
            });
          });
        
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    });
});

router.post('/login', (req, res) => {
  const {email, password } = req.body;
  User.findOne({email})
    .then(user => {
      if(user.length < 1) {
        res.status(404).json({
          message: 'Email not found, user doesn\'t exist'
        });
      } else {
        user.comparePassword(password, (err, isMatch) => {
          if(!isMatch) {
            res.status(401).json({
              err,
              isMatch
            });
          } else {
            const token = jwt.sign({
              userID: user._id,
              email: user.email
            }, 
            'super secret',
            {
              expiresIn: '1h'
            });

            res.status(200).json({
              message: 'Authetication successful',
              token,
              isMatch
            });
          }
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    });
});

router.delete('/:userID', (req, res) => {
  const id = req.params.userID;
  User.deleteOne({_id: id})
    .then(res.status(200).json({
      message: 'User deleted'
    }))
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    })
});

router.post('/login', (req, res) => {

});

module.exports = router;