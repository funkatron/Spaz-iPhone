function getAccounts() {
	
	// Edit button
	var editbutton = Titanium.UI.createButton({
		title:'Edit',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
	});
	editbutton.addEventListener('click',function(){
		editAccounts();
	});
	Titanium.UI.currentWindow.setRightNavButton(editbutton);
	
	// Set option container height and rowCount
	var rc = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
	var rowCount = rc.field(0);
	rc.close();
	var height = 50 + rowCount*50;
	$("#acontainer").animate({
		'height':height,
		'width':'300px',
	}, 1000);

	// Get Account Info
	var text = '';
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
	// Public Timeline button
	text += "<div id='public' class='option'><img src='images/twitter.png' class='optleftimg'/><div class='label'>Public Timeline</div>" +
			"<img src='images/arrow_gray.png' class='optendimg'/></div>";
	// Display
	$("#acontainer").html(text);

	// Login
	$(".option").bind('click',function(){
		// Public Timeline button
		if ($(this).is("#public")) {
			props.setBool('loggedIn',false);
			props.setInt('inboxMode',3);
			props.setInt('clientMode',0);
			Titanium.UI.currentWindow.close();
		}
		// Account button
		else {
			// Get info for selected account
			var account = db.execute('SELECT * FROM ACCOUNTS WHERE ACCOUNT=?',$(this).children(".label").text());
			var name = account.fieldByName('account');
			var pass = account.fieldByName('password');
			var client = account.fieldByName('client');
			account.close();
		
			// Attempt login
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
					// Account verified, set globals
					props.setBool('loggedIn',true);
					props.setBool('accountChangeAll',true);
					props.setBool('accountChangeReplies',true);
					props.setBool('accountChangeDMs',true);
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
	donebutton.addEventListener('click',function(){
		getAccounts();
	});
	Titanium.UI.currentWindow.setRightNavButton(donebutton);
	
	// Set option container height and rowCount
	var rc = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
	var rowCount = rc.field(0);
	rc.close();
	var height = 50 + rowCount*50;
	$("#acontainer").animate({
		'height':height,
		'width':'260px',
	}, 1000);

	// Get Account Info
	var text = '';
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
	accounts.close();
	// Add New Account Button
	text += "<img src='images/add.png' class='editicon add'/><div id='newaccount' class='option'><div id='newaccounttext' class='label'>+ Add New Account</div>" + 
			"<img src='images/arrow_gray.png' class='optendimg'/></div>";
	// Display
	$("#acontainer").html(text);

	// Delete buttons
	$(".del").bind('click',function(){
		var accName = $(this).next(".option").children(".label").text();
		var del = Titanium.UI.createAlertDialog({
			title:'Are you sure you want to delete account '+accName+'?',
			buttonNames: ['OK', 'Cancel'],
		});
		del.addEventListener('click',function(k){
			if (k.index == 0) {
				db.execute("DELETE FROM ACCOUNTS WHERE ACCOUNT=?",accName);
				// If deleted account is currently signed in, log out
				if (props.getBool('loggedIn') == true && props.getString('username') == accName) {
					props.setBool('loggedIn',false);
					props.setInt('inboxMode',3);
					props.setInt('clientMode',0);
				}
				getAccounts();
			}
		});
		del.show();
	});
	
	// Add button
	$(".add").bind('click',function(){
		props.setInt('accountMode',0);
		Titanium.UI.createWindow({
			url:'newaccount.html',
			barColor:'#423721',
		}).open();
	});

	// Edit account
	$(".option").bind('click',function(){
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
	db = Titanium.Database.open('mydb');
	
	// Check for internet
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	if (Titanium.Network.online == false) {
		Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
	}
	
	getAccounts(); // Call on load
	
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		getAccounts();	// Call on focus
	});
};