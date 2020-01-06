var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var localUserEventSchema = new Schema({
	user: { type: Number, ref: 'LocalUser' },
	timestamp: Date,
	entering: Boolean
});

localUserEventSchema.set('toJSON', {getters: true});

// Compile model from Schema
mongoose.model("LocalUserEvent", localUserEventSchema);