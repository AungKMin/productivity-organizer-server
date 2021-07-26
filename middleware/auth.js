import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET : 'development';

const auth = async (req, res, next) => { 
    try {

        if (!req.headers.authorization) { 
            return next();
        }
        
        const token = req.headers.authorization.split(" ")[1];
        const isCustomAuth = token.length < 500;

        let decodedData;

        if (token && isCustomAuth) { 
            decodedData = jwt.verify(token, jwtSecret);

            req.userId = decodedData?.id;
        } else { 
            decodedData = jwt.decode(token);

            req.userId = decodedData?.sub; // sub differentiates google users
        }

        next();
    } catch (error) {
        console.log(error);
    }
}

export default auth;