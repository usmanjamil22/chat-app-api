const User = require("../models").user;
const Chat = require("../models").chat;

const startChat = (userId, targetUserId) => {
  return new Promise((resolve, reject) => {

    if (targetUserId === undefined || targetUserId === null || targetUserId.length === 0) {
      reject({
        status: 404,
        message: 'Target user not found',
      });
    }

    User.findById(targetUserId)
      .exec((err, user) => {
        if (err) {
          reject({
            status: 404,
            message: 'Target user not found',
          });
        }

        Chat.find({
          $or: [
            {
              users: [userId, targetUserId]
            },
            {
              users: [targetUserId, userId]
            },
          ]
        }).exec((err, chat) => {
          if (err) {
            reject({
              status: 500,
              message: 'Internal Server Error'
            })
          }

          if (chat.length === 0) {
            const newChat = new Chat({
              type: 'private',
              users: [userId, targetUserId],
              messages: [{
                sender: null,
                text: '--- Chat started ---'
              }]
            });

            newChat.save((err, chat) => {
              if (err) {
                reject({
                  status: 500,
                  message: err,
                })
              }

              resolve({
                message: "Chat created successfully!",
                data: chat
              })
            });
          } else {
            resolve({
              message: "Chat retrieved successfully!",
              data: chat[0]
            });
          }
        });
      });
  });
};

const sendMessage = (chatId, senderId, message) => {
  return new Promise((resolve, reject) => {

    if (message === undefined || message === null) {
      reject({
        status: 400,
        message: 'Message not found',
      });
    } else if (message.length === 0) {
      reject({
        status: 400,
        message: 'Cannot send blank message.',
      });
    }

    Chat.findById(chatId)
      .exec((err, chat) => {
        if (err) {
          reject({
            status: 404,
            message: 'Chat room not found',
          });
          return;
        }

        if (chat) {
          chat.messages.push({
            sender: senderId,
            text: message
          });

          chat.save((err, chat) => {
            if (err) {
              reject({
                status: 400,
                message: 'Unable to send message',
              });
              return;
            }

            resolve({
              status: 200,
              message: 'Message Sent successfully',
            });
          })
        }
      })
  });
}

const joinGroupChat = (chatId, userId) => {
  return new Promise((resolve, reject) => {
    Chat.findOne({
      _id: chatId,
      users: {$in: [userId]}
    }).exec((err, existingChat) => {
      if (err) reject({
        status: 404,
        message: "Chat group not found."
      });

      if (existingChat) {
        resolve({
          status: 202,
          message: 'Already part of chat',
          data: existingChat
        })
      } else {
        Chat.findOneAndUpdate(
          {_id: chatId},
          {$push: {users: userId}},
          {safe: true, upsert: true, new: true}
        ).exec((err, chat) => {
          if (err) reject({
            status: 400,
            message: 'Couldn\'t join group'
          });

          resolve({
            status: 200,
            message: 'Group chat successfully joined',
            data: chat
          })
        });
      }
    });
  });
}

const createGroupChat = (groupName, creatorId) => {
  return new Promise((resolve, reject) => {
    Chat.find({
      name: groupName
    }).exec((err, existingChat) => {
      if (err) reject({
        status: 500,
        message: 'Internal Server Error'
      });

      if (existingChat.length > 0) {
        resolve({
          status: 200,
          message: 'Room already exists',
          data: existingChat[0]
        });
      } else {
        const chat = new Chat({
          name: groupName,
          type: 'group',
          users: [creatorId],
          messages: [{
            sender: null,
            text: '--- Chat started ---'
          }]
        });

        chat.save((err, chat) => {
          if (err) reject({
            status: 400,
            message: 'Unable to create group chat.'
          });

          resolve({
            status: 200,
            message: "Group chat created successful",
            data: chat
          })
        });
      }
    });
  });
}

const isUserPartOfChat = (userId, chatId) => {
  return new Promise((resolve, reject) => {
    Chat.find({
      _id: chatId,
      users: {$in: [userId]}
    })
      .exec((err, chat) => {
        if (chat.length > 0) {
          resolve(true)
        }

        reject(false);
      });
  });
}

module.exports = {
  startChat,
  sendMessage,
  checkIfUserPartOfChat: isUserPartOfChat,
  createGroupChat,
  joinGroupChat
}