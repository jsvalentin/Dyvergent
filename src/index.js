const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { Message } = require('./models/message');
const { makeid } = require('./helpers/utility');
const app = express();
const {
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_IP,
	MONGO_PORT,
	REDIS_URL,
	REDIS_PORT,
	SESSION_SECRET,
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
} = require('./config/config');
const redis = require('redis').createClient({
	host: REDIS_URL,
	port: REDIS_PORT,
});

const DATABASE_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/dyvergent?authSource=admin`;
mongoose.connect(DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

//Port
const port = process.env.PORT || 3000;

//?-------Middleware---------------
//? register view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('src/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({}));
app.enable('trust proxy');

//?----------------------------

app.get('/', (req, res) => {
	res.render('pages/index', {});
});

app.get('/contact', (req, res) => {
	res.render('pages/contact', { message: '' });
});

app.get('/verify/:code', async (req, res) => {
	const { code } = req.params;
	redis.get(code, async (err, data) => {
		if (data == null) {
			return res.status(404).json({ Error: 'Invalid code' });
		}
		// reply is null when the key is missing
		console.log(data);
		const { name, email, tel, service, message } = JSON.parse(data);

		try {
			const clientMessage = await Message.create(JSON.parse(data));
			console.log(clientMessage);
			// const numbersToMessage = [`+1${tel}`];
			const numbersToMessage = ['+19417876513'];
			// const numbersToMessage = ['+19417876513', '+12392227085'];
			numbersToMessage.forEach(async (number) => {
				const sms = await client.messages
					.create({
						body: `Client Name: ${name}\nEmail: ${email}\nPhone Number: ${tel}\nJob: ${service}\nMessage: ${message}`,
						to: number,
						messagingServiceSid: 'MGaee59fa4e611d95d5b5f16e2cc4c57bf',
					})
					.then((msg) => console.log(msg.sid))
					.done();
			});
			redis.del(code, (err) => {
				if (err) return res.status(404).json({ err: err });
				console.log('Deleted');
			});

			res.render('pages/contact', {
				message: `Thank you, One of our team members will be contacting you shortly.`,
			});
		} catch (error) {
			res.render('pages/contact', {
				message: `Unable to submit the form, Please try again.`,
			});
		}
	});
});

app.post('/verify', async (req, res) => {
	const { name, email, tel, service, message } = req.body;
	const countTel = tel.trim().replace(/[^0-9]/g, '').length;
	const cleanTel = tel.trim().replace(/[^0-9]/g, '');
	if (countTel != 10) return res.status(404).json({ error: 'Invalid Number' });

	const code = makeid(6);
	const payload = {
		name: name,
		email: email,
		tel: tel,
		service: service,
		message: message,
	};

	//save temp key in memory with contact form information
	redis.setex(code, 60 * 60 * 2, JSON.stringify(payload), (err) => {
		console.log(err);
	});

	//Send Text SMS to client to emsure they are human
	const numbersToMessage = [`+1${cleanTel}`];
	try {
		numbersToMessage.forEach(async (number) => {
			const sms = await client.messages
				.create({
					body: `Click on this temperary link\nin order to submit your contact form\nhttp://dyvergentsecurity.com/verify/${code}`,
					to: number,
					messagingServiceSid: 'MGaee59fa4e611d95d5b5f16e2cc4c57bf',
				})
				.then((msg) => console.log(msg.sid))
				.done();
		});
		return res.json({ status: 'ok' });
	} catch (error) {
		return res.json({ error: error });
	}
});

app.post('/contact', async (req, res) => {
	const { name, email, tel, service, message } = req.body;
	const countTel = tel.trim().replace(/[^0-9]/g, '').length;
	const cleanTel = tel.trim().replace(/[^0-9]/g, '');
	if (countTel != 10) return res.status(404).json({ error: 'Invalid Number' });

	const code = makeid(6);
	const payload = {
		name: name,
		email: email,
		tel: tel,
		service: service,
		message: message,
	};

	//save temp key in memory with contact form information
	redis.setex(code, 60 * 60 * 2, JSON.stringify(payload), (err) => {
		console.log(err);
	});

	//Send Text SMS to client to emsure they are human
	const numbersToMessage = [`+1${cleanTel}`];
	try {
		numbersToMessage.forEach(async (number) => {
			const sms = await client.messages
				.create({
					body: `Click on this temperary link\nin order to submit your contact form\nhttp://dyvergentsecurity.com/verify/${code}`,
					to: number,
					messagingServiceSid: 'MGaee59fa4e611d95d5b5f16e2cc4c57bf',
				})
				.then((msg) => console.log(msg.sid))
				.done();
		});
		res.render('pages/contact', {
			message: `In order to proceed on submitting the contact form, 
				We need to check that your not a robot!  
				Please open the confirmation link that was sent to your phone number.`,
		});
	} catch (error) {
		res.status(404).render('pages/contact', {
			message: 'Unable to get your request, Please try again later.',
		});
	}
});

app.get('/services', (req, res) => {
	res.render('pages/services', {});
});

app.get('/company', (req, res) => {
	res.render('pages/company', {});
});

app.get('/admin/inbox', async (req, res) => {
	try {
		const messages = await Message.find({});
		if (messages.length <= 0) throw new Error('There is no messages avaliable');
		res.render('pages/message', { messages: messages });
	} catch (error) {
		res.status(404).json({ Message: error.message });
	}
});

app.get('/admin/api/delete/:id', async (req, res) => {
	try {
		const message = await Message.findByIdAndDelete({ _id: req.params.id });
		if (message == null) return res.status(404).redirect('../../inbox');
		console.log(message);
		return res.status(200).redirect('../../inbox');
	} catch (error) {
		res.status(404).json({ Message: 'Contact your Admin' });
	}
});

app.get('/:*', (req, res) => {
	res.status(404).json({ status: 'failed', message: 'page not found' });
});

//Listening app
app.listen(port, () => {
	console.log(`listening on ${port}`);
});
