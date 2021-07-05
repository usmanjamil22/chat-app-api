const User = require("../models").user;
const Chat = require("../models").chat;
const {startChat, sendMessage, createGroupChat, joinGroupChat} = require('../lib/chat.lib')

exports.startChat = (req, res) => {
  const {targetUserId} = req.body;

  startChat(req.userId, targetUserId).then(({data, message}) => {
    res.status(200).send({
      success: true,
      message,
      data
    })
  }).catch(reason => {
    res.status(reason.status).send({
      success: false,
      message: reason.message
    });
  });
};

exports.createGroupChat = (req, res) => {
  const {groupName} = req.body;

  createGroupChat(groupName, req.userId)
    .then(response => {
      if (response) {
        res.status(200).send({
          status: true,
          message: response.message,
          data: response.data
        })
      }
    })
    .catch(reason => {
      res.status(reason.status).send({
        status: false,
        message: reason.message
      })
    });
}

exports.joinGroupChat = (req, res) => {
  const {chatId} = req.body;

  joinGroupChat(chatId, req.userId)
    .then(response => {
      if (response) {
        res.status(200).send({
          status: true,
          message: response.message,
          data: response.data
        })
      }
    })
    .catch(reason => {
      res.status(200).send({
        status: false,
        message: reason.message
      })
    });
}

exports.sendMessage = (req, res) => {
  const {chatId, message} = req.body;

  sendMessage(chatId, req.userId, message).then(({message}) => {
    res.status(200).send({
      success: true,
      message
    })
  }).catch(reason => {
    res.status(reason.status).send({
      success: false,
      message: reason.message
    });
  });
};