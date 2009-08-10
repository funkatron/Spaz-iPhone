function editAccounts() {

	//Set option container height
	var rows = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
	var rowCount = rows.field(0);
	rows.close();
	var height = 50 + rowCount*50;
	
	$("#econtainer").css("height",height);

	//Display Account Info
	var text = '';
	var accounts = db.execute('SELECT * FROM ACCOUNTS');
	for (var i = 0; i < rowCount; i++) {
	//while (accounts.isValidRow()) {
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
	$("#econtainer").html(text);
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
				Titanium.UI.createAlertDialog({
		            title: "Account deleted!",
		            buttonNames: ['OK'],
		        }).show();
				Titanium.UI.currentWindow.close();
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
	
	//Initialize
	props = Titanium.App.Properties;
	db = Titanium.Database.open('mydb');
	
	editAccounts();	//call on load
	
	//Refresh page on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		editAccounts();	//call on focus
	});
			
};