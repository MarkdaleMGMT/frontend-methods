function field_focus(field, email) {
  if (field.value == email) {
    field.value = '';
  }
}

function field_blur(field, email) {
  if (field.value == '') {
    field.value = email;
  }
}

handleChange = (event) => {
        event.preventDefault();
        var keyCode = event.keyCode || event.which;
        if (keyCode == '13'){
            console.log('enter pressed');
            return false;
        }
    }

function validateEmail(email){
  let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return re.test(email)
}
function stringValidator(string){
  return string.trim() == "" || string == null || string == "username" || string == "pass" || string == "code"
}
var url = "http://165.227.35.11"
signup = async (username, email, password, code) => {
  if(stringValidator(username) || stringValidator(email) || stringValidator(password) || stringValidator(code)){
    alert("Please fill in the form!")
    return
  }
  if(!validateEmail(email)){
    alert("Email in incorrect format!")
    return
  }
  let check = await fetch(url + "/frontend/all_users")
  let check_response = await check.json()
  let found = false
  console.log("check response", check_response)
  for(let i=0; i<check_response.users.length; i++){
    console.log("checking", check_response.users[i])

    if(check_response.users[i].username == username){
      
      found = true
      alert("Username taken!")
      return
    }
    else if(check_response.users[i].email == email){
      found = true
      alert("Email is taken!")
      return
    }
  }
  console.log("ADMINS", check_response.admins)
  for(let j=0; j<check_response.admins.length; j++){
    console.log("checking admins", check_response.admins[j].username)
    if(check_response.admins[j].username == username){
      found = true
      alert("Username taken!")
      return
    }
  }
  if(!found){
    let request = url + "/frontend/signup"
    let signup_resp = await fetch(request, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            "username": username,
            "email": email,
            "password": password,
            "code": code
          }), // string or object
          headers: {
            'Content-Type': "application/json"
          }
        });
    let response = await signup_resp.json()
    console.log("sign up data", response)
    if(response.code == "Signup successful"){
      alert("Successful signup! Confirm your email to log in!")
      let data = {username: username, ref_code: response.ref_code}
      sessionStorage.setItem("data", JSON.stringify(data));
      sessionStorage.setItem("confirm", "false")
      return window.location.href = '/dashboard'
    }
    else{
      alert("Unsuccessful signup! Incorrect referral code?")
    }
    return response.clam_balance
  }

}

//Fade in dashboard box
jQuery(document).ready(function($){

  document.getElementById("btn").onclick = async function() {
    console.log("hello")
    let username = document.getElementById("username").value
    let email = document.getElementById("email").value
    let password = document.getElementById("pass").value
    let code = document.getElementById("code").value
    console.log(username, password)
    let resp = await signup(username, email, password, code)
    console.log('resp', resp)
  }
});

