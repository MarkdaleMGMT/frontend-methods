

if (document.cookie.indexOf("CrewCentreSession=Valid") == -1) {
  location.href = "/dashboard";
}
var data = JSON.parse( sessionStorage.getItem("data") );
if(data.admin == true){
	console.log("user is admin")
	location.href = "/dashboard";
}

var url = sessionStorage.getItem("url")
var idleTime = 0;

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
userData = async (username) => {
	console.log(username)
  	let request = url + "/frontend/user_data/" + username // change this to ayeshas
	let deposit_resp = await fetch(request);
	let response = await deposit_resp.json()
	let request2 = url + "/users/balance"
	let deposit_resp2 = await fetch(request2, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }});
	let response2 = await deposit_resp2.json()
	console.log("got user data", response, response2)
	return {clam_balance: response2.user_balance, ref_code: response.ref_code}
}

refreshData = async(username) =>{
	let user_data = await userData(username)
	document.getElementById("amount").innerHTML = user_data.clam_balance
	document.getElementById("ref_code").innerHTML = user_data.ref_code
}
jQuery(document).ready(async function($){

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

	console.log('data',data)
	document.getElementById("logout").onclick = async () =>{
		sessionStorage.clear();
		let data = JSON.parse( sessionStorage.getItem("data") );
		console.log("logout", data)
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
	var username = data.username
	refreshData(username)
	let request = url + "/users/transaction_history"
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
	for(let i=0; i<history.transaction_history.length; i++){
					let user_data = history.transaction_history[i]
					dates.push(user_data)
					
					console.log("user data", user_data)
				}
	dates = dates.sort((a,b) => {
				a = new Date(a.time)
				b = new Date(b.time)
				// console.log(a, b)
				return a>b ? 1 : a<b ? -1 : 0;
			})
	console.log("dates", dates)
	// if(dates.length > 10){
	// 	sliced_dates =[]
	// 	let diff = Math.floor(dates.length/10)
	// 	for(let i = 0; i< dates.length; i+= diff){
	// 		sliced_dates.push(dates[i])
	// 	}
	// 	dates = sliced_dates
	// }
	console.log("sliced dates", dates)
	let labels = []
	let values= []
	for(let j = 0; j<dates.length; j++){
		labels.push(dates[j].time.toString().slice(2, 6))
		values.push(dates[j].user_balance)
	}
	console.log(labels)
	var ctx = document.getElementById("clam-chart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Clam Balance',
	            data: values,
	            backgroundColor: [
	                'rgba(255,255,255, 0.2)'
	            ],
	            borderColor: [
	                'rgba(141,198,71, 0.8)'
	            ],
	            borderWidth: 3,
	       		radius: 1
	        }]
	    },
	    options: {
	    	legend: {
	    		display: false
	    	},
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }],
	            xAxes: [{
			    ticks: {
			        autoSkip: true,
			        maxTicksLimit: 8
			    }
			}]
	        }
	    }
	});
	document.getElementById("transferButton").onclick = async () =>{
		let amount = document.getElementById("transfer").value
		console.log("amount", amount)
		let username2 = document.getElementById("transferTo").value
		console.log("from", username, "to", username2)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount)){
			let request = url + "/transactions/transfer"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			        "amount": parseFloat(amount),
					"username": username,
					"sender": username,
					"recipient":username2
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "transfer amount successful"){
		  		$.notify("Successfully transfered " + amount + " to " + username2, "success")
		  		setTimeout(async ()=>{
			  			refreshData(username)
			  		}, 1000)
		  	}else{
		  		alert(resp_json.msg)
		  	}
		  }else{
		  	alert("Input is not a number!")
			console.log("not number!")
		  }
		
	}

  
});
