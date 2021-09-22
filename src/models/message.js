const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		tel: {
			type: String,
			required: true,
		},
		service: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

//enable or disable comment
const Message = mongoose.model('Message', messageSchema);
module.exports = { Message };
