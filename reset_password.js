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

function stringValidator(string){
  return string.trim() == "" || string == null || string == "pass"
}

var url = "http://localhost:3001"

updatePassword = async (pass) => {
  let page = new URL(window.location.href)

  let token = page.searchParams.get("token")
  if(stringValidator(pass)){
    alert("Please fill in the form!")
    return
  }
  console.log("url: ", url, "pass: ", pass)
  let check = await fetch(url + "/frontend/update_password", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            "token": token,
            "pass": pass
          }), // string or object
          headers: {
            'Content-Type': "application/json"
          }
        });
  let check_response = await check.json()
    if(check_response.code == "Reset successful"){
    alert("Successful reset!")
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
    let pass = document.getElementById("pass").value
    console.log(pass)
    let resp = await updatePassword(pass)
    console.log('resp', resp)
  }
});


