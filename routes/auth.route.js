const express = require('express');
const router = express.Router();

router.post('/register', async (req, res, next) => {
    res.send('Register route!')
})

router.post('/login', async (req, res, next) => {
    res.send('login route!')
})

router.post('/refesh-token', async (req, res, next) => {
    res.send('refesh token route!')
})

router.delete('/logout', async (req, res, next) => {
    res.send('logout route!')
})


module.exports = router