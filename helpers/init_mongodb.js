const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017', {dbName: 'auth_tutorial'})
.then(()=>{
    console.log('db connected');
})
.catch((err) => {
    console.log(err.message);
})