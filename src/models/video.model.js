const mongoose=require('mongoose');
const mongooseAggregatePaginate=require('mongoose-aggregate-paginate-v2');
const schema=mongoose.Schema;
const videoSchema=new mongoose.Schema({
     videoFile:{
        type:String,
        required:true
     },
     thumbnail:{
      type:String,
      require:true,

     },
     title:{
      type:String,
      required:true
     },
     description:{
      type:String,
      required:true
     },
     duration:{
      type:Number,
      required:true
     },
     views:{
      type:Number,
      default: 0
     },
     isPublished:{
      type:Boolean,
      default:true
     },
     owener:{
      type:schema.Types.ObjectId,
      ref:"User"
     }
},
{
      timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)

const Video=mongoose.model("Video",videoSchema);
module.exports=Video;