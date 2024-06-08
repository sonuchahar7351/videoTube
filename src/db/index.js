const mongoose=require('mongoose');
const {DB_NAME}=require('../constants.js');
const MONGO_URI=process.env.MONGO_URI;

const connectDB=async ()=>{
      try {
            await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
             console.log("Database connected successfully");
            
      } catch (error) {
            console.log("monogDB connection error ", error);
            process.exit(1)
      }
}


module.exports= connectDB;
 
