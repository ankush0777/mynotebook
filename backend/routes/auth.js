const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt=require('bcryptjs')
var jwt=require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser')
const JWT_SECRET = 'Harryisagoodb$oy';
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let sucess=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ sucess,errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({sucess, error: "sorry user with this email already exists" });
      }
      const salt= await bcrypt.genSalt(10);
      secPass= await bcrypt.hash(req.body.password,salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      //   .then(user => res.json(user))
      //   .catch(err=> {console.log(err)
      // res.json({error: 'Please enter a unique value for email', message: err.message})})
      const data={
        user:{
          id:user.id
        }
      }
      const authtoken=jwt.sign(data,JWT_SECRET);
      // console.log(jwtdata);
      // res.json(user);
      sucess=true;
      res.json({sucess,authtoken})
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error");
    }
  }
)
router.post(
  "/login",
  [
  
    body("email", "Enter a valid email").isEmail(),
    body("password", "password cannot be  blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password}=req.body;
    try{
   let user=await User.findOne({email});
   if(!user){
    return res.status(400).json({error:"invalid credentials"})
   }
   const passwordcompare=await bcrypt.compare(password,user.password);
   if(!passwordcompare){
    sucess=false
    return res.status(400).json({sucess,error:"invalid credentials"})
   }
   const data={
    user:{
      id:user.id
    }
  }
  const authtoken=jwt.sign(data,JWT_SECRET);
  sucess=true;
   res.json({sucess,authtoken})
    }
    catch(error){
      console.log(error.message);
      res.status(500).send("Internal error occured");
    }
  });
  router.post(
    "/getuser",fetchuser,async (req, res) => {

try {
  userId=req.user.id;
  const user=await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {

  console.log(error.message);
      res.status(500).send("Internal error occured");
}})
module.exports = router;
