require('dotenv').config()

const passport = require('passport')
const Redis = require('ioredis')
const Strategy = require('passport-twitter').Strategy
const session = require('express-session')
const RedisStore = require('connect-redis')(session)


const redis = new Redis(process.env.REDIS_URL)
const express = require('express')
const app = express()

app.use(express.static('public'))


app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

passport.use(new Strategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }))

// store whole thing in session
passport.serializeUser(function(user, cb) {
  cb(null, user);
})

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
})

var opts = {
  resave:false,
  saveUninitialized:true,
  store: new RedisStore({
    client: redis
  }),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  cookie: {path: '/', secure: false}
}

// for heroku proxying
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  opts.cookie.secure = true
}

app.use(session(opts));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/twitter', passport.authenticate('twitter'))

app.get('/auth/twitter/callback',
  passport.authenticate('twitter',
    { failureRedirect: '/login' }
  ),
  (req, res) => {
    res.redirect('/')
  })


app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/?logged-out')
})

app.get('/current', (req, res) => res.send(req.user || {user:'none'}))

app.get('/', (req, res) => res.render('home', {
  user: req.user
}))

app.listen(process.env.PORT || 3000)
