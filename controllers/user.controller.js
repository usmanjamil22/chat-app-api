const User = require("../models").user;

exports.allAccess = (req, res) => {
  User.find({_id: {$nin: req.userId}})
    .select('_id email username')
    .exec((err, users) => {
      if (err) res.status(500).send({message: "Internal Server Error"});

      res.status(200).send({
        success: true,
        message: "Data retrieved",
        data: users
      });
    });
};

exports.userBoard = (req, res) => {
  User.findById(req.userId, "-password -__v").exec((err, user) => {
    if (err) res.status(500).send({message: "Internal Server Error"});

    res.status(200).send({
      success: true,
      message: "Data retrieved",
      data: user
    });
  });
};
