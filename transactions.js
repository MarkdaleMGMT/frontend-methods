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


updateUserTable = async (username, table) => {
	var rowCount = table.rows.length

	for (let x = rowCount - 1; x > 0; x--) {
		table.deleteRow(x)
	}
	let request = url + "/users/transaction_history"
	if (data.admin) {
		let request_users = "http://localhost:3001" + "/frontend/all_users"
		let user_resp = await fetch(request_users)
		let users = await user_resp.json()
		let dates = []
		for (let i = 0; i < users.users.length; i++) {
			username = users.users[i].username
			let user_resp = await fetch(request, {
				method: "POST",
				mode: "cors",
				body: JSON.stringify({
					"username": username,
				}), // string or object
				headers: {
					'Content-Type': "application/json"
				}
			});
			let history = await user_resp.json()

			if (history.code == "Success") {
				for (let i = 0; i < history.transaction_history.length; i++) {
					let user_data = history.transaction_history[i]
					dates.push([user_data, username])
					addRowAdmin(user_data, username, table)

					console.log("user data", user_data)
				}
			} else {
				alert("Error retrieving history!")
			}
		}

	} else {
		console.log("not admin")
		let user_resp = await fetch(request, {
			method: "POST",
			mode: "cors",
			body: JSON.stringify({
				"username": username,
			}), // string or object
			headers: {
				'Content-Type': "application/json"
			}
		});
		let history = await user_resp.json()
		if (history.code == "Success") {

			for (let j = 0; j < history.transaction_history.length; j++) {
				let date = history.transaction_history[j]
				addRow(date, username, table)
			}
		} else {
			alert("Error retrieving history!")
		}

	}

	return
}

jQuery(document).ready(function($) {
	addRow = async (userData, name, table) => {

		var row = table.row.add([userData.time, name, userData.description, userData.amount, userData.type, userData.user_balance]).draw(false);

	}
	addRowAdmin = async (userData, name, table) => {

		var row = table.row.add([userData.time, name, userData.description, userData.amount, userData.type, userData.user_balance]).draw(false);

	}
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
	table = $('#myTable').DataTable({
		"order": [[ 0, "desc" ]],
		"searching": true
	});
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
	console.log('data', data)
	var username = data.username
	updateUserTable(username, table)


});