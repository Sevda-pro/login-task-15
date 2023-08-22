const db = require("../util/db.config")
const User = db.customers
const ResetPassword = db.ResetPassword
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");



const sendmail = async (req, res, next) => {
    try {
        const email = req.body.email;
        const requestId = uuidv4();

        const user = await User.findOne({ where: { Email: email } });

        if (!user) {
            return res
                .status(404)
                .json({ message: "Please provide the registered email!" });
        }

        const resetRequest = await ResetPassword.create({
            id: requestId,
            isActive: true,
            customerId: user.id,
        });

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications["api-key"];
        apiKey.apiKey = ""
        const transEmailApi = new Sib.TransactionalEmailsApi();
        const sender = {
            email: "mesahilsevda@gmail.com",
        };
        const receivers = [
            {
                email: email,
            },
        ];
        const emailResponse = await transEmailApi.sendTransacEmail({
            sender,
            To: receivers,
            subject: "Expense Tracker Reset Password",
            textContent: "Link Below",
            htmlContent: `<h3>Hi! We got the request from you for reset the password. Here is the link below >>></h3>
        <a href="http://localhost:3001/password/resetPassword/${requestId}"> Click Here</a>`,
        });
        return res.status(200).json({
            message:
                "Link for reset the password is successfully send on your Mail Id!",
        });
    } catch (error) {
        console.log("error");
        return res.status(409).json({ message: "failed changing password" });
    }
};
 const resetpassword = async(req, res, next) =>{
	const { id } = req.params;

	let user = await ResetPassword.findAll( {id: id } );

	if (user) {
		user.update({ active: false });
		res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`);
		res.end();
	};
}

const updatepassword = async (req, res) => {
	try {
		const { newpassword } = req.body;
		const { id } = req.params;

		let find = await ResetPassword.findAll({ where: { id: id } });
        console.log(find)
		if (find) {
			let user = await User.findAll({ where: { id: find.customerId } });
			if (user) {
				let salt = await bcrypt.genSalt(10);
				let hashedPassword = await bcrypt.hash(newpassword, salt);

				await User.update({ password: hashedPassword }, { where: { id: find.customerId } });

				res.status(201).json({ message: "Successfuly updated the new password" });
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(404).json({ error: "no user exists", success: false });
	}
};


module.exports = { sendmail,resetpassword,updatepassword };