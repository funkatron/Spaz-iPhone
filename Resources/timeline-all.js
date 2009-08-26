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
		var count = 0;
		var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)[\w\/]/gi;
		var mention = /@\w{1,15}/gi;
		$.each(data, function(i,tweet){
			text += "<div id='" +
				tweet.id +
			"' timestamp='" +
				tweet.created_at +
			"' class='status'><img src='" +
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
			count++;
		});
		if (cache == '') {
			ind.hide();
		}
		text += $("#tcontainer").html();
		$("#tcontainer").empty();
		$("#tcontainer").html(text);
		$(".status").each(function(i){
			if (props.getBool('loggedIn') == true && props.getString('username') == $(this).children(".usrname").text()) {
				$(this).css("background-image","url('images/BG_red_sliver.png')");
			} else if (i % 2 == 0) {
				$(this).css("background-image","url('images/BG_dark_sliver.png')");
			} else if (i % 2 == 1) {
				$(this).css("background-image","url('images/BG_light_sliver.png')");
			}
		});
		if (count > 0) {
			tabs[0].setBadge(count);
		}
		try {
			db.execute("UPDATE ACCOUNTS SET TIMELINE=? WHERE ACCOUNT=?",encodeURIComponent(text),name);
		} catch(err) {
			Titanium.API.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> error: '+err);
		}
		//User detail
		$(".usrimg").bind('click',function(e){
			//Set user ID global
			props.setString('screenname',$(this).siblings(".usrname").html());
			//User detail view
			Titanium.UI.createWindow({
				url:'user.html',
				barColor:'#423721',
			}).open();
		});
		//Message detail
		$(".usrmsg").bind('click',function(e){
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
			props.setString('link',$(this).text());
			Titanium.UI.createWindow({
				url:'link.html',
				barColor:'#423721',
			}).open();
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
	});
	
};