const {Admin} = require('../models/admin');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Secret = process.env.ADMIN_SECRET


router.get(`/`, async (req, res) =>{
    console.log('admin')
    const adminList = await Admin.find();  
    if(!adminList) {
        res.status(500).json({success: false})
    } 
    res.send(adminList);
})



router.post("/login", async (req, res) => {
    console.log(req.body.email);
    const admin = await Admin.findOne({ phone: req.body.phone });
    if (!admin) return res.status(400).send("No Admin Found");
  
    if(req.body.phone === admin.phone){
        const token = jwt.sign(
            {
              userId: admin.id,
              isAdmin: admin.isAdmin,
            },
            Secret,
            { expiresIn: "1w" }
          );
      
          res.status(200).json({ success: true, token: token });
    }
    else {
        res.status(400).send("Invalid Phone Number");
      }
   
    });




router.post('/register', async (req,res)=>{
    console.log('res',res)
    let admin = new Admin({
        phone: req.body.phone,
        customerType: req.body.customerType,
    })
    admin = await admin.save();

    if(!admin)
    return res.status(400).send('the admin cannot be created!')

    res.send(admin);
})


module.exports =router;