var mongoose = require('mongoose')
, Schema = mongoose.Schema;

// Define Schema
var localEquipmentEventSchema = new Schema({
	user: { type: Number, ref: 'LocalUser' },
	name: { type: String, ref: 'LocalEquipment'},
	timestamp: Date,
	running: Boolean,
  problems: Boolean,
  shutdowns: Boolean
});

localEquipmentEventSchema.set('toJSON', {getters: true});

// Compile model from Schema
mongoose.model("LocalEquipmentEvent", localEquipmentEventSchema);
