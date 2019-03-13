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
  return string.trim() == "" || string == null || string == "email"
}
var url = sessionStorage.getItem("url")

resetPassword = async (email) => {
  if(stringValidator(email)){
    alert("Please fill in the form!")
    return
  }
  if(!validateEmail(email)){
    alert("Email in incorrect format!")
    return
  }
  let check = await fetch(url + "/frontend/reset_password", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            "email": email
          }), // string or object
          headers: {
            'Content-Type': "application/json"
          }
        });
  let check_response = await check.json()
    if(check_response.code == "Reset successful"){
    alert("Successful! Link sent to your email!")
    return window.location.href = '/dashboard'
  }
  else{
    alert("Unsuccessful reset!")
  }
  return "failure"
  

}

//Fade in dashboard box
jQuery(document).ready(function($){

  document.getElementById("btn").onclick = async function() {
    console.log("hello")
    let email = document.getElementById("email").value
    console.log(email)
    let resp = await resetPassword(email)
    console.log('resp', resp)
  }
});

