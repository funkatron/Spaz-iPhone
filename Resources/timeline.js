window.onload = function() {
	
	//Initialize globals (timeline.js only loads once)
	props = Titanium.App.Properties;	//pointer to globals
	props.setBool('loggedIn', false);
	props.setBool('initial',true);
	props.setString('username','');
	props.setString('password','');
	props.setString('searchQuery','');
	props.setString('screenname','');
	props.setString('msgID','');
	props.setString('postHeader','');
	props.setString('initialPost','');
	props.setString('accName','');
	props.setInt('clientMode',0); // 0 = Twitter, 1 = Identi.ca
	props.setInt('inboxMode',0);
	props.setInt('postMode',0);
	props.setInt('accountMode',0);
	props.setInt('defaultLoginSuccess',0);
	
	//Stack accounts screen on top of timeline window
	Titanium.UI.createWindow({
		url:'accounts.html',
		barColor:'#423721',
	}).open({animated:false});

	//Stack splash screen on top of accounts window (initial window)
	Titanium.UI.createWindow({
		url:'splash.html',
		hideNavBar:true,
		hideTabBar:true,
	}).open({animated:false});

	//Function: Get Timeline
	function getTimeline() {
		$("#tcontainer").empty();
		var request = "";
		var loggedIn = props.getBool('loggedIn');
		var client = props.getInt('clientMode');
		var mode = props.getInt('inboxMode');
		if (loggedIn == false) {
			if (client == 0) {
				request = "http://twitter.com/statuses/public_timeline.json";
			} else {
				request = "http://identi.ca/api/statuses/public_timeline.json";
			}
		}
		else if (loggedIn == true) {
			var name = props.getString('username');
			var pass = props.getString('password');
			if (mode == 0) { 	//All
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/friends_timeline.json";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/friends_timeline.json";
				}
			}
			else if (mode == 1) { 	//Replies
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/statuses/mentions.json";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/statuses/mentions.json";
				}
			}
			else if (mode == 2) { 	//Direct Messages
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/direct_messages.json";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/direct_messages.json";
				}
			}
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var text = '';
			var count = 0;
			var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?/gi;
			var mention = /@\w{1,15}/gi;
			if (mode == 0 || mode == 1) {	//All, Replies
				$.each(data, function(i,tweet){
					text += "<div id='" +
						tweet.id + 
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
			$("#tcontainer").html(text);
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
	
	//User detail
	$(".usrimg").live('click',function(e){
		//Set user ID global
		props.setString('screenname',$(this).siblings(".usrname").html());
		//User detail view
		Titanium.UI.createWindow({
			url:'user.html',
			barColor:'#423721',
		}).open();
	});

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
		Titanium.UI.currentWindow.setLeftNavButton(accountbutton);
		accountbutton.addEventListener('click', function(e) {
			Titanium.UI.createWindow({
				url:'accounts.html',
				barColor:'#423721',
			}).open();
		});

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
			Titanium.UI.currentWindow.setToolbar(null);
		}
		getTimeline();

	});

};