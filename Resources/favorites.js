function getFavorites() {
	
	$("#fcontainer").empty();
	// Activity Indicator
	var ind = Titanium.UI.createActivityIndicator({
		id:'indicator',
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		color:'#fff'
	});
	ind.setMessage('Loading...');
	ind.show();
	var loggedIn = props.getBool('loggedIn');
	if (loggedIn == true) {
		// Get user data
		var name = props.getString('username');
		var pass = props.getString('password');
		var client = props.getInt('clientMode');
		var dbquery = db.execute("SELECT FAVORITES FROM ACCOUNTS WHERE ACCOUNT=?",name);
		var cache = decodeURIComponent(dbquery.field(0));
		dbquery.close();
		// If they exist, display cached favorites
		if (cache != '') {
			ind.hide();
			$("#fcontainer").html(cache);
		}
		// Get favorites
		var request = '';
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/favorites.json";
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/favorites.json";
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var text = '';
			var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)[\w\/]/gi;
			var mention = /@\w{1,15}/gi;
			$.each(data, function(i,tweet){
				text += "<div id='" +
					tweet.id +
				"' timestamp='" +
					tweet.created_at +
				"' class='status ";
					if (props.getBool('loggedIn') == true && props.getString('username') == tweet.user.screen_name) {text += "self";}
					else if (i % 2 == 0) {text += "even";}
					else if (i % 2 == 1) {text += "odd";}
				text += "'><img src='" +
					tweet.user.profile_image_url +
				"' class='usrimg'/><div class='usrname'>" +
					tweet.user.screen_name +
				"</div><div class='usrtime'>" +
					humane_date(tweet.created_at) +
				"</div><div class='usrmsg'>" +
					tweet.text.replace(link, function(exp) {
							return ("<lnk>"+exp+"</lnk>");
						}).replace(mention, function(exp) {
							return ("<usr>"+exp+"</usr>");
						}) +
				"</div></div>";
			});
			ind.hide();
			// Display & cache favorites
			$("#fcontainer").html(text);
			db.execute("UPDATE ACCOUNTS SET FAVORITES=? WHERE ACCOUNT=?",encodeURIComponent(text),name);
			// User detail
			$(".usrimg").bind('click',function(e){
				// Set message screenname global
				props.setString('screenname',$(this).siblings(".usrname").text());
				Titanium.UI.createWindow({
					url:'user.html',
					barColor:'#423721',
				}).open();
			});
			// Message detail
			$(".usrmsg").bind('click',function(e){
				// Set message ID global
				props.setString('msgID',$(this).parent(".status").attr("id"));
				props.setBool('isFavorite',true);
				Titanium.UI.createWindow({
					url:'message.html',
					barColor:'#423721',
				}).open();
			});
			// Links
			$("lnk").bind('click',function(e){
				Titanium.Platform.openURL($(this).text());
				e.stopPropagation();
				return false;
			});
			// Mentions
			$("usr").bind('click',function(e){
				e.stopPropagation();
				//Set user ID global
				props.setString('screenname',$(this).text().substring(1));
				Titanium.UI.createWindow({
					url:'user.html',
					barColor:'#423721',
				}).open();
				return false;
			});
		}
		xhr.open("GET",request);
		xhr.send();
	}
	else {
		ind.hide();
		$("#fcontainer").html("<div class='header'>Must be logged in.</div>");
	}
};


window.onload = function() {
	
	// Initialize
	props = Titanium.App.Properties;
	db = Titanium.Database.open('mydb');
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	
	getFavorites();	// Call on load
		
	// Refresh page on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		// Check for internet
		if (Titanium.Network.online == false) {
			Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
		}
		getFavorites();	// Call on focus
	});
};