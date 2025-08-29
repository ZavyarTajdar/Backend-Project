const asynchanddler = (requestHandeler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandeler(req,res,next))
        .catch((error)=>{
            res.status(error.status || 404).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        });
    }
}

export { asynchanddler }


// const asynchandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.status || 404).json({
//             success: false,
//             message: error.message || "Internal Server Error"
//         });
//     }
// }