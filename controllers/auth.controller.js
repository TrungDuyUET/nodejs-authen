const createError = require('http-errors');
const User = require('../models/user.model');
const {authSchema} = require('../helpers/validation_schema');

const client = require('../helpers/init_redis');
const {signAccessToken, 
    signRefreshToken, 
    verifyRefreshToken, 
    verifyAccessToken} = require('../helpers/jwt_helper');

module.exports = {
    register: async (req, res, next) => {
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
            const refreshToken = await signRefreshToken(saveUser.id)
            res.send({accesToken, refreshToken})
    
        } catch (error) {
            if (error.isJoi === true) error.status = 422; 
    
            next(error)
        }
    },

    login : async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)
            const {email, password} = result
    
            const user = await User.findOne({email})
            if (!user) throw createError.NotFound("User Not Register")
    
            const isMatch = await user.isValidPassword(password)
            if (!isMatch) throw createError.Unauthorized('Username/Password is invalid');
    
            const accesToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
    
            res.send({accesToken, refreshToken})
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest('Invalid Username/Password'))
            next(error)        
        }
    },

    refreshToken : async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken);
    
            const accesToken = await signAccessToken(userId);
            const refToken = await signRefreshToken(userId);
    
            res.send({accesToken : accesToken, refreshToken: refToken});
    
        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        try {
            const {refreshToken} = req.body
            if (!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken);
            client.DEL(userId, (err, val) => {
                if(err){
                    console.log(err.message);
                    throw createError.InternalServerError();
                }
                console.log(val);
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    }

}