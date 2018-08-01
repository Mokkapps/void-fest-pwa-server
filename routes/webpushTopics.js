const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

// Subscribes registration tokens to the topic
router.post('/:name/subscribe', (req, res) => {
  const registrationToken = req.body.token;
  const topicName = req.params.name;

  admin
    .messaging()
    .subscribeToTopic(registrationToken, topicName)
    .then(function(response) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log(
        `Successfully subscribed to topic "${topicName}" :`,
        response
      );
      res
        .status(200)
        .send(
          `Successfully subscribed to topic "${topicName}": ${JSON.stringify(
            response
          )}`
        );
    })
    .catch(function(error) {
      console.error(`Error subscribing to topic "${topicName}":`, error);
      res
        .status(400)
        .send(
          `Error subscribing to topic "${topicName}": ${JSON.stringify(error)}`
        );
    });
});

// Unsubscribe registration tokens from the topic
router.post('/:name/unsubscribe', (req, res) => {
  const registrationToken = req.body.token;
  const topicName = req.params.name;
  admin
    .messaging()
    .unsubscribeFromTopic(registrationToken, topicName)
    .then(function(response) {
      // See the MessagingTopicManagementResponse reference documentation
      // for the contents of response.
      console.log(
        `Successfully unsubscribed from topic "${topicName}":`,
        response
      );
      res
        .status(200)
        .send(
          `Successfully unsubscribed from topic "${topicName}": ${JSON.stringify(
            response
          )}`
        );
    })
    .catch(function(error) {
      console.error(`Error unsubscribing from topic "${topicName}":`, error);
      res
        .status(400)
        .send(
          `Error unsubscribing from topic "${topicName}": ${JSON.stringify(
            error
          )}`
        );
    });
});

// Send a message to devices subscribed to the provided topic.
router.post('/:name/send', (req, res) => {
  const topicName = req.params.name;
  const messageData = req.body.data;
  const message = {
    data: messageData,
    topic: topicName
  };
  console.log('message to send', message);

  admin
    .messaging()
    .send(message)
    .then(response => {
      // Response is a message ID string.
      console.log(
        `Successfully sent message to topic "${topicName}":`,
        response
      );
      res
        .status(200)
        .send(`Successfully sent message: ${JSON.stringify(response)}`);
    })
    .catch(error => {
      console.error('Error sending message:', error);
      res
        .status(400)
        .send(
          `Error sending message to topic "${topicName}": ${JSON.stringify(
            error
          )}`
        );
    });
});

module.exports = router;
