//Function: Get Timeline
function getTimeline() {
	$("#tcontainer").empty();
	var ind = Titanium.UI.createActivityIndicator({
		id:'indicator',
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		color:'#fff'
	});
	ind.setMessage('Loading...');
	ind.show();
	var request = "";
	var content = "";
	var loggedIn = props.getBool('loggedIn');
	var client = props.getInt('clientMode');
	var mode = props.getInt('inboxMode');
	if (loggedIn == false) {
		Titanium.UI.currentWindow.setTitle("Public Timeline");
		if (client == 0) {
			request = "http://twitter.com/statuses/public_timeline.json?count=50";
		} else {
			request = "http://identi.ca/api/statuses/public_timeline.json?count=50";
		}
	}
	else if (loggedIn == true) {
		var name = props.getString('username');
		var pass = props.getString('password');
		var cache = '';
		Titanium.UI.currentWindow.setTitle(name);
		if (mode == 0) { 	//All
			cache = db.execute("SELECT TIMELINE FROM ACCOUNTS WHERE ACCOUNT='"+name+"'").field(0);
			if (cache == '') {
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/friends_timeline.json?count=50";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/friends_timeline.json?count=50 ";
				}
			}
			else {
				ind.hide();
				$("#tcontainer").html(cache);
				var lastID = $(".status:first").attr("id");
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/friends_timeline.json?count=50&since_id="+lastID;
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/friends_timeline.json?count=50&since_id="+lastID;
				}
			}
		}
		else if (mode == 1) { 	//Replies
			cache = db.execute("SELECT REPLIES FROM ACCOUNTS WHERE ACCOUNT='"+name+"'").field(0);
			if (cache == '') {
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/mentions.json?count=50";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/mentions.json?count=50";
				}
			}
			else {
				ind.hide();
				$("#tcontainer").html(cache);
				var lastID = $(".status:first").attr("id");
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/mentions.json?count=50&since_id="+lastID;
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/mentions.json?count=50&since_id="+lastID;
				}
			}
		}
		else if (mode == 2) { 	//Direct Messages
			cache = db.execute("SELECT DMS FROM ACCOUNTS WHERE ACCOUNT='"+name+"'").field(0);
			if (cache == '') {
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/direct_messages.json?count=50";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/direct_messages.json?count=50";
				}
			}
			else {
				ind.hide();
				$("#tcontainer").html(cache);
				var lastID = $(".status:first").attr("id");
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/direct_messages.json?count=50&since_id="+lastID;
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/direct_messages.json?count=50&since_id="+lastID;
				}
			}
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
		if (mode == 0 || mode == 1) {	//All, Replies
			$.each(data, function(i,tweet){
				text += "<div id='" +
					tweet.id +
				"' timestamp='" +
					tweet.created_at +
				"' class='status' style='background-image:url(\"";
				if (tweet.user.screen_name == props.getString('username')) {
					if (loggedIn == true) {
						{text += "images/BG_red_sliver.png";}
					}
				}
				else if (count % 2 == 0) {text += "images/BG_dark_sliver.png";}
				else if (count % 2 == 1) {text += "images/BG_light_sliver.png";}
				text += "\");'><img src='" +
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
		}
		else if (mode == 2) {	//Direct Messages
			$.each(data, function(i,tweet){
				text += "<div id='" +
					tweet.id +
				"' timestamp='" +
					tweet.created_at +
				"' class='status' style='background-image:url(\"";
				if (count % 2 == 0) {text += "images/BG_dark_sliver.png";}
				else if (count % 2 == 1) {text += "images/BG_light_sliver.png";}
				text += "\");'><img src='" +
					tweet.sender.profile_image_url + 
				"' class='usrimg'/><div class='usrname'>" +
					tweet.sender_screen_name + 
				"</div><div class='usrtime'>" +
					humane_date(tweet.created_at) +
				"</div><div class='DMmsg'>" +
					tweet.text.replace(link, function(exp) {
						return ("<lnk>"+exp+"</lnk>");
					}).replace(mention, function(exp) {
						return ("<usr>"+exp+"</usr>");
					}) +
				"</div></div>";
				count++;
			});
		}
		ind.hide();
		$("#tcontainer").prepend(text);
		if (loggedIn == true) {
			if (mode == 0) {
				db.execute("UPDATE ACCOUNTS SET TIMELINE=? WHERE ACCOUNT='"+name+"'",$("#tcontainer").html());
			}
			if (mode == 1) {
				db.execute("UPDATE ACCOUNTS SET REPLIES=? WHERE ACCOUNT='"+name+"'",$("#tcontainer").html());
			}
			if (mode == 2) {
				db.execute("UPDATE ACCOUNTS SET DMS=? WHERE ACCOUNT='"+name+"'",$("#tcontainer").html());
			}
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
		//Direct Message detail
		$(".DMmsg").bind('click',function(e){
			//Set message ID global
			props.setString('msgID',$(this).parent(".status").attr("id"));
			//Message detail view
			Titanium.UI.createWindow({
				url:'DM.html',
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
	
	//Initialize globals (timeline.js only loads once)
	props = Titanium.App.Properties;	//pointer to globals
	props.setBool('loggedIn', false);
	props.setBool('accountCreated',false);
	props.setString('username','');
	props.setString('password','');
	props.setString('searchQuery','');
	props.setString('screenname','');
	props.setString('msgID','');
	props.setString('postHeader','');
	props.setString('initialPost','');
	props.setString('accName','');
	props.setString('dbtoken','');
	props.setInt('clientMode',0); // 0 = Twitter, 1 = Identi.ca
	props.setInt('inboxMode',0);
	props.setInt('postMode',0);
	props.setInt('accountMode',0);
	
	// Check for internet
	if (Titanium.Network.online == false) {
		Titanium.UI.createWindow({
			url:'nointernet.html',
			hideTabBar:true,
		}).open();
	}
	
	//Initialize databse
	//db = Titanium.Database.open('mydb');
	//db.remove();
	db = Titanium.Database.open('mydb');
	props.setString('dbtoken',db._TOKEN);
	//CLIENT: 0 = Twitter, 1 = Identica
	//DEF: 0 = NO, 1 = YES
	//db.execute('DROP TABLE ACCOUNTS');
	db.execute('CREATE TABLE IF NOT EXISTS ACCOUNTS (CLIENT INTEGER, ACCOUNT TEXT, PASSWORD TEXT, DEF INTEGER, TIMELINE TEXT, REPLIES TEXT, DMS TEXT, FAVORITES TEXT)');
	
	//Login default account if exists
	var initialState; // 0 = No accounts, 1 = Accounts but no default, 2 = Default login success, 3 = Default login failure
	var rowCount = db.execute('SELECT COUNT(*) FROM ACCOUNTS').field(0);
	if (rowCount == 0) {
		initialState = 0;
	}
	else {
		// Check for default account
		var existsDefault = false;
		var accs = db.execute('SELECT * FROM ACCOUNTS');
		for (var i = 0; i < rowCount; i++) {
			if (accs.fieldByName('def') == 1) {
				existsDefault = true;
				break;
			}
			accs.next();
		}
		if (existsDefault == true) {
			var name = accs.fieldByName('account');
			var pass = accs.fieldByName('password');
			var client = accs.fieldByName('client');
			//Attempt login
			var request = '';
			if (client == 0) {
				request = "http://"+name+":"+pass+"@twitter.com/account/verify_credentials.json";
			} else {
				request = "http://"+name+":"+pass+"@identi.ca/api/account/verify_credentials.json";
			}
			var xhr2 = Titanium.Network.createHTTPClient();
			xhr2.onload = function() {
				var data = JSON.parse(this.responseText);
				if (data.error == "Could not authenticate you.") {	//Default account login failed
					initialState = 3;	//3 = failed
				}
				else {	//Account verified, set loggedIn, account globals to true
					props.setBool('loggedIn',true);
					props.setString('username',name);
					props.setString('password',pass);
					props.setInt('clientMode',client);
					initialState = 2;	//2 = success
					//Timeline Tabbed bar (created on refresh to properly set index)
					var tabbar = Titanium.UI.createTabbedBar({
						index:props.getInt('inboxMode'),
						labels:['All','Replies','DM\'s'],
						backgroundColor:'#423721'
					});
					tabbar.addEventListener('click',function(e){
						props.setInt('inboxMode',e.index);
						getTimeline();
					});
					Titanium.UI.currentWindow.setToolbar([tabbar,flexSpace,newmsgbutton]);
				}
			};
			xhr2.open("GET",request);
			xhr2.send();
		}
		else {
			initialState = 1;
		}
		accs.close();
	}
	
	
	//Display message for default login, placed here because message should display when user closes splash screen
	if (initialState == 0) {
		// Stack accounts screen on top of timeline window
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open({animated:false});

		// Stack splash screen on top of accounts window (initial window)
		Titanium.UI.createWindow({
			url:'splash.html',
			hideNavBar:true,
			hideTabBar:true,
		}).open({animated:false});
	}
	else if (initialState == 1) {
		// Stack accounts screen on top of timeline window
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open({animated:false});
	}
	else if (initialState == 2) {
	}
	else if (initialState == 3) {
		// Stack accounts screen on top of timeline window
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open({animated:false});
		
		// Display warning
		Titanium.UI.createAlertDialog({
            title: "Default Login failed",
            message: "Could not authenticate your default account. Please check account data.",
            buttonNames: ['OK'],
        }).show();
	}

	//Nav Bar
	
		//Refresh button
		var refreshbutton = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
		});
		refreshbutton.addEventListener('click', function(e) {
			getTimeline();
		});
		Titanium.UI.currentWindow.setRightNavButton(refreshbutton);

		//Accounts button
		var accountbutton = Titanium.UI.createButton({
			image:'images/button_icon_profile.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		accountbutton.addEventListener('click', function(e) {
			Titanium.UI.createWindow({
				url:'accounts.html',
				barColor:'#423721',
			}).open();
		});
		Titanium.UI.currentWindow.setLeftNavButton(accountbutton);

	//Tool Bar
	
		//Post new tweet button
		var newmsgbutton = Titanium.UI.createButton({
		    image:'images/button_icon_post.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		newmsgbutton.addEventListener('click',function(){
			props.setString('postHeader','New Post');
			props.setString('initialPost','');
			props.setString('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
			}).open();
		});

		//Flexspace button
		var flexSpace = Titanium.UI.createButton({
		    systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});

	//Shake refresh event
	Titanium.Gesture.addEventListener('shake',function(e) {
		getTimeline();
	});
		
	//Refresh timeline on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		
		// Only if initial state is set
		if (initialState != undefined) {
			//Show toolbar only if logged in.
			if (props.getBool('loggedIn') == true) {
				//Timeline Tabbed bar (created on refresh to properly set index)
				var tabbar = Titanium.UI.createTabbedBar({
					index:props.getInt('inboxMode'),
					labels:['All','Replies','DM\'s'],
					backgroundColor:'#423721'
				});
				tabbar.addEventListener('click',function(e){
					props.setInt('inboxMode',e.index);
					getTimeline();
				});
				Titanium.UI.currentWindow.setToolbar([tabbar,flexSpace,newmsgbutton]);	
			}
			else {
				getTimeline();
				Titanium.UI.currentWindow.setToolbar(null);
			}
		}

	});

	// Titanium.UI.currentWindow.addEventListener('unfocused',function(){
	// 	db.close();
	// });

};