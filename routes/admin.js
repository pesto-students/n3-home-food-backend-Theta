const {Admin} = require('../models/admin');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) =>{
    console.log('till seller')
    const adminList = await Admin.find();  
    if(!adminList) {
        res.status(500).json({success: false})
    } 
    res.send(adminList);
})

router.post('/register', async (req,res)=>{
    console.log('res',res)
    let admin = new Admin({
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    admin = await admin.save();

    if(!admin)
    return res.status(400).send('the admin cannot be created!')

    res.send(admin);
})


module.exports =router;