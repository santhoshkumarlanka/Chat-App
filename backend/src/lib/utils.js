
import jwt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
    
    // jwt.sign() is used to create a JWT token. It takes a payload (in this case, an object containing the userId), a secret key (process.env.JWT_SECRET), and an options object that specifies the token's expiration time (7 days in this case).
    const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '7d' 
    });



    // res.cookie() is used to set a cookie named 'jwt' with the generated token as its value. The cookie is configured with several options to enhance security:

    res.cookie('jwt', token, {
        httpOnly: true, 
        // prevent xss attacks, cross-site scripting attack prevention. This prevents JavaScript running in the browser from reading the cookie.
        // Note: without it console.log(document.cookie); might output your document.cokkie. If an attacker injects malicious JavaScript(an XSS attack), they would steal your JWT. with httpOnly:true the browser blocks javascript from accessing the cookie only the browser automatically sends it to your server.

        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict', // CSRF attacks cross-site request forgery attack prevention
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return token;
}

// https http