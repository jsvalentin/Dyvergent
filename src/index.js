const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');
const { Message } = require('./models/message');
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

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient({
	host: REDIS_URL,
	port: REDIS_PORT,
});

// const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const ejs = require('ejs');
const app = express();

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
app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		secret: SESSION_SECRET,
		cookie: {
			secure: false,
			resave: false,
			saveUninitialized: false,
			httpOnly: true,
			maxAge: 60000,
		},
	})
);

//?----------------------------

const DATABASE_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/dyvergent?retryWrites=true&w=majority`;
mongoose.connect(DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.get('/', (req, res) => {
	// res.send('Welcome Home');
	res.render('pages/index', {});
});

app.get('/contact', (req, res) => {
	// res.send('Welcome Home');
	res.render('pages/contact', { message: '' });
});

app.post('/contact', async (req, res) => {
	const { name, email, tel, service, message } = req.body;
	try {
		const payload = {
			name: name,
			email: email,
			tel: tel,
			service: service,
			message: message,
		};
		const clientMessage = await Message.create(payload);
		console.log(clientMessage);
		// const numbersToMessage = ['+19417876513', '+12392227085'];
		// numbersToMessage.forEach(async (number) => {
		// 	const sms = await client.messages
		// 		.create({
		// 			body: `Client Name: ${name}\nEmail: ${email}\nPhone Number: ${tel}\nJob: ${service}\nMessage: ${message}`,
		// 			to: number,
		// 			messagingServiceSid: 'MGaee59fa4e611d95d5b5f16e2cc4c57bf',
		// 		})
		// 		.then((msg) => console.log(msg.sid))
		// 		.done();
		// });

		res.render('pages/contact', {
			message: 'Thank you! We will contact you as soon as possible.',
		});
	} catch (error) {
		console.log(error.message);
		res.status(404).render('pages/contact', {
			message: 'Unable to get your request, Please try again later.',
		});
	}
});

app.get('/services', (req, res) => {
	// res.send('Welcome Home');
	res.render('pages/services', {});
});

app.get('/company', (req, res) => {
	// res.send('Welcome Home');
	res.render('pages/company', {});
});

app.get('/admin/inbox', async (req, res) => {
	try {
		const messages = await Message.find({});
		res.render('pages/message', { messages: messages });
	} catch (error) {
		res.status(404).json({ Error: 'No Messages' });
	}
	// res.send('Welcome Home');
});

app.get('/:*', (req, res) => {
	res.status(404).json({ status: 'failed', message: 'page not found' });
});

//Listening app
app.listen(port, () => {
	console.log(`listening on ${port}`);
});
