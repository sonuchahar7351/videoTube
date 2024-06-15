const mongoose=require('mongoose');
const {Schema}=mongoose;
const subscriptionSchema=new mongoose.Schema({

    subscriber:{
       tpes:Schema.Types.ObjectId,  //one who subscribint 
       ref:"User"
    },
    channel:{
      type:Schema.Types.ObjectId,
      ref:"User" // one to whom subscriber is subscribing
    }

},{timestamps:true})


const Subscription=mongoose.model("Subscription",subscriptionSchema);
module.exports=Subscription;