import {asynchandler} from '../utils/asynchandler.js';
import jwt from 'jsonwebtoken';
import {User} from '../models/user.models.js';
import { apiError } from '../utils/apierror';
export const verifyJWT = asynchandler(async(req, /*res*/ _, next)=>{
    try {
        const TokenMiddle = req.cookies?.AccessToken || req.headers("authorization")?.replace("Bearer ", "")
        if(!TokenMiddle){
            throw new apiError(401, "Access Denied, No Token Provided");
        }
    
        const decodedToken = jwt.verify(TokenMiddle, process.env.ACCESS_TOKEN_SECRECT)
    
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
    
        if (!user) {
            
            throw new apiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Access Token")
    }

})

