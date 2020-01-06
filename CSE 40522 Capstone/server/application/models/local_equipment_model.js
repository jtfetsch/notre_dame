var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var localEquipmentSchema = new Schema({
	_id: String,
	description: String
});

localEquipmentSchema.virtual('name').get(function () {
	return this._id;
}).set(function (value) {
	this._id = value;
});

localEquipmentSchema.set('toJSON', {getters: true});

// Compile model from Schema
mongoose.model("LocalEquipment", localEquipmentSchema);
