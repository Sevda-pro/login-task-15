const express=require("express")
const path=require("path")
const router=express.Router();
const controller=require('../controllers/password');


router.route("/sendMail").post(controller.sendmail);
router.route("/resetPassword/:id").post(controller.resetpassword);
router.route("/updatepassword/:id").get(controller.updatepassword)
module.exports=router;