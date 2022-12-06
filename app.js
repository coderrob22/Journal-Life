const path = require('path')
const express = require('express')
const dotenv= require('dotenv')
const morgan= require('morgan')
const exphbs = require('express-handlebars')
const passport= require('passport')
const methodOverride= require('method-override')
const session= require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')


//Load config
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

//Calling the apps
connectDB()

const app= express()

//body Parser--middleware
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//Methodd Override
app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body ==='object' && '_method' in req.body){
        let method =req.body._method
        delete req.body._method
        return method
    }
}))

//Logging with morgan
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//Handlebars 
app.engine('.hbs', exphbs.engine({
    helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select,
    },
    defaultLayout: 'main',
    extname: '.hbs'
}
));
app.set('view engine', '.hbs');
//app.set('views', './views');

//Sessions middleware
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        })
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//set globa var
app.use(function(req, res, next){
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))


//routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT= process.env.PORT || 8500


app.listen(PORT, console.log(`Server running on ${process.env.NODE_ENV} mode on PORT ${PORT}`)) 