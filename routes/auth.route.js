const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const User = require('../models/user.model');
const {authSchema} = require('../helpers/validation_schema');
const {signAccessToken} = require('../helpers/jwt_helper');


router.post('/register', async (req, res, next) => {
    try {
        // const {email, password} = req.body;
        // if (!email || !password) throw createError.BadRequest()
        const result = await authSchema.validateAsync(req.body);
        
        const {email, password} = result;

        const doesExist = await User.findOne({email})

        if (doesExist) throw createError.Conflict(`${email} is already registered`);

        const user = new User({email, password})
        const saveUser = await user.save();

        const accesToken = await signAccessToken(saveUser.id)
        res.send({accesToken})

    } catch (error) {
        if (error.isJoi === true) error.status = 422; 

        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const {email, password} = result

        const user = await User.findOne({email})
        if (!user) throw createError.NotFound("User Not Register")

        const isMatch = await user.isValidPassword(password)
        if (!isMatch) throw createError.Unauthorized('Username/Password is invalid');

        const accesToken = await signAccessToken(user.id)
        res.send({accesToken})
    } catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest('Invalid Username/Password'))
        next(error)        
    }
})

router.post('/refesh-token', async (req, res, next) => {
    res.send('refesh token route!')
})

router.delete('/logout', async (req, res, next) => {
    res.send('logout route!')
})


module.exports = router