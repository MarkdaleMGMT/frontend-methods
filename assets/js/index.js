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
let page = new URL(window.location.href)

console.log("page:", page, page.searchParams.get("confirm"))
if (page.searchParams.get("confirm") == "true" && sessionStorage.getItem("confirm") != "true"){
  sessionStorage.setItem("confirm", "true")
  alert("Email Confirmed!")
}
var url = "http://localhost:3001"
const checkUser = async (username, password) => {
  let request = url + "/frontend/login"
  console.log('in checkuser')
  let response = await fetch(request, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      "username": username,
      "password": password
    }), 
    headers: {
      'Content-Type': "application/json"
    }
  });
  let resp_json = await response.json()
  console.log("resp json", resp_json)
  if (resp_json.code == "Login successful") {
    console.log("successful login")
    let sessionTimeout = 1; //hours
    let loginDuration = new Date();
    loginDuration.setTime(loginDuration.getTime() + (sessionTimeout * 60 * 60 * 1000));
    document.cookie = "CrewCentreSession=Valid; " + loginDuration.toGMTString() + "; path=/";
    let data = {
      username: username,
      clam_balance: resp_json.clam_balance,
      admin: resp_json.level == 0 ? true : false,
      ref_code: resp_json.ref_code
    }
    sessionStorage.setItem("data", JSON.stringify(data));
    console.log("NAVIGATING")
    if(data.admin){
      return window.location.href = 'dashboardAdmin.html'
    }
    else{
      return window.location.href = 'dashboard.html';
    }
    
  } else {
    alert(resp_json.error)
    console.log("fail login")
  }
}

//Fade in dashboard box

(function($){$(document).ready(function() {
  sessionStorage.setItem("url",url)
  $('a').click(function(event) {
  event.preventDefault();
});
  console.log("IN INDEX.JS")
  document.getElementById("btn").onclick = async function() {
    console.log("hello")
    let username = document.getElementById("username").value
    let password = document.getElementById("pass").value
    console.log(username, password)
    let resp = await checkUser(username, password)
    console.log('resp', resp)
  }
  document.getElementById("btn2").onclick = function(){
    return window.location.href = 'signup.html'
  }
  document.getElementById("btn3").onclick = function(){
    return window.location.href = 'forgot_password.html'
  }
  document.getElementById("pass")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      console.log("hit enter")
        document.getElementById("btn").click();
    }
});
    //Stop click event

})})(jQuery);


