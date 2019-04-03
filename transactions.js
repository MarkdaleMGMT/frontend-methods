var data = JSON.parse(sessionStorage.getItem("data"));
if (document.cookie.indexOf("CrewCentreSession=Valid") == -1 || data == undefined || data == null || data.username == undefined) {
	location.href = "/dashboard";
}
console.log("transactions data", data)
var url = sessionStorage.getItem("url")
var idleTime = 0;

function timerIncrement() {
	idleTime = idleTime + 1;
	if (idleTime == 5) {
		alert("Inactivity detected. Logging out in 1 minute.")
	} else if (idleTime > 5) { // 20 minutes
		sessionStorage.clear();
		location.href = "/dashboard";
	}
}

getAccountsByName = async (username) =>{
	let request = "http://localhost:3000" + "/users/balance"
	let response = await fetch(request, {
		    method: "POST",
		    mode: "cors",
		    body: JSON.stringify({
		    	"key": "username",
		      "value": username
		    }), // string or object
		    headers: {
		      'Content-Type': "application/json"
		    }
	  	});
	response = await response.json()
	console.log("response", response, username)
	return response.user_balance
}
getUserTable = async (username) => {

	let request = "http://localhost:3000" + "/users/transaction_history"
	if (data.admin) {
		let request_users = url + "/frontend/all_users"
		let user_resp = await fetch(request_users)
		let users = await user_resp.json()
		let dates = []
		for (let i = 0; i < users.users.length; i++) {
			username = users.users[i].username
			let accounts = await getAccountsByName(username)
			for(let j = 0; j < accounts.length; j++){
				let acc = accounts[j]
				let user_resp = await fetch(request, {
				method: "POST",
				mode: "cors",
				body: JSON.stringify({
					"account_id": acc.account_id
				}), // string or object
				headers: {
					'Content-Type': "application/json"
				}
				});
				let history = await user_resp.json()

				if (history.code == "Success") {
					for (let i = 0; i < history.transaction_history.length; i++) {
						let user_data = history.transaction_history[i]
						dates.push([user_data.time, user_data.currency, username, user_data.description, user_data.amount, user_data.type, user_data.account_balance])

						console.log("user data", user_data)
					}
				} else {
					alert("Error retrieving history!")
				}
			}
			
		}
		return dates


	} else {
		console.log("not admin")
		let dates = []
		let accounts = await getAccountsByName(username)
		console.log(accounts)
		for(let j = 0; j < accounts.length; j++){
			let acc = accounts[j]
			let user_resp = await fetch(request, {
				method: "POST",
				mode: "cors",
				body: JSON.stringify({
					"account_id": acc.account_id
				}), // string or object
				headers: {
					'Content-Type': "application/json"
				}
			});
			let history = await user_resp.json()
			if (history.code == "Success") {

				for (let j = 0; j < history.transaction_history.length; j++) {
					let user_data = history.transaction_history[j]
					dates.push([user_data.time, user_data.currency, username, user_data.description, user_data.amount, user_data.type, user_data.account_balance])
				}
			} else {
				alert("Error retrieving history!")
			}
		}
		return dates

	}

	return
}

jQuery(document).ready(async function($) {

	let data = JSON.parse(sessionStorage.getItem("data"));
	//Increment the idle time counter every minute.
	var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

	//Zero the idle timer on mouse movement.
	$(this).mousemove(function(e) {
		console.log("mouse move")
		idleTime = 0;
	});
	$(this).keypress(function(e) {
		console.log("key press")
		idleTime = 0;
	});
	console.log('data', data)
	var username = data.username
	let dataset = await getUserTable(username)
	var table
	if(data.admin){
		table = $('#myTable').DataTable({
		"order": [[ 0, "desc" ]],
		"searching": true,
		"data": dataset,
		"autoWidth": true,
		"columns": [
            { title: "Time" },
            {title: "Currency"},
            { title: "Name" },
            { title: "Description" },
            { title: "Amount" },
            { title: "Type" },
            { title: "Balance" }
        ]
	});
	}else{
		table = $('#myTable').DataTable({
		"order": [[ 0, "desc" ]],
		"searching": true,
		"data": dataset,
		"autoWidth": true,
		"columns": [
            { title: "Time" },
            {title: "Currency"},
            { title: "Name" },
            { title: "Description" },
            { title: "Amount" },
            { title: "Type" },
            { title: "Balance" }
        ]
	});
	}

	document.getElementById("logout").onclick = async () => {
		sessionStorage.clear();

		return window.location.href = 'index.html'

	}
	document.getElementById("dashboard").onclick = async () => {
		if (data.admin) {
			return window.location.href = 'dashboardAdmin.html'
		} else {
			return window.location.href = 'dashboard.html';
		}
	}
	
	
	


});