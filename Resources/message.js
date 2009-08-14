window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	var msgID = props.getString('msgID');
	var loggedIn = props.getBool('loggedIn');
	var client = props.getInt('clientMode');
	var isFavorite = false;
	if (loggedIn == true) {
		$(".hidden").css("display","inline");
		var name = props.getString('username');
		var pass = props.getString('password');
		var request = '';
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/favorites.json";
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/favorites.json";
		}
		var xhr2 = Titanium.Network.createHTTPClient();
		xhr2.onload = function() {
			var data2 = JSON.parse(this.responseText);
			$.each(data2, function(j,tweet2){
				if (tweet2.id == msgID) {
					isFavorite = true;
				}
			});
			if (isFavorite == true) {
				$("#favicon").css("opacity","1");
				$("#favorite").children(".label").text("Remove from favorites");
			}
			else {
				$("#favicon").css("opacity","0");
				$("#favorite").children(".label").text("Add as a favorite");
			}
		}
		xhr2.open("GET",request);
		xhr2.send();
	}
	else {
		$(".hidden").css("display","none");
		$("#favicon").css("opacity","0");
	}
	var id;

	function getMessageDetails() {
		var request = '';
		if (client == 0) {
			request = "http://twitter.com/statuses/show/"+msgID+".json";
		} else {
			request = "http://identi.ca/api/statuses/show/"+msgID+".json";
		}
		var xhr2 = Titanium.Network.createHTTPClient();
		xhr2.onload = function() {
			var data = JSON.parse(this.responseText);
			$(".usrimg").attr("src",data.user.profile_image_url);
			$(".usrname").html(data.user.screen_name);
			var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)[\w\/]/gi;
			var mention = /@\w{1,15}/gi;
			$(".usrmsgdetail").html(data.text.replace(link, function(exp) {
					return ("<lnk>"+exp+"</lnk>");
				}).replace(mention, function(exp) {
					return ("<usr>"+exp+"</usr>");
				})
			);
			$(".msgstamp").html("Posted <heavy>"+humane_date(data.created_at)+"</heavy> from <heavy>"+data.source+"</heavy>");
			id = encodeURIComponent(data.user.screen_name);
			//Links
			$("lnk").bind('click',function(){
				Titanium.Platform.openURL($(this).text());
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
		}
		xhr2.open("GET",request);
		xhr2.send();		
	};
	
	getMessageDetails();
	
	if (loggedIn == true) {
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
		
		//Reply button
		$(".leftbutton").bind('click',function(e){
			//Set postHeader, initialPost, postMode globals
			props.setString('postHeader',"RE: "+$(".usrmsgdetail").text());
			props.setString('initialPost',"@"+id+" ");
			props.setInt('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
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

		//Re-tweet button
		$("#retweet").bind('click',function(e){
			//Set postHeader, initialPost, postMode globals
			props.setString('postHeader','Re-Tweet Message');
			props.setString('initialPost',"RT @"+id+": "+$('.usrmsgdetail').text());
			props.setInt('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
			}).open();
		});
		

		//Favorite button
		$("#favorite").bind('click',function(e){
			if (isFavorite == false) {
				var request = '';
				if (client == 0) {
					request = "http://"+name+":"+pass+"@twitter.com/favorites/create/"+encodeURIComponent(msgID)+".json";
				} else {
					request = "http://"+name+":"+pass+"@identi.ca/api/favorites/create/"+encodeURIComponent(msgID)+".json";
				}
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {
					isFavorite = true;
					$("#favicon").animate({opacity:"1"},1000);
					$("#favorite").children(".label").text("Remove from favorites");
				};
				xhr.open("POST",request);
				xhr.send();
			}
			else {
				if (client == 0) {
					var xhr = Titanium.Network.createHTTPClient();
					xhr.onload = function() {
						isFavorite = false;
						$("#favicon").animate({opacity:"0"},1000);
						$("#favorite").children(".label").text("Add as a favorite");
					};
					xhr.open("POST","http://"+name+":"+pass+"@twitter.com/favorites/destroy/"+encodeURIComponent(msgID)+".json");
					xhr.send();
				} else {
					Titanium.UI.createAlertDialog({
			            title: "Laconica currently does not support removing favorites. Sorry!",
			            buttonNames: ['OK'],
			        }).show();
				}
			}
		});
	}
	
	

};