var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define Schema
var localNewsSchema = new Schema({
	title: String,
	author: String,
	datePublished: Date,
	content: String,
	level: String
});

localNewsSchema.set('toJSON', { getters: true });

// Compile model from Schema
mongoose.model("LocalNews", localNewsSchema);