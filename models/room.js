var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new mongoose.Schema({
room: String,
message: { type: Schema.Types.ObjectId, ref: 'Messages' },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rooms', roomSchema);