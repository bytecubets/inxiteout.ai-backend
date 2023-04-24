const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  if(req.body && req.body.email) {
    const user = await User.findOne({ email: req.body.email });
    if(user){
      return res.status(400).json({response:"Account with Same Email address already exist!"});
    }
  }
  if(req.body && req.body.username){
    const username = await User.findOne({ username: req.body.username });
    if(username){
      return res.status(400).json({response:"Username already exist!"});
    }
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  console.log('tried logging in')
  console.log(req.body)
  if(req.body && !req.body.username && !req.body.password) {
    return res.status(400).json({response:"Please check the credentials!"});
  }
  try {
    // VALIDATE USERNAME
    const user = await User.findOne({ username: req.body.username });
    console.log('user exists or not-',user)
    if(!user){
      return res.status(400).json({response:"Username does not exist!"});
    } 
    // VALIDATE PASSWORD
    const validated = await bcrypt.compare(req.body.password, user.password);
      console.log('password validation-',validated)
      if(!validated){
        return res.status(400).json({response:"Please check the password!"});
      } 

    // LOGIN SUCCESS
    const { password, ...others } = user._doc;
    console.log('user',user)
    // Create token
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "4h",
      }
    );
    console.log('token',token)
    
    // save user token
    others.token = token;
    console.log('others',others)
    return res.status(200).json(others);
    
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
