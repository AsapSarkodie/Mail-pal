import jwt from 'jsonwebtoken';

function verifyCookie(req, res, next) {
    //check if middleware was accessed
    console.log('cookie middleware accessed');

    //check if the browswer header has a cookie
    const token = req.cookies?.token;
    //if not return the client back to the signin page
      if(!token) return res.redirect("/auth/signin")
    try {
    
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    console.log('cookies:', req.cookies);   // temporary debug line
    return next()
    } catch (error) {
        console.log(`error: ${error}`);
        res.clearCookie('token');
      return  res.redirect('/auth/signin')
    }
}

export {verifyCookie}