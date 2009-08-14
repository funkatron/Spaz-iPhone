window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	db = Titanium.Database.open('mydb');
	var accountMode = props.getInt('accountMode');
	var accName;
	var name = '';
	var pass = '';
	var client;
	var isDefault = false;
	$("#checked").css("visibility","hidden");
	$("#unchecked").css("visibility","visible");
	if (accountMode == 0) {	//New account
		$("#tcheck").css("visibility","hidden");
		$("#icheck").css("visibility","hidden");
	}
	else if (accountMode == 1) {	//Edit existing account
		Titanium.UI.currentWindow.setTitle('Edit Account');
		accName = props.getString('accName');
		var accounts = db.execute("SELECT * FROM ACCOUNTS");
		while (accounts.isValidRow()) {
			if (accounts.fieldByName('account') == accName) {break;}
			accounts.next();
		}
		name = accounts.fieldByName('account');
		client = accounts.fieldByName('client');
		//Initialize default box
		if (accounts.fieldByName('def') == 1) {
			isDefault = true;
			$("#checked").css("visibility","visible");
			$("#unchecked").css("visibility","hidden");
		}
		accounts.close();
		if (client == 0) {
			$("#tcheck").css("visibility","visible");
			$("#icheck").css("visibility","hidden");
		}
		else if (client == 1) {
			$("#tcheck").css("visibility","hidden");
			$("#icheck").css("visibility","visible");
		}
	}

	
	//Username field object
	var userfield = Titanium.UI.createTextField({
		id:'userfield',
		color:'#000',
		backgroundColor:'#fff',
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		enableReturnKey:true,
		keyboardType:Titanium.UI.KEYBOARD_ASCII,
		autocorrect:false,
		value:name,
		hintText:'User Name',
		clearOnEdit:true,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	userfield.addEventListener('change',function(e){
		name = e.value;
	});
	userfield.addEventListener('return',function(e){
		userfield.blur();
	});
	
	//Password field object
	var passfield = Titanium.UI.createTextField({
		id:'passfield',
		color:'#000',
		backgroundColor:'#fff',
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		enableReturnKey:true,
		keyboardType:Titanium.UI.KEYBOARD_ASCII,
		autocorrect:false,
		passwordMask:true,
		hintText:'Password',
		clearOnEdit:true,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	passfield.addEventListener('change',function(e){
		pass = e.value;
	});
	passfield.addEventListener('return',function(e){
		passfield.blur();
	});
	
	//Verify button
	var verifybutton = Titanium.UI.createButton({
		id:'verifybutton',
		backgroundImage:'images/green_butt.png',
		title:'Verify & Save Account',
		color:'#fff'
	});
	verifybutton.addEventListener('click',function(e){
		if (name == '') {
			Titanium.UI.createAlertDialog({
	            title: "You must enter a user name!",
	            buttonNames: ['OK'],
	        }).show();
		}
		else if (pass == '') {
			Titanium.UI.createAlertDialog({
	            title: "You must enter a password!",
	            buttonNames: ['OK'],
	        }).show();
		}
		else if (client != 0 && client != 1) {
			Titanium.UI.createAlertDialog({
	            title: "You must select a client!",
	            buttonNames: ['OK'],
	        }).show();
		}
		else {
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
		                title: "Not a valid account",
		                message: "Please check account data",
		                buttonNames: ['OK'],
		            }).show();
				}
				else {
					//Account verified, set loggedIn, account globals to true
					Titanium.UI.createAlertDialog({
			            title: "Account created!",
						message: "You've been signed in",
			            buttonNames: ['OK'],
			        }).show();
					props.setBool('loggedIn',true);
					props.setInt('clientMode',client);
					props.setString('username',name);
					props.setString('password',pass);
					if (isDefault == false) {
						if (accountMode == 1) {
							db.execute("UPDATE ACCOUNTS SET CLIENT=?,ACCOUNT=?,PASSWORD=?,DEF=? WHERE ACCOUNT='"+accName+"'",client,name,pass,0);
						}
						else {
							db.execute('INSERT INTO ACCOUNTS (CLIENT, ACCOUNT, PASSWORD, DEF) VALUES(?,?,?,?)',client,name,pass,0);
						}
						Titanium.UI.currentWindow.close();
					}
					else if (isDefault == true) {
						var rows = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
						var rowCount = rows.field(0);
						rows.close();
						var accounts2 = db.execute('SELECT * FROM ACCOUNTS');
						var alreadyDefault = false;
						for (var i = 0; i < rowCount; i++) {
							if (accounts2.fieldByName('def') == 1) {
								alreadyDefault = true;
								break;
							}
							accounts2.next();
						}
						if (alreadyDefault == true) {	//There is an existing default account
							if (accounts2.fieldByName('account') == accName) {	//Account replacing itself, don't need to query
								db.execute("UPDATE ACCOUNTS SET CLIENT=?,ACCOUNT=?,PASSWORD=?,DEF=? WHERE ACCOUNT='"+accName+"'",client,name,pass,1);
								accounts2.close();
								Titanium.UI.currentWindow.close();
							}
							else {
								var replace = Titanium.UI.createAlertDialog({
						            title: "Replace "+accounts2.fieldByName('account')+" as default account?",
						            buttonNames: ['OK','Cancel'],
						        });
								replace.addEventListener('click',function(k){
									if (k.index == 0) {
										//Make old default account non-default
										var tempname = accounts2.fieldByName('account');
										db.execute("UPDATE ACCOUNTS SET DEF=? WHERE ACCOUNT='"+tempname+"'",0);
										//Create account as normal
										if (accountMode == 1) {
											db.execute("UPDATE ACCOUNTS SET CLIENT=?,ACCOUNT=?,PASSWORD=?,DEF=? WHERE ACCOUNT='"+accName+"'",client,name,pass,1);
										}
										else {
											db.execute('INSERT INTO ACCOUNTS (CLIENT, ACCOUNT, PASSWORD, DEF) VALUES(?,?,?,?)',client,name,pass,1);
										}
										accounts2.close();
										Titanium.UI.currentWindow.close();
									}
									else {
										accounts2.close();
									}
								});
								replace.show();
							}
						}
						else if (alreadyDefault == false) {	//No existing default account
							if (accountMode == 1) {
								db.execute("UPDATE ACCOUNTS SET CLIENT=?,ACCOUNT=?,PASSWORD=?,DEF=? WHERE ACCOUNT='"+accName+"'",client,name,pass,1);
							}
							else {
								db.execute('INSERT INTO ACCOUNTS (CLIENT, ACCOUNT, PASSWORD, DEF) VALUES(?,?,?,?)',client,name,pass,1);
							}
							accounts2.close();
							Titanium.UI.currentWindow.close();
						}
					}
				}
			};
			xhr.open("GET",request);
			xhr.send();
		}
	});
	
	//Twitter/Identica option box
	$(".option").bind('click',function(e){
		if ($(this).is("#twitter")) {
			$("#tcheck").css("visibility","visible");
			$("#icheck").css("visibility","hidden");
			client = 0;
		}
		else {
			$("#tcheck").css("visibility","hidden");
			$("#icheck").css("visibility","visible");
			client = 1;
		}
	});
	
	//Default check box
	$("#checkbox").bind('click',function(e){
		if (isDefault == false) {
			$("#checked").css("visibility","visible");
			$("#unchecked").css("visibility","hidden");
			isDefault = true;
		}
		else if (isDefault == true) {
			$("#checked").css("visibility","hidden");
			$("#unchecked").css("visibility","visible");
			isDefault = false;
		}
	});
	
};