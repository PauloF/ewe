/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var sample = require('./sample.model');

exports.register = function(socket) {
  sample.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  sample.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('sample:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('sample:remove', doc);
}