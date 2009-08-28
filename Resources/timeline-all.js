function getTimelineAll() {
	
	// Check for internet
	if (Titanium.Network.online == false) {
		Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
	}
	
	if (props.getBool('accountChangeAll') == true) {
		$("#tcontainer").empty();
	}
	var name = props.getString('username');
	var pass = props.getString('password');
	var client = props.getInt('clientMode');
	Titanium.UI.currentWindow.setTitle(name);
	var request = "";
	var dbquery = db.execute("SELECT TIMELINE FROM ACCOUNTS WHERE ACCOUNT=?",name);
	var cache = decodeURIComponent(dbquery.field(0));
	dbquery.close();
	$("#tcontainer").html(cache);
	if (cache == '') {
		var ind = Titanium.UI.createActivityIndicator({
			id:'indicator',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			color:'#fff'
		});
		ind.setMessage('Loading...');
		ind.show();
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/statuses/friends_timeline.json?count=50";
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/statuses/friends_timeline.json?count=50";
		}
	}
	else {
		var lastID = $(".status:first").attr("id");
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/statuses/friends_timeline.json?count=50&since_id="+lastID;
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/statuses/friends_timeline.json?count=50&since_id="+lastID;
		}
		// Update timestamps on cached tweets
		$(".status").each(function(i){
			$(this).children(".usrtime").html(humane_date($(this).attr("timestamp")));
		});
	}
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function() {
		var data = JSON.parse(this.responseText);
		var text = '';
		var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)[\w\/]/gi;
		var mention = /@\w{1,15}/gi;
		var dbquery = db.execute('SELECT TIMELINECOUNT FROM ACCOUNTS WHERE ACCOUNT=?',name);
		var timelineCount = dbquery.field(0);
		dbquery.close();
		$.each(data, function(i,tweet){
			timelineCount++;
		});
		var thisCount = 0;
		$.each(data, function(i,tweet){
			text += "<div id='" +
				tweet.id +
			"' timestamp='" +
				tweet.created_at +
			"' class='status ";
				if (props.getBool('loggedIn') == true && props.getString('username') == tweet.user.screen_name) {text += "self";}
				else if ((timelineCount-thisCount) % 2 == 0) {text += "even";}
				else if ((timelineCount-thisCount) % 2 == 1) {text += "odd";}
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
			thisCount++;
		});
		if (cache == '') {
			ind.hide();
		}
		text += $("#tcontainer").html();
		$("#tcontainer").empty();
		$("#tcontainer").html(text);
		if (thisCount > 0) {
			badge += thisCount;
			tabs[0].setBadge(badge);
		}
		db.execute("UPDATE ACCOUNTS SET TIMELINE=?,TIMELINECOUNT=? WHERE ACCOUNT=?",encodeURIComponent(text),timelineCount,name);
		//User detail
		$(".usrimg").bind('click',function(){
			//Set user ID global
			props.setString('screenname',$(this).siblings(".usrname").html());
			//User detail view
			Titanium.UI.createWindow({
				url:'user.html',
				barColor:'#423721',
			}).open();
		});
		//Message detail
		$(".usrmsg").bind('click',function(){
			//Set message ID global
			props.setString('msgID',$(this).parent(".status").attr("id"));
			//Message detail view
			Titanium.UI.createWindow({
				url:'message.html',
				barColor:'#423721',
			}).open();
		});
		//Links
		$("lnk").bind('click',function(e){
			Titanium.Platform.openURL($(this).text());
			e.stopPropagation();
			return false;
		});
		//Mentions
		$("usr").bind('click',function(e){
			e.stopPropagation();
			//Set user ID global
			props.setString('screenname',$(this).text().substring(1));
			//User detail view
			Titanium.UI.createWindow({
				url:'user.html',
				barColor:'#423721',
			}).open();
			return false;
		});
	};
	xhr.open("GET",request);
	xhr.send();
};

window.onload = function() {
	
	// Initialize
	props = Titanium.App.Properties;
	db = Titanium.Database.open('mydb');
	tabs = Titanium.UI.getTabs();
	badge = 0;
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	
	// Refresh button
	var refreshbutton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
	});
	refreshbutton.addEventListener('click',function(){
		getTimelineAll();
	});
	Titanium.UI.currentWindow.setRightNavButton(refreshbutton);
	
	//Shake refresh event
	Titanium.Gesture.addEventListener('shake',function(){
		getTimelineAll();
	});
	
	setInterval("getTimelineAll()",60000);
	
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		if (props.getBool('accountChangeAll') == true) {
			getTimelineAll();
			props.setBool('accountChangeAll',false);
		}
	});
	
	Titanium.UI.currentWindow.addEventListener('unfocused',function(){
		tabs[0].setBadge(null);
		badge = 0;
	});
	
};