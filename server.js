/* eslint-disable */
const mongoose = require('mongoose');
const dotenv =require ('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app')



const DB  = process.env.DATABASE.replace(
'<PASSWORD>',
process.env.DATABASE_PASSWORD
);


mongoose.connect(DB, {
useNewUrlParser:true,
useCreateIndex:true,
useFindAndModify:false
})
.then(()=>console.log('DB connection successful !'))



 
// * Environmental Variables * global variables that are used to define the enviroment  in which node app is running 
//console.log(process.env); 
 
const port = process.env.PORT  || 3000;

const server = app.listen(port , ()=> {
    console.log(`app runing on port ${port}....`);
});




//Maher

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLER RAJECTION!  Shutting Down ....');
    server.close( () => {
         process.exit(1);
    });
 });