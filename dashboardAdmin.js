

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
var balance_currency = "clam_balance"
var currency = [{currency: "CLAM", click: true}, {currency: "BTC", click: false}, {currency: "OZ", click: false}, {currency: "CAD", click: false}, {currency: "USD", click: false}]

currencyData = async () => {
	let response = await getAccountsByName("admin_miner")
	console.log("got user data", response)
	let BTC = 0
	let GOLD = 0
	let CLAM = 0
	let USD = 0
	let CAD = 0
	for(let i = 0; i < response.length; i++){
		let inv = response[i]
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
	let user_investments = {clam_balance: CLAM, btc_balance: BTC, cad_balance: CAD, usd_balance: USD, gold_balance: GOLD, total_balance: CLAM + BTC + CAD + USD + GOLD}
	return [user_investments, response]
}



	addRow = async (userData) =>{
	var table = document.querySelector("#myTable");

  	var row = table.insertRow();

  	row.innerHTML = "<td>" + userData.username +"</td>" + "<td>" + userData.investment_id +"</td>" + "<td>" + userData.balance +"</td>"
}
	updateUserTable = async() =>{
	
	var table = document.querySelector("#myTable");
	var rowCount = table.rows.length
	let sel = document.getElementById("investment-select")
	for (let x=rowCount-1; x>0; x--) {
	   table.deleteRow(x)
	}
	let request = url + "/frontend/all_users"
	let user_resp = await fetch(request)
	let users = await user_resp.json()
	users.users.push({username: "admin_miner"})
	for(let i=0; i<users.users.length; i++){
		let username = users.users[i].username
		let resp_json = await getAccountsByName(username)
		let c_curr = currentCurrency()
		for(let j = 0; j < resp_json.length; j++){
			if(resp_json[j].currency == c_curr){

				let user_data = {username : username, balance: resp_json[j].balance, investment_id: resp_json[j].investment_id}
				addRow(user_data)
				console.log("user data", user_data)
			}
			
		}
		

		
	}
	return
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
	return response.user_balance
}
currentCurrency = () =>{
	for(let i = 0; i < currency.length; i++){
		if(currency[i].click == true){
			return currency[i].currency
		}
	}
	console.log("ERROR -> found no current currency")
}
updateInvestment = async () =>{
	let cd = await currencyData()
	cd = cd[1]
	let sel = document.getElementById('investment-select')
	let curr_inv = sel.options[sel.selectedIndex].value;
	for(let i = 0; i < cd.length; i++){
		if(cd[i].investment_id == curr_inv){
			document.getElementById("investment_amount").innerHTML = cd[i].balance
			return
		}
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
changePageCurrency = async(cur) =>{
	balance_currency = cur.toLowerCase() + "_balance"
	let curr = await currencyData()
	document.getElementById("curr_balance").innerHTML = cur.toUpperCase() + " Balance"
	document.getElementById("amount").innerHTML = curr[0][balance_currency]
	document.getElementById("total_amount").innerHTML = curr[0].total_balance
	generateDropdown()
	updateInvestment()
	updateUserTable()
}

async function main() {
	console.log("IN DASHBOARDADMIN.JS")

  	let data = JSON.parse( sessionStorage.getItem("data") );
	  	//Increment the idle time counter every minute.
	var idleInterval = setInterval(timerIncrement, 60000); // 1 minute
	generateDropdown()
	//Zero the idle timer on mouse movement.
	$(this).mousemove(function (e) {
		console.log("mouse move")
	    idleTime = 0;
	});
	$(this).keypress(function (e) {
		console.log("key press")
	    idleTime = 0;
	});

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
	var username = data.username
	let clams = await currencyData()
	console.log("clams", clams)
	document.getElementById("total_amount").innerHTML = clams[0].total_balance
	document.getElementById("amount").innerHTML = clams[0][balance_currency]
	updateInvestment()
		document.getElementById("CLAM").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			
			if(currency[i].currency != "CLAM"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		changePageCurrency("CLAM")
		console.log(currency)

	}
	document.getElementById("BTC").onclick = async () =>{
		for(let i = 0; i < currency.length; i++){
			console.log(currency[i].currency)
			if(currency[i].currency != "BTC"){
				currency[i].click = false
			}else{
				currency[i].click = true
			}
		}
		currency[0].click = false
		console.log(currency)
		changePageCurrency("BTC")
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
		changePageCurrency("GOLD")
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
		changePageCurrency("CAD")
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
		changePageCurrency("USD")
		console.log(currency)

	}
	var sel = document.getElementById("investment-select")
	document.getElementById("updateButton").onclick = async () =>{
		let amount = document.getElementById("update").value
		console.log("amount", amount)
		console.log("inv val", sel.options[sel.selectedIndex].value)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && parseFloat(amount) >= 0){
	  		let request = "http://localhost:3000" + "/transactions/global_update"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			    	"investment_id": sel.options[sel.selectedIndex].value,
			    	"username": "admin_miner",
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
		  			changePageCurrency(balance_currency.slice(0, -8))
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
		let username2 = user.value;
		let accounts = await getAccountsByName(username2)
		let sel = document.getElementById("investment-select")
		let account_id = null

		for(let i = 0; i < accounts.length; i++){
			if(accounts[i].investment_id == sel.options[sel.selectedIndex].value){
				account_id = accounts[i].account_id
			}
		}
		if(account_id == null){
			$.notify(username2 + " does not have account in this investment" , "warn")
			return
		}
		console.log("deposit user", username)
		console.log("amount", amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount)){
	  		let request = "http://localhost:3000" + "/transactions/deposit"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username,
			      "account_id": account_id,
			      "amount": parseFloat(amount)
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "Deposit successful"){
		  		console.log("successful deposit")
		  		$.notify("Successfully deposited " + amount + " to " + username2, "success")
		  		setTimeout(async ()=>{
		  			console.log("slice", balance_currency.slice(0, -8))
		  			changePageCurrency(balance_currency.slice(0, -8))
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
		let username2 = user.value;
		console.log("withdraw user", username2)
		let accounts = await getAccountsByName(username2)
		let account_id = null
		let curr_balance = null
		for(let i = 0; i < accounts.length; i++){
			if(accounts[i].investment_id == sel.options[sel.selectedIndex].value){
				account_id = accounts[i].account_id
				curr_balance = accounts[i].balance
			}
		}
		if(account_id == null || curr_balance == null){
			$.notify(username2 + " does not have account in this investment" , "warn")
			return
		}
		let checkAmount = curr_balance >= parseFloat(amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && checkAmount){
	  		let request = "http://localhost:3000" + "/transactions/withdrawal"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			      "username": username,
			      "account_id": account_id,
			      "amount": parseFloat(amount)
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "Withdrawal successful"){
		  		console.log("successful withdrawal")
		  		$.notify("Successfully withdrew " + amount + " from " + username2, "success")
		  		setTimeout(async ()=>{
		  			console.log("slice", balance_currency.slice(0, -8))
		  			changePageCurrency(balance_currency.slice(0, -8))
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
			$.notify("Withdrawal amount exceeds balance!", "warn")
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
		let username1 = user1.value;
		let user2 = document.getElementById("userSearch4")
		let username2 = user2.value;
		console.log("username", username)
		console.log("from", username1, "to", username2)
		let accounts = await getAccountsByName(username1)
		let account_id = null
		let curr_balance = null
		for(let i = 0; i < accounts.length; i++){
			if(accounts[i].investment_id == sel.options[sel.selectedIndex].value){
				account_id = accounts[i].account_id
				curr_balance = accounts[i].balance
			}
		}
		if(account_id == null || curr_balance == null){
			$.notify(username2 + " does not have account in this investment" , "warn")
			return
		}
		let checkAmount = curr_balance >= parseFloat(amount)
		if(amount != null && amount != undefined && amount != "" && !isNaN(amount) && checkAmount){
			let request = "http://localhost:3000" + "/transactions/transfer"
			let response = await fetch(request, {
			    method: "POST",
			    mode: "cors",
			    body: JSON.stringify({
			        "amount": parseFloat(amount),
					"username":username,
					"sender": username1,
					"recipient":username2,
					"investment_id": sel.options[sel.selectedIndex].value
			    }), // string or object
			    headers: {
			      'Content-Type': "application/json"
			    }
		  	});
		  	let resp_json = await response.json()
		  	if(resp_json.code == "transfer amount successful"){
		  		$.notify("Successfully transfered " + amount + " from " + username1 + " to " + username2, "success")
		  		setTimeout(async ()=>{
			  			changePageCurrency(balance_currency.slice(0, -8))
			  			setTimeout(async ()=>{
			  			console.log("updating table")
			  			updateUserTable()
			  		}, 1000)
			  	}, 1000)
		  	}else{
		  		alert(resp_json.msg)
		  	}
		  }
		  else if(!checkAmount && amount != "" && amount != null){
		  	$.notify("Transfer amount exceeds balance!", "warn")
			alert("Transfer amount exceeds balance!")
			console.log("invalid amount")
		  }
		  else{
		  	alert("Input is not a number!")
			console.log("not number!")
		  }
		
	}
  
}
jQuery(document).ready(function($){
main()
})
