


var data = JSON.parse( sessionStorage.getItem("data") );
if (document.cookie.indexOf("CrewCentreSession=Valid") == -1 || data == undefined || data == null || data.username == undefined) {
  location.href = "/dashboard";
}
console.log("transactions data", data)
var url = sessionStorage.getItem("url")
var idleTime = 0;

function timerIncrement() {
    idleTime = idleTime + 1;
    if(idleTime == 5){
    	alert("Inactivity detected. Logging out in 1 minute.")
    }
    else if (idleTime > 5) { // 20 minutes
    	sessionStorage.clear();
        location.href = "/dashboard";
    }
}


updateUserTable = async(username) =>{
	var table = document.querySelector("#myTable");
	var rowCount = table.rows.length

	for (let x=rowCount-1; x>0; x--) {
	   table.deleteRow(x)
	}
	let request = url + "/users/transaction_history"
	if(data.admin){
		let request_users = url + "/frontend/all_users"
		let user_resp = await fetch(request_users)
		let users = await user_resp.json()
		let dates = []
		for(let i = 0; i < users.users.length; i++){
			username = users.users[i].username
			let user_resp = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
					"username":username,
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
			let history = await user_resp.json()
			
			if(history.code == "Success"){
				for(let i=0; i<history.transaction_history.length; i++){
					let user_data = history.transaction_history[i]
					dates.push([user_data, username])
					
					console.log("user data", user_data)
				}
			}else{
				alert("Error retrieving history!")
			}
		}
		dates = dates.sort((a,b) => {
				a = a[0].time
				b = b[0].time
				// console.log(a, b)
				return a>b ? -1 : a<b ? 1 : 0;
			})
			console.log("dates", dates)
			for(let j = 0; j < dates.length; j++){
				let date = dates[j]
				addRowAdmin(date[0], date[1])
			}

	}else{
		console.log("not admin")
		let user_resp = await fetch(request, {
	    method: "POST",
	    mode: "cors",
	    body: JSON.stringify({
			"username":username,
	    }), // string or object
	    headers: {
	      'Content-Type': "application/json"
	    }
  	});
	let history = await user_resp.json()
	let dates = []
	if(history.code == "Success"){
		for(let i=0; i<history.transaction_history.length; i++){
			let user_data = history.transaction_history[i]
			dates.push(user_data)
			
			console.log("user data", user_data)
		}
		dates = dates.sort((a,b) => {
				a = a.time
				b = b.time
				// console.log(a, b)
				return a>b ? -1 : a<b ? 1 : 0;
			})
			for(let j = 0; j < dates.length; j++){
				let date = dates[j]
				addRow(date)
			}
	}else{
		alert("Error retrieving history!")
	}
	
	}
	
	return
}

jQuery(document).ready(function($){
	addRow = async (userData) =>{
	var table = $('#myTable').DataTable();
  
  	var row = table.row.add([userData.time, userData.description, userData.amount, userData.type, userData.user_balance]).draw(false);

}
addRowAdmin = async (userData, name) =>{
	var table = $('#myTable').DataTable();
  
  	var row = table.row.add([userData.time, name, userData.description, userData.amount, userData.type, userData.user_balance]).draw(false);

}
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
	$('#myTable').DataTable();
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
	var username = data.username
	updateUserTable(username)
	
  
});
