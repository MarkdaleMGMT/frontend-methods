
var url = sessionStorage.getItem("url")
if (document.cookie.indexOf("CrewCentreSession=Valid") == -1 || url == null || url == undefined) {
  location.href = "/dashboard";
}
var data = JSON.parse( sessionStorage.getItem("data") );
if(data.admin == true){
	console.log("user is admin")
	location.href = "/dashboard";
}


var idleTime = 0;
var balance_currency = "clam_balance"
var currency = [{currency: "CLAM", click: true}, {currency: "BTC", click: false}, {currency: "OZ", click: false}, {currency: "CAD", click: false}, {currency: "USD", click: false}]
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
generateDropdown = async () =>{
	let sel = document.getElementById("investment-select")
	sel.innerHTML = ""
	let request = url + "/frontend/all_investments"
	let resp = await fetch(request)
	resp = await resp.json()
	console.log("investment options", resp)
	let investments = resp.investments
	let curr = currentCurrency()
	console.log("curr currency", curr)
	for(let i = 0; i < investments.length; i++){
		if(investments[i].currency == curr){
			let option = document.createElement("option");
			option.innerHTML =  investments[i].investment_name
			option.value = investments[i].investment_id
			sel.appendChild(option)
		}
		
	}

}
userData = async (username) => {
	console.log(username)
  	let request = url + "/frontend/user_data/" + username // change this to ayeshas
	let deposit_resp = await fetch(request);
	let response = await deposit_resp.json()
	let request2 = url+ "/users/balance"
	let deposit_resp2 = await fetch(request2, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			    	"key": "username",
			      "value": username
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }});
	let response2 = await deposit_resp2.json()
	console.log("got user data", response, response2)
	let BTC = 0
	let GOLD = 0
	let CLAM = 0
	let USD = 0
	let CAD = 0
	for(let i = 0; i < response2.user_balance.length; i++){
		let inv = response2.user_balance[i]
		if(inv.currency == "CLAM"){
			CLAM += inv.balance
		}
		else if(inv.currency == "BTC"){
			BTC += inv.balance
		}
		else if(inv.currency == "USD"){
			USD += inv.balance
		}
		else if(inv.currency == "CAD"){
			CAD += inv.balance
		}
		else if(inv.currency == "OZ"){
			GOLD += inv.balance
		}
	}
	let user_investments = {clam_balance: CLAM, btc_balance: BTC, cad_balance: CAD, usd_balance: USD, gold_balance: GOLD, ref_code: response.ref_code}
	console.log(user_investments)
	return [user_investments, response2.user_balance]
}
updateGraph = async (username) =>{
	let ud = await userData(username)
	let sel = document.getElementById('investment-select')

	let investment_id = sel.options[sel.selectedIndex].value
	console.log("ud", ud, investment_id)
	let match = false
	for(let i = 0; i < ud[1].length; i++){

		if(ud[1][i].investment_id == investment_id){
			match = true
			console.log("found investment id")
			let request = url + "/users/transaction_history"
			let user_resp = await fetch(request, {
					    method: "POST",
					    mode: "cors",
					    body: JSON.stringify({
							"account_id":ud[1][i].account_id,
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

			let labels = []
			let values= []
			for(let j = 0; j<dates.length; j++){
				labels.push(dates[j].time.toString().slice(0, 7))
				values.push(dates[j].account_balance)
			}
			console.log("labels", labels)

			var ctx = document.getElementById("clam-chart").getContext('2d');
			var myChart = new Chart(ctx, {
			    type: 'line',
			    data: {
			        labels: labels,
			        datasets: [{
			            label: 'Balance',
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
			            xAxes: [{
					    ticks: {
					        autoSkip: true,
					        maxTicksLimit: 8
					    }
					}]
			        }
			    }
			});
		}
	}
	if(!match){
		var ctx = document.getElementById("clam-chart").getContext('2d');
			var myChart = new Chart(ctx, {
			    type: 'line',
			    data: {
			        labels: [],
			        datasets: [{
			            label: 'Balance',
			            data: [],
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
			            xAxes: [{
					    ticks: {
					        autoSkip: true,
					        maxTicksLimit: 8
					    }
					}]
			        }
			    }
			});
	}
	
}
currentCurrency = () =>{
	for(let i = 0; i < currency.length; i++){
		if(currency[i].click == true){
			return currency[i].currency
		}
	}
	console.log("ERROR -> found no current currency")
}

refreshData = async(username) =>{
	let user_data = await userData(username)
	user_data = user_data[0]
	document.getElementById("amount").innerHTML = user_data[balance_currency]
	document.getElementById("ref_code").innerHTML = user_data.ref_code
}
changePageCurrency = async(currency, username) =>{
	balance_currency = currency.toLowerCase() + "_balance"
	refreshData(username)
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
	var username = data.username
	generateDropdown()
	document.getElementById("CLAM").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			console.log(currency[i].currency)
			if(currency[i].currency != "CLAM"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		document.getElementById("widgets").innerHTML = '<coingecko-coin-ticker-widget   coin-id="clams" currency="cad" locale="en"></coingecko-coin-ticker-widget> <coingecko-coin-converter-widget coin-id="clams" currency="cad" background-color="#ffffff" font-color="#4c4c4c" locale="en"></coingecko-coin-converter-widget>'
		await changePageCurrency("CLAM", username)
		await generateDropdown()
		await updateGraph(username)
		console.log(currency)

	}
	document.getElementById("BTC").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			if(currency[i].currency != "BTC"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		document.getElementById("widgets").innerHTML = '<coingecko-coin-ticker-widget   coin-id="bitcoin" currency="cad" locale="en"></coingecko-coin-ticker-widget> <coingecko-coin-converter-widget coin-id="bitcoin" currency="cad" background-color="#ffffff" font-color="#4c4c4c" locale="en"></coingecko-coin-converter-widget>'
		await changePageCurrency("BTC", username)
		await generateDropdown()
		await updateGraph(username)
		console.log(currency)

	}
	document.getElementById("GOLD").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			if(currency[i].currency != "OZ"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		document.getElementById("widgets").innerHTML = ''
		await changePageCurrency("GOLD", username)
		await generateDropdown()
		await updateGraph(username)
		console.log(currency)

	}
	document.getElementById("CAD").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			if(currency[i].currency != "CAD"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		document.getElementById("widgets").innerHTML = ''
		await changePageCurrency("CAD", username)
		await generateDropdown()
		await updateGraph(username)
		console.log(currency)

	}
	document.getElementById("USD").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			if(currency[i].currency != "USD"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		document.getElementById("widgets").innerHTML = ''
		await changePageCurrency("USD", username)
		await generateDropdown()
		await updateGraph(username)
		console.log(currency)

	}
	document.getElementById("logout").onclick = async () =>{
		sessionStorage.clear();
		let data = JSON.parse( sessionStorage.getItem("data") );
		console.log("logout", data)
      return window.location.href = 'index.html'

	}

	
	
	refreshData(username)
	updateGraph(username)
	
	
	document.getElementById("transferButton").onclick = async () =>{
		let amount = document.getElementById("transfer").value
		console.log("amount", amount)
		let username2 = document.getElementById("transferTo").value
		console.log("from", username, "to", username2)
		let current_balance = document.getElementById("amount").innerHTML
		console.log("current balance", current_balance)
		let checkAmount = parseFloat(current_balance) >= amount
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && current_balance != "0" && checkAmount && parseFloat(amount) >= 0){
			let user_data = await userData(username)
			user_data = user_data[1]
			let sel = document.getElementById('investment-select')
			let selected_currency = await currentCurrency()
			let investment_id = sel.options[sel.selectedIndex].value
			let request = url + "/transactions/transfer"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			        "amount": parseFloat(amount),
					"username": username,
					"sender": username,
					"recipient":username2,
					"investment_id": investment_id
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "transfer amount successful"){
		  		$.notify("Successfully transfered " + amount + " to " + username2 + " in " + selected_currency, "success")
		  		setTimeout(async ()=>{
			  			refreshData(username)
			  		}, 1000)
		  	}else{
		  		alert(resp_json.msg)
		  	}
		  }
		  else if(current_balance == '0'){
		  	$.notify("Investment in selected currency does not exist or balance is 0", 'warn')
		  	alert("Investment in selected currency does not exist or balance is 0")
		  }
		  else if(!checkAmount){
		  	$.notify("Insufficient funds", 'warn')
		  	alert("Insufficient funds")
		  }
		  else{
		  	$.notify("Input is not a valid number!", 'warn')
		  	alert("Input is not a valid number!")
			console.log("not number!")
		  }
		
	}

  
});
