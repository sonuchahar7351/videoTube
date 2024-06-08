const asyncHandler=(requestHandler)=>{
   (req,res,next)=>{
      Promise.resolve(requestHandler(req,res,next)).catch((err)=>{next(err)})
   }
}

module.exports=asyncHandler;

/* const asynceHandler=(fn)=> async (req,res,next)=>{
      try {
            await fn(req,res,next)
      } catch (error) {
           res.status(err.code || 400).json({
           success:false,
           message:err.message
           }
           ) 
      }
      } 
*/