var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
	username: String,
  msg: String,
  room: { type: Schema.Types.ObjectId, ref: 'Rooms' },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Messages', MessageSchema);
