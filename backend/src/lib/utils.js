
import jwt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
        const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '7d' 
    });

    res.cookie('jwt', token, {
        httpOnly: true, // preven xss attacks cross-site scripting attack prevention
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // CSRF attacks cross-site request forgery attack prevention
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'development'
    });
    return token;
}

// https http