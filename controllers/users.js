import bcrypt from 'bcryptjs'; // encrypt passwords
import jwt from 'jsonwebtoken'; // keep user signed in on browser
import dotenv from 'dotenv';

import User from '../models/user.js';

dotenv.config();

const jwtSecret = (process.env.JWT_SECRET ? process.env.JWT_SECRET : 'development');

export const signin = async (req, res) => { 
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) { 
                return res.status(404).json( { message: "User does't exist" } );
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password); // compare hashed password

        if (!isPasswordCorrect) { 
            return res.status(400).json({ message: "Invalid password." });
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, jwtSecret, { expiresIn: "1h" });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong." }); // general server error
    }
}

export const signup = async (req, res) => { 
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) { 
            return res.status(400).json({ message: "An account with that email already exists." }); // client error - passwords don't match
        }

        if (password !== confirmPassword) { 
            return res.status(400).json({ message: "Passwords do not match." }); // client error - passwords don't match
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, jwtSecret, { expiresIn: "1h" }); 

        res.status(200).json({ result: newUser, token });

    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong." }); // general server error
    }
}
