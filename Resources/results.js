window.onload = function() {

	//Initialize
	props = Titanium.App.Properties;
	var query = props.getString('searchQuery');
	var loggedIn = props.getBool('loggedIn');
	
	Titanium.UI.currentWindow.setTitle(query);

	//Function: Get Search Results
	function getResults() {
		$("#rcontainer").empty();
		var request = "";
		var mode = props.getInt('resultsMode');
		if (mode == 0) { 	//Search
			request = "http://search.twitter.com/search.json?q="+encodeURIComponent(query);
		}
		else if (mode == 1) { 	//Recent Posts
			if (loggedIn == true) {
				var name = props.getString('username');
				var pass = props.getString('password');
				request = "http://"+name+":"+pass+"@twitter.com/statuses/user_timeline.json?screen_name="+encodeURIComponent(query);
			}
			else {
				request = "http://twitter.com/statuses/user_timeline.json?screen_name="+encodeURIComponent(query);
			}
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var text = '';
			var count = 0;
			var link = /http:\/\/\S+/gi;
			var mention = /@\w+/gi;
			if (mode == 0) {	//Search
				var keyword = new RegExp(query,"gi");
				$.each(data.results, function(i,tweet){
					text += "<div id='" +
						tweet.id +
					"' class='status' style='background-image:url(\"";
					if (tweet.from_user == props.getString('username')) {
						if (loggedIn == true) {
							{text += "images/BG_red_sliver.png";}
						}
					}
					else if (count % 2 == 0) {text += "images/BG_dark_sliver.png";}
					else if (count % 2 == 1) {text += "images/BG_light_sliver.png";}
					text += "\");'><img src='" +
						tweet.profile_image_url +
					"' class='usrimg'/><div class='usrname'>" +
						tweet.from_user +
					"</div><div class='usrtime'>" +
						humane_date(tweet.created_at) +
					"</div><div class='usrmsg'>" +
						tweet.text.replace(keyword, function(exp) {
								return ("<hilite>"+exp+"</hilite>");
							}).replace(link, function(exp) {
								return ("<lnk>"+exp+"</lnk>");
							}).replace(mention, function(exp) {
								return ("<usr>"+exp+"</usr>");
							}) +
					"</div></div>";
					count++;
				});
			}
			else if (mode == 1) {	//Recent posts
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
			$("#rcontainer").html(text);
			//Message detail
			$(".usrmsg").bind('click',function(e){
				//Set message ID global
				props.setString('msgID',$(this).parent(".status").attr("id"));
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
	
	//User detail
	$(".usrimg").live('click',function(e){
		//Set user screenname global
		props.setString('screenname',$(this).siblings(".usrname").text());
		Titanium.UI.createWindow({
			url:'user.html',
			barColor:'#423721',
		}).open();
	});

	//Refresh button
	var refreshbutton = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
	});
	refreshbutton.addEventListener('click',function(e){
		getResults();
	});
	Titanium.UI.currentWindow.setRightNavButton(refreshbutton);
	
	//Shake refresh event
	Titanium.Gesture.addEventListener('shake',function(e) {
		getResults();
	});
	
	//Add Save Search button
	if (loggedIn == true) {
		var name = props.getString('username');
		var pass = props.getString('password');
		var searchID;
		
		//Declare both buttons
		//Save search button
		var savebutton = Titanium.UI.createButton({
			image:'images/button_icon_add.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		savebutton.addEventListener('click',function(e){
			var saveconfirm = Titanium.UI.createAlertDialog({
	            title: "Are you sure you want to save search \""+query+"\"?",
	            buttonNames: ['OK', 'Cancel'],
	        });
			saveconfirm.addEventListener('click',function(k){
				if (k.index == 0) {
					var xhr4 = Titanium.Network.createHTTPClient();
					xhr4.onload = function() {
						Titanium.UI.currentWindow.setRightNavButton(removebutton);
					};
					xhr4.open("POST","http://"+name+":"+pass+"@twitter.com/saved_searches/create.json");
					xhr4.send({"query":query});
				}
			});
			saveconfirm.show();
		});
		
		//Remove search button
		var removebutton = Titanium.UI.createButton({
			image:'images/button_icon_remove.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		removebutton.addEventListener('click',function(e){
			var removeconfirm = Titanium.UI.createAlertDialog({
	            title: "Are you sure you want to remove search \""+query+"\"?",
	            buttonNames: ['OK', 'Cancel'],
	        });
			removeconfirm.addEventListener('click',function(k){
				if (k.index == 0) {
					var xhr4 = Titanium.Network.createHTTPClient();
					xhr4.onload = function() {
						Titanium.UI.currentWindow.setRightNavButton(savebutton);
					};
					xhr4.open("POST","http://"+name+":"+pass+"@twitter.com/saved_searches/destroy/"+searchID+".json");
					xhr4.send();
				}
			});
			removeconfirm.show();
		});
		
		var xhr3 = Titanium.Network.createHTTPClient();
		xhr3.onload = function() {
			//Check if this is already a saved search query
			var data3 = JSON.parse(this.responseText);
			var searchSaved = false;
			$.each(data3, function(j,tweet3){
				if (tweet3.query == query) {
					searchSaved = true;
					searchID = tweet3.id;
				}
			});
			//Display corresponding button
			if (searchSaved == false) {
				Titanium.UI.currentWindow.setRightNavButton(savebutton);
			}
			else if (searchSaved == true) {
				Titanium.UI.currentWindow.setRightNavButton(removebutton);
			}
		};
		xhr3.open("GET","http://"+name+":"+pass+"@twitter.com/saved_searches.json");
		xhr3.send();
	}
	
	getResults();
	
};