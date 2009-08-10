function getAccounts() {	//Main function, called below
	
	//Edit button
	var editbutton = Titanium.UI.createButton({
		title:'Edit',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
	});
	editbutton.addEventListener('click',function(e){
		Titanium.UI.createWindow({
			url:'editaccounts.html',
			barColor:'#423721',
		}).open();
	});
	Titanium.UI.currentWindow.setRightNavButton(editbutton);
	
	loggedIn = props.getBool('loggedIn');
	
	//Set option container height
	var height;
	if (loggedIn == false) {height = 50;}
	else if (loggedIn == true) {height = 100;}
	var rows = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
	var rowCount = rows.field(0);
	rows.close();
	height += rowCount*50;
	$("#acontainer").css("height",height);

	//Display Account Info
	var text = '';
	var accounts = db.execute('SELECT * FROM ACCOUNTS');
	for (var i = 0; i < rowCount; i++) {
	//while (accounts.isValidRow()) {
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
	if (loggedIn == true) {
		text += "<div id='signout' class='option'><div id='signouttext' class='label'>- Sign Out</div>" +
				"<img src='images/arrow_gray.png' class='optendimg'/></div><div class='divider'></div>";
	}
	text += "<div id='newaccount' class='option'><div id='newaccounttext' class='label'>+ Add New Account</div>" + 
			"<img src='images/arrow_gray.png' class='optendimg'/></div>";
	$("#acontainer").html(text);
	accounts.close();

	//Login
	$(".option").bind('click',function(e){
		if ($(this).is("#signout")) {
			props.setBool('loggedIn',false);
			Titanium.UI.createAlertDialog({
                title: "Signed out!",
                buttonNames: ['OK'],
            }).show();
			Titanium.UI.currentWindow.close();
		}
		else if ($(this).is("#newaccount")) {
			props.setInt('accountMode',0);
			Titanium.UI.createWindow({
				url:'newaccount.html',
				barColor:'#423721',
			}).open();
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
			accounts2.close();
		
			//Attempt login
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
					Titanium.UI.createAlertDialog({
		                title: "Login successful!",
		                buttonNames: ['OK'],
		            }).show();
					Titanium.UI.currentWindow.close();
				}
			};
			xhr.open("GET","http://"+name+":"+pass+"@twitter.com/account/verify_credentials.json");
			xhr.send();
		}
	});
};

window.onload = function() {
	
	props = Titanium.App.Properties;
	db = Titanium.Database.open('mydb');	//global for 'mydb'
	//db.remove();
	
	//If first load of accounts.js, initialize database, and try default login
	if (props.getBool('initial') == true) {
		
		props.setBool('initial',false);
		
		//Initialize database
		//CLIENT: 0 = Twitter, 1 = Identica
		//DEFAULT: 0 = NO, 1 = YES
		//db.execute('DROP TABLE ACCOUNTS');
		db.execute('CREATE TABLE IF NOT EXISTS ACCOUNTS (CLIENT INTEGER, ACCOUNT TEXT, PASSWORD TEXT, DEF INTEGER)');
		//Add one temp account until bug with 0 entries fixed
		//db.execute('INSERT INTO ACCOUNTS (CLIENT, ACCOUNT, PASSWORD, DEF) VALUES(?,?,?,?)',0,'asdf','zxcv',0);
	
		//Login default account if exists
		var accs = db.execute('SELECT * FROM ACCOUNTS');
		var existsDefault = false;
		var rows = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
		var rowCount = rows.field(0);
		rows.close();
		for (var i = 0; i < rowCount; i++) {
		//while (accs.isValidRow()) {
			if (accs.fieldByName('def') == 1) {
				existsDefault = true;
				break;
			}
			accs.next();
		}
		if (existsDefault == true) {
			var name = accs.fieldByName('account');
			var pass = accs.fieldByName('password');
			//Attempt login
			var xhr2 = Titanium.Network.createHTTPClient();
			xhr2.onload = function() {
				var data = JSON.parse(this.responseText);
				if (data.error == "Could not authenticate you.") {
					props.setInt("defaultLoginSuccess",1);	//1 = failed
				}
				else {
					//Account verified, set loggedIn, account globals to true
					props.setBool('loggedIn',true);
					props.setString('username',name);
					props.setString('password',pass);
					props.setInt("defaultLoginSuccess",2);	//2 = success
				}
			};
			xhr2.open("GET","http://"+name+":"+pass+"@twitter.com/account/verify_credentials.json");
			xhr2.send();
		}
		else {
			props.setInt("defaultLoginSuccess",0);
		}
		accs.close();
	}
	
	getAccounts(); //call on load
	
	//Refresh page on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		
		//Display message for default login, placed here because message should display when user closes splash screen
		var defaultLoginSuccess = props.getInt("defaultLoginSuccess");
		if (defaultLoginSuccess == 0) {}
		else if (defaultLoginSuccess == 1) {
			props.setInt("defaultLoginSuccess",0);
			Titanium.UI.createAlertDialog({
	            title: "Default Login failed",
	            message: "Could not authenticate you. Please check account data.",
	            buttonNames: ['OK'],
	        }).show();
		}
		else if (defaultLoginSuccess == 2) {
			props.setInt("defaultLoginSuccess",0);
			var success = Titanium.UI.createAlertDialog({
	            title: "Default Login successful!",
	            buttonNames: ['OK'],
	        });
			success.addEventListener('click',function(e) {
				if (e.index == 0) {
					Titanium.UI.currentWindow.close();
				}
			});
			success.show();
		}
		
		getAccounts();	//call on focus
	});
};