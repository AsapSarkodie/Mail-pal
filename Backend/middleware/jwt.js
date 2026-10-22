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
    console.log(req.user);

    return next()
    } catch (error) {
        console.log(`error: ${error}`);
        res.clearCookie('token');
      return  res.redirect('/auth/signin')
    }
}


//verify cookie for the id
function accessIdFromCookie(req, res, next) {
  
  const token = req.cookies?.token;

  if (!token) {
    return res.status(404).json({message: `NO COOKIE DETECTED`})
  }
  try {
     const user = jwt.verify(token, process.env.JWT_SECRET);

  //attach it to the request object
  req.user = user;
  console.log(req.user);
  
  
  next()
  } catch (error) {
    console.log(error);
    throw error
  }
 
};

export {verifyCookie, accessIdFromCookie}
