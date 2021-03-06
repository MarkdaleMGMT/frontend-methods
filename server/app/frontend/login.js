var { user_model} = require('../models')
var md5 = require('md5')
const bcrypt = require('bcrypt');

login = async (username, hashedPassword) => {
	console.log("username", username, "hash", hashedPassword)
	// let query = "SELECT * FROM user WHERE username = ? AND password = ?;"
	let query = await user_model.get_user_by_username(username);
	console.log('query', query)
	const match = await bcrypt.compare(hashedPassword, query.password);
	let successfulLogin =  match && query.email_verify_flag.toString() == '1'  ? true : false
	let result = successfulLogin ? {result: successfulLogin, level: query.level, ref_code: md5(query.username).slice(0,5)} : {result: successfulLogin}
	if(!result.result && query.email_verify_flag.toString() == '1'){
		return {result: false, code: "Incorrect Password"}
	}
	else if(!result.result && query.email_verify_flag.toString() != '1'){
		return {result: false, code: "Email unconfirmed"}
	}
	else{
		return result
	}

} 
module.exports = async function login_api(req, res) {
 	console.log("body", req.body)
 	console.log("LOGIN IN")
 	let username = req.body.username
 	let password = req.body.password
    // let hashedPassword = passwordHash.generate(password);
    let hashedPassword = password
    console.log("hash", hashedPassword)
    try{
	    let result = await login(username, hashedPassword)
	    if(!result.result){
	    	throw Error (result.code)
	    }
	    let balance = await user_model.get_balance(username)
    	res.send({ code: "Login successful", level: result.level, clam_balance: balance, ref_code: result.ref_code})

	}
	catch(err){
		res.status(400).send({code: 'Login failed', error: err.message});	
	}
 }
