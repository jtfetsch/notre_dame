var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

// Define Schema
var localUserSchema = new Schema({
	_id: Number,
	firstName: String,
	lastName: String,
	netid: String,
	lastActivity: { type: Date, default: new Date(0) },
	isInRoom: { type: Boolean, default: false }
}, { id: false });

localUserSchema.virtual('badge').get(function () {
	return this._id;
}).set(function (value) {
	this._id = value;
});

localUserSchema.set('toJSON', { getters: true });

// Compile model from Schema
mongoose.model("LocalUser", localUserSchema);
