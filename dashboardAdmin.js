

if (document.cookie.indexOf("CrewCentreSession=Valid") == -1) {
  location.href = "/dashboard";
}
var data = JSON.parse( sessionStorage.getItem("data") );
if(data.admin != true){
	location.href = "/dashboard";
}
var url = sessionStorage.getItem("url")

var idleTime = 0;
console.log("PRE DASHBOARD ADMIN.JS")


clamData = async () => {
  	let request = url + "/users/balance"
	let deposit_resp = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": "clam_miner"
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }});
	let response = await deposit_resp.json()
	console.log("got user data", response)
	return response.user_balance
}



generateDropdown = async() =>{
	let sel = document.getElementById("userSearch")
	let sel2 = document.getElementById("userSearch2")
	let sel3 = document.getElementById("userSearch3")
	let sel4 = document.getElementById("userSearch4")
	let request = url + "/frontend/all_users"
	let user_resp = await fetch(request)
	let users = await user_resp.json()
	for(let i = 0; i<users.users.length; i++) { 
	    opt = document.createElement('option');
	    opt.value = users.users[i].username;
	    opt.innerHTML = users.users[i].username;
	    opt2 = document.createElement('option');
	    opt2.value = users.users[i].username;
	    opt2.innerHTML = users.users[i].username;
	    opt3 = document.createElement('option');
	    opt3.value = users.users[i].username;
	    opt3.innerHTML = users.users[i].username;
	    opt4 = document.createElement('option');
	    opt4.value = users.users[i].username;
	    opt4.innerHTML = users.users[i].username;
	    sel.appendChild(opt);
	    sel2.appendChild(opt2);
	    sel3.appendChild(opt3);
	    sel4.appendChild(opt4);
	}
}
	function timerIncrement() {
    idleTime = idleTime + 1;
    if(idleTime == 5){
    	$.notify("Inactivity detected. Logging out in 1 minute.", {autoHide: false});
    	
    }
    else if (idleTime > 5) { // 20 minutes
    	sessionStorage.clear();
        location.href = "/dashboard";
    }
}	
async function main() {
	console.log("IN DASHBOARDADMIN.JS")

  	let data = JSON.parse( sessionStorage.getItem("data") );
	  	//Increment the idle time counter every minute.
	var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

	//Zero the idle timer on mouse movement.
	$(this).mousemove(function (e) {
		console.log("mouse move")
	    idleTime = 0;
	});
	$(this).keypress(function (e) {
		console.log("key press")
	    idleTime = 0;
	});
	addRow = async (userData) =>{
	var table = $('#myTable').DataTable();
  
  	var row = table.row.add([userData.username, userData.clam_balance]).draw(false);

	}
	updateUserTable = async() =>{
	var table = $('#myTable').DataTable();
	table.clear().draw()
	let request = url + "/frontend/all_users"
	let user_resp = await fetch(request)
	let users = await user_resp.json()
	users.users.push({username: "clam_miner"})
	for(let i=0; i<users.users.length; i++){
		let username = users.users[i].username
		request = url + "/users/balance"
		let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		let resp_json = await response.json()
		if(resp_json.code == "Success"){
			let user_data = {username : username, clam_balance: resp_json.user_balance}
			addRow(user_data)
			console.log("user data", user_data)
		}else{
			alert(resp_json.msg)
		}
		
	}
	return
}
	document.getElementById("logout").onclick = async () =>{
		sessionStorage.clear();

      return window.location.href = 'index.html'

	}
	document.getElementById("dashboard").onclick = async () =>{
		if(data.admin){
      return window.location.href = 'dashboardAdmin.html'
    }
    else{
      return window.location.href = 'dashboard.html';
    }
	}
	console.log('data',data)
	updateUserTable()
	generateDropdown()
	var username = data.username
	let clams = await clamData()
	console.log("clams", clams)
	document.getElementById("amount").innerHTML = clams
	document.getElementById("updateButton").onclick = async () =>{
		let amount = document.getElementById("update").value
		console.log("amount", amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && parseFloat(amount) >= 0){
	  		let request = url + "/transactions/global_update"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "amount": parseFloat(amount)
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "balance updated"){
		  		console.log("successful update")
		  		$.notify("Successfully updated global balance to " + amount, "success")
		  		setTimeout(async ()=>{
		  			let clam_balance = await clamData()
		  			document.getElementById("amount").innerHTML = clam_balance
		  			setTimeout(async ()=>{
		  			console.log("updating table")
		  			updateUserTable()
		  		}, 1000)
		  	}, 1000)
		  		
		  		
		  	}
		  	else{
		  		alert("Update Error!")
		  		console.log("error")
		  	}
		}
		else{
			alert("Input is not a number!")
			console.log("not number!")
		}
	}
		document.getElementById("depositButton").onclick = async () =>{
		let amount = document.getElementById("deposit").value
		let user = document.getElementById("userSearch")
		let username = user.options[user.selectedIndex].value;
		console.log("deposit user", username)
		console.log("amount", amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount)){
	  		let request = url + "/transactions/deposit"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username,
			      "amount": parseFloat(amount)
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "Deposit successful"){
		  		console.log("successful deposit")
		  		$.notify("Successfully deposited " + amount + " to " + username, "success")
		  		setTimeout(async ()=>{
		  			let clam_balance = await clamData()
		  			document.getElementById("amount").innerHTML = clam_balance
		  			setTimeout(async ()=>{
		  			console.log("updating table")
		  			updateUserTable()
		  		}, 1000)
		  	}, 1000)
		  		
		  	}
		  	else{
		  		alert("An error occurred!")
		  		console.log("error")
		  	}
		}
		else{
			alert("Input is not a number!")
			console.log("not number!")
		}
	}
	document.getElementById("withdrawButton").onclick = async () =>{
		let amount = document.getElementById("withdrawal").value
		console.log("amount", amount)
		let user = document.getElementById("userSearch2")
		let username = user.options[user.selectedIndex].value;
		console.log("deposit user", username)
		let check_user_req = url + '/frontend/user_data/' + username
		let cu_response = await fetch(check_user_req)
		let useramount = await cu_response.json()
		let checkAmount = useramount.clam_balance >= parseFloat(amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && checkAmount){
	  		let request = url + "/transactions/withdrawal"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username,
			      "amount": parseFloat(amount)
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "Withdrawal successful"){
		  		console.log("successful withdrawal")
		  		$.notify("Successfully withdrew " + amount + " from " + username, "success")
		  		setTimeout(async ()=>{
		  			let clam_balance = await clamData()
		  			document.getElementById("amount").innerHTML = clam_balance
		  			setTimeout(async ()=>{
		  			console.log("updating table")
		  			updateUserTable()
		  		}, 1000)
		  	}, 1000)
		  		
		  	}
		  	else{
		  		console.log("error")
		  	}
		}
		else if(!checkAmount && amount != "" && amount != null){
			alert("Withdrawal amount exceeds balance!")
			console.log("invalid amount")
		}
		else{
			alert("Input is not a number!")
			console.log("not number!")
		}
	}
	document.getElementById("transferButton").onclick = async () =>{
		let amount = document.getElementById("transfer").value
		console.log("amount", amount)
		let user1 = document.getElementById("userSearch3")
		let username1 = user1.options[user1.selectedIndex].value;
		let user2 = document.getElementById("userSearch4")
		let username2 = user2.options[user2.selectedIndex].value;
		console.log("username", username)
		console.log("from", username1, "to", username2)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount)){
			let request = url + "/transactions/transfer"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			        "amount": parseFloat(amount),
					"username":username,
					"sender": username1,
					"recipient":username2
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "transfer amount successful"){
		  		$.notify("Successfully transfered " + amount + " from " + username1 + " to " + username2, "success")
		  		setTimeout(async ()=>{
			  			let clam_balance = await clamData()
			  			document.getElementById("amount").innerHTML = clam_balance
			  			setTimeout(async ()=>{
			  			console.log("updating table")
			  			updateUserTable()
			  		}, 1000)
			  	}, 1000)
		  	}else{
		  		alert(resp_json.msg)
		  	}
		  }else{
		  	alert("Input is not a number!")
			console.log("not number!")
		  }
		
	}
  
}
jQuery(document).ready(function($){
main()
})
