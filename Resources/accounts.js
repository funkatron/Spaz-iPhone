function getAccounts() {	//Main function, called below
	
	// Edit button
	var editbutton = Titanium.UI.createButton({
		title:'Edit',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
	});
	editbutton.addEventListener('click',function(e){
		editAccounts();
	});
	Titanium.UI.currentWindow.setRightNavButton(editbutton);
	
	// Set option container height and rowCount
	var rowCount = db.execute('SELECT COUNT(*) FROM ACCOUNTS').field(0);
	var height = 50 + rowCount*50;
	$("#acontainer").animate({
		'height':height,
		'width':'300px',
	}, 1000);

	// Display Account Info
	var text = '';
	// Display each account button
	var accounts = db.execute('SELECT * FROM ACCOUNTS');
	for (var i = 0; i < rowCount; i++) {
		text += "<div class='option'><img src='";
		if (accounts.fieldByName('client') == 0) {text += "images/twitter.png";}
		else if (accounts.fieldByName('client') == 1) {text += "images/identica.png";}
		text += "' class='optleftimg'/><div class='label'>" + 
			accounts.fieldByName('account') +
		"</div>";
		if (accounts.fieldByName('def') == 1) {
			text += "<div class='label2'>(default)</div>";
		}
		text += "<img src='images/arrow_gray.png' class='optendimg'/></div><div class='divider'></div>";
		accounts.next();
	}
	accounts.close();
	// Display Public Timeline button
	text += "<div id='public' class='option'><img src='images/twitter.png' class='optleftimg'/><div class='label'>Public Timeline</div>" +
			"<img src='images/arrow_gray.png' class='optendimg'/></div>";
	// Set html
	$("#acontainer").html(text);

	// Login
	$(".option").bind('click',function(e){
		// Public Timeline button
		if ($(this).is("#public")) {
			props.setBool('loggedIn',false);
			props.setInt('clientMode',0);
			Titanium.UI.currentWindow.close();
		}
		else {
			//Get info for selected account
			var accounts2 = db.execute('SELECT * FROM ACCOUNTS');
			while (accounts2.isValidRow()) {
				if (accounts2.fieldByName('account') == $(this).children(".label").text()) {break;}
				accounts2.next();
			}
			var name = accounts2.fieldByName('account');
			var pass = accounts2.fieldByName('password');
			var client = accounts2.fieldByName('client');
			accounts2.close();
		
			//Attempt login
			var request = '';
			if (client == 0) {
				request = "http://"+name+":"+pass+"@twitter.com/account/verify_credentials.json";
			} else {
				request = "http://"+name+":"+pass+"@identi.ca/api/account/verify_credentials.json";
			}
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onload = function() {
				var data = JSON.parse(this.responseText);
				if (data.error == "Could not authenticate you.") {
					Titanium.UI.createAlertDialog({
		                title: "Login failed",
		                message: "Could not authenticate you. Please check account data.",
		                buttonNames: ['OK'],
		            }).show();
				}
				else {
					//Account verified, set loggedIn, account globals to true
					props.setBool('loggedIn',true);
					props.setString('username',name);
					props.setString('password',pass);
					props.setInt('clientMode',client);
					props.setInt('inboxMode',0);
					Titanium.UI.currentWindow.close();
				}
			};
			xhr.open("GET",request);
			xhr.send();
		}
	});
};

function editAccounts() {

	// Done button
	var donebutton = Titanium.UI.createButton({
		title:'Done',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
	});
	donebutton.addEventListener('click',function(e){
		getAccounts();
	});
	Titanium.UI.currentWindow.setRightNavButton(donebutton);
	
	//Set option container height
	var rowCount = db.execute('SELECT COUNT(*) FROM ACCOUNTS').field(0);
	var height = 50 + rowCount*50;
	$("#acontainer").animate({
		'height':height,
		'width':'260px',
	}, 1000);

	//Display Account Info
	var text = '';
	// Display each account button
	var accounts = db.execute('SELECT * FROM ACCOUNTS');
	for (var i = 0; i < rowCount; i++) {
		text += "<img src='images/delete.png' class='editicon del'/><div class='option'><img src='";
		if (accounts.fieldByName('client') == 0) {text += "images/twitter.png";}
		else if (accounts.fieldByName('client') == 1) {text += "images/identica.png";}
		text += "' class='optleftimg'/><div class='label'>" +
			accounts.fieldByName('account') +
		"</div>";
		if (accounts.fieldByName('def') == 1) {
			text += "<div class='label2'>(default)</div>";
		}
		text += "<img src='images/list_edit_icon.png' class='optendimg'/></div><div class='editdivider'></div>";
		accounts.next();
	}
	text += "<img src='images/add.png' class='editicon add'/><div id='newaccount' class='option'><div id='newaccounttext' class='label'>+ Add New Account</div>" + 
			"<img src='images/arrow_gray.png' class='optendimg'/></div>";
	$("#acontainer").html(text);
	accounts.close();

	//Delete buttons
	$(".del").bind('click',function(e){
		var accName = $(this).next(".option").children(".label").text();
		var del = Titanium.UI.createAlertDialog({
			title:'Are you sure you want to delete account '+accName+'?',
			buttonNames: ['OK', 'Cancel'],
		});
		del.addEventListener('click',function(k){
			if (k.index == 0) {
				db.execute("DELETE FROM ACCOUNTS WHERE ACCOUNT='"+accName+"'");
				getAccounts();
			}
		});
		del.show();
	});
	
	//Add button
	$(".add").bind('click',function(e){
		props.setInt('accountMode',0);
		Titanium.UI.createWindow({
			url:'newaccount.html',
			barColor:'#423721',
		}).open();
	});

	//Login
	$(".option").bind('click',function(e){
		if ($(this).is("#newaccount")) {
			props.setInt('accountMode',0);
			Titanium.UI.createWindow({
				url:'newaccount.html',
				barColor:'#423721',
			}).open();
		}
		else {
			props.setInt('accountMode',1);
			props.setString('accName',$(this).children(".label").text());
			Titanium.UI.createWindow({
				url:'newaccount.html',
				barColor:'#423721',
			}).open();
		}
	});
};

window.onload = function() {
	
	// Initialize
	props = Titanium.App.Properties;
	db = Titanium.Database.open('fake');
	db.close();
	db._TOKEN = props.getString('dbtoken');
	
	getAccounts(); //call on load
	
	//Refresh page on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		
		// Close if account just created
		if (props.getBool('accountCreated') == true) {
			//Titanium.UI.currentWindow.close();	// For now, doesn't work
		}
		getAccounts();	//call on focus
		
	});
	
	// Titanium.UI.currentWindow.addEventListener('unfocused',function(){
	// 	db.close();
	// });
};