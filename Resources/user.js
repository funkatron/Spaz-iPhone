window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	var id = props.getString('screenname');
	var loggedIn = props.getBool('loggedIn');
	if (loggedIn == true) {
		var name = props.getString('username');
		var pass = props.getString('password');
		var client = props.getInt('clientMode');
		$(".hidden").css("display","inline");
		//Check if you follow this user
		var follow;
		var request = '';
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/friendships/exists.json?user_a="+encodeURIComponent(name)+"&user_b="+encodeURIComponent(id);
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/friendships/exists.json?user_a="+encodeURIComponent(name)+"&user_b="+encodeURIComponent(id);
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = this.responseText;
			if (data == "true") {follow = true;}
			else {follow = false;}
			if (follow == true) {
				$("#followbutton").css("background-image","url('images/unfollow1.png')");
			}
			else if (follow == false) {
				$("#followbutton").css("background-image","url('images/follow1.png')");
			}
		};
		xhr.open("GET",request);
		xhr.send();
	}
	else {
		$(".hidden").css("display","none");
		$("#follow").css("display","none");
		$("#unfollow").css("display","none");
	}

	//Get info on selected user
	function getUserDetails() {
		var request = '';
		if (client == 0) {
			request = "http://twitter.com/users/show.json?screen_name="+encodeURIComponent(id);
		} else {
			request = "http://identi.ca/api/users/show.json?screen_name="+encodeURIComponent(id);
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			$(".usrimg").attr("src",data.profile_image_url);
			$(".usrname").html(data.screen_name + " -");
			$(".usrbio").html(data.description);
			var stats = "followers:" + data.followers_count + "\nfollowing:" + data.friends_count + "\nupdates:" + data.statuses_count;
			$(".usrstats").html(stats);
		}
		xhr.open("GET",request);
		xhr.send();
	};
	
	getUserDetails();
	
	//Link to user on the web button
	var webbutton = Titanium.UI.createButton({
		id:'webbutton',
		backgroundImage:'images/web.png',
		backgroundSelectedImage:'images/web_pressed.png',
		height:32,
		width:69,
	});
	webbutton.addEventListener('click',function(e){
		var webpf = '';
		if (client == 0) {
			webpf = 'http://www.twitter.com/'+encodeURIComponent(id);
		} else {
			webpf = 'http://identi.ca/'+encodeURIComponent(id);
		}
		Titanium.Platform.openURL(webpf);
	});
	
	
	//Block/follow/unfollow buttons only if logged in
	if (loggedIn == true) {
		var name = props.getString('username');
		var pass = props.getString('password');
		
		//Block button
		var blockbutton = Titanium.UI.createButton({
			image:'images/button_icon_block.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		blockbutton.addEventListener('click', function(e) {
			var blockconfirm = Titanium.UI.createAlertDialog({
	            title: "Are you sure you want to block user "+id+"?",
				message: "Once blocked, you will only be able to unblock through Twitter's website",
	            buttonNames: ['OK', 'cancel'],
	        });
			blockconfirm.addEventListener('click', function(k) {
				if (k.index == 0) {
					var request = '';
					if (client == 0) {
						request = "http://"+name+":"+pass+"@twitter.com/blocks/create/"+encodeURIComponent(id)+".json";
					} else {
						request = "http://"+name+":"+pass+"@identi.ca/api/blocks/create/"+encodeURIComponent(id)+".json";
					}
					var xhr = Titanium.Network.createHTTPClient();
					xhr.onload = function() {};
					xhr.open("POST",request);
					xhr.send();
					Titanium.UI.currentWindow.close();
				}
			});
			blockconfirm.show();
		});
		Titanium.UI.currentWindow.setRightNavButton(blockbutton);
		
		
		//Follow/Unfollow button
		$("#followbutton").bind('mousedown',function(e){ 
			if (follow == true) {
				$(this).css("background-image","url('images/unfollow2.png')");
			}
			else if (follow == false) {
				$(this).css("background-image","url('images/follow2.png')");
			}
		});
		$("#followbutton").bind('mouseup',function(e){ 
			if (follow == true) {
				$(this).css("background-image","url('images/unfollow1.png')");
			}
			else if (follow == false) {
				$(this).css("background-image","url('images/follow1.png')");
			}
		});
		$("#followbutton").bind('click',function(e){
			if (follow == true) {
				$(this).css("background-image","url('images/follow1.png')");
				var request = '';
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/friendships/destroy.json?screen_name="+encodeURIComponent(id);
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/friendships/destroy.json?screen_name="+encodeURIComponent(id);
				}
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {};
				xhr.open("POST",request);
				xhr.send();
				follow = false;
			}
			else if (follow == false) {
				$(this).css("background-image","url('images/unfollow1.png')");
				var request = '';
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/friendships/create.json?screen_name="+encodeURIComponent(id);
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/friendships/create.json?screen_name="+encodeURIComponent(id);
				}
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {};
				xhr.open("POST",request);
				xhr.send();
				follow = true;
			}
		});
		
		
		//Reply button
		$(".leftbutton").bind('click',function(e){
			//Set postHeader, initialPost, postMode globals
			props.setString('postHeader',"Reply to User");
			props.setString('initialPost',"@"+id+" ");
			props.setInt('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:name,
			}).open();
		});
		
		//Direct Message button
		$(".rightbutton").bind('click',function(e){
			//Set postHeader, initialPost, postMode, sendTo globals
			props.setString('postHeader',"Direct Message to "+id);
			props.setString('initialPost',"");
			props.setInt('postMode',1);
			props.setString('sendTo',id);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
			}).open();
		});
	}
	
	//Recent posts button
	$("#recentposts").bind('click',function(e){
		//Set searchQuery & resultsMode globals
		props.setString('searchQuery',id);
		props.setInt('resultsMode',1);
		Titanium.UI.createWindow({
			url:'results.html',
			barColor:'#423721',
		}).open();
	});
	
	//Search for user button
	$("#searchuser").bind('click',function(e){
		//Set searchQuery & resultsMode globals
		props.setString('searchQuery',id);
		props.setInt('resultsMode',0);
		Titanium.UI.createWindow({
			url:'results.html',
			barColor:'#423721',
		}).open();
	});

};