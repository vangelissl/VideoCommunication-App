import express from 'express'
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
	res.render('login', {
		title: 'Log in',
		email: null,
		password: null,
		errors: null,
	});
});

router.post('/login', (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	console.log(email);
	console.log(password);

	res.render('login', {
		title: 'Login',
		email: null,
		password: password,
		errors: null,
	});
})

router.get('/register', (req, res, next) => {
	res.render('register', {
		title: 'Register',
		errors: null
	});
});

router.post('/register', (req, res, next) => {
	console.log(req.body.username);
	console.log(req.body.email);
	console.log(req.body.firstName);
	console.log(req.body.lastName);
	console.log(req.body.password);
	console.log(req.body.confirmPassword);

	res.render('register', {
		title: "Register",
		errors: null,
	});
});

export default router;