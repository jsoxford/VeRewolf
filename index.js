require('dotenv').config()

const Pusher = require('pusher');
const passport = require('passport')
const Redis = require('ioredis')
const Strategy = require('passport-twitter').Strategy
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')


const redis = new Redis(process.env.REDIS_URL)
const express = require('express')
const app = express()

app.use(express.static('public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  encrypted: true
})

app.locals.pusher_config = {
  KEY: process.env.PUSHER_KEY,
  APP_ID: process.env.PUSHER_APP_ID,
  CLUSTER: process.env.PUSHER_CLUSTER,
}

// app.locals.PUSHER_CLU = process.env.PUSHER_CLU

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


app.post('/pusher/auth',  (req, res) => {

  if(!req.user) {
    return res.send(403)
  }



  console.log("USER", req.user)

  const socketId = req.body.socket_id
  const channel = req.body.channel_name

  const data = {
    user_id: req.user.id,
    user_info: {
      id: req.user.id,
      name: req.user._json.name,
      image: req.user._json.profile_image_url,
      color: req.user._json.profile_background_color
    }
  }

  const auth = pusher.authenticate(socketId, channel, data)

  res.send(auth)
})


app.get('/current', (req, res) => res.send(req.user || {user:'none'}))

app.get('/', (req, res) => res.render('home', {
  user: req.user
}))

var gamedata = []

app.post('/', (req, res) => {

  console.log("START GAME", req.body)
  gamedata = req.body.map(function (user, i) {
    return {
      id: user.id,
      
      image: user.image,
      color: '#' + user.color,
      role: i == 0 ? 'wolf' : 'villager'
    }
  })

  pusher.get({ path: '/channels/presence-lounge/users' }, function(error, request, response) {
    if (response.statusCode === 200) {
        var result = JSON.parse(response.body)
        console.log(result)
    }
  })

  pusher.trigger('presence-lounge', 'start-game', {})

  res.send("OK")
})

app.get('/play', (req, res) => res.render('play', {
  user: req.user,
  game: [
  {
    "image": "/avatar/wolf.jpg",
    "name": "Max",
    "role": "wolf",
    "color": "#0f8"
  },
  {
    "image": "/avatar/tiger.png",
    "name": "Ben",
    "role": "villager",
    "color": "#fc0",
    "current": true
  },
  {
    "image": "/avatar/tiger.png",
    "name": "Ruth",
    "role": "villager",
    "color": "#0cf"
  },
  {
    "image": "/avatar/tiger.png",
    "name": "Pete",
    "role": "villager",
    "color": "#f0c"
  },
  {
    "image": "/avatar/wolf.jpg",
    "name": "Max",
    "role": "wolf",
    "color": "#0f8"
  },
  {
    "image": "/avatar/tiger.png",
    "name": "Ben",
    "role": "villager",
    "color": "#fc0"
  },
  {
    "image": "/avatar/tiger.png",
    "name": "Ruth",
    "role": "villager",
    "color": "#0cf"
  }
]

}))

app.listen(process.env.PORT || 3000)
