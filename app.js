const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');

require('dotenv').config();
require('./helpers/init_mongodb');

const AuthRoute = require('./routes/auth.route');

const app = express();

app.use(morgan('dev'))
app.get('/', async (req, res, next) => {
    res.send("Hello from mourinho")
})
app.use('/auth', AuthRoute)
app.use( (req, res, next) => {
    // const error = new Error("Not found");
    // error.status = 404
    // next(error);
    next(createError.NotFound('This route does not exist'))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listen on port: ${PORT}`);
})