import express from "express"
import cors from "cors" 
// CORS is fully defined below the page , If you want to understand then scroll down!
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,

}));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes

import userRouter from "./routes/user.routes.js";
import likeRouter from "./routes/like.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import commentRouter from "./routes/comment.routes.js";



// Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboards", dashboardRouter);
app.use("/api/v1/comments", commentRouter);




export default app;











//--------------------------------CORS Define---------------------------------



/* CORS (Cross-Origin Resource Sharing) ek security system hai jo browser use karta hai.
Samajhne ka easy tareeqa:

Maan lo tumhari frontend website chal rahi hai http://abc.com pe.

Aur tum backend API call karna chahte ho http://xyz.com se.

👉 Ab dono ke domain alag hain (abc.com aur xyz.com), to browser seedha data lene nahi dega.
Ye hi restriction CORS kehlata hai.

-----------------Simply define yeh hai ke frontend ko whitelist mei dalne ke liye use hota------------
-----------------hai ke wo dusre domains se requests bhej sake.------------------------*/


//--------------------------------------------------------------------------------------------------------------------------------

//----------------------------MiddleWare---------------------------------
/* Middleware ek aisa function hai jo request aur response ke beech mei execute hota hai.
Yeh request ko modify kar sakta hai, response bhejne se pehle kuch operations kar sakta hai,
ya phir request ko next middleware ya route handler tak bhej sakta hai.

Express.js mei middleware ka use karke hum apne application ki functionality ko modular aur reusable bana sakte hain.
Yeh authentication, logging, error handling, etc. jaise tasks ke liye bahut useful hote hain.

In EasyWay , Middleware aik authentication method hai jo dekhta hai ke ap
data ko access karne se pehle kuch conditions fulfill karte hain ya nahi.
*/

