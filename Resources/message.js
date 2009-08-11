window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	var msgID = props.getString('msgID');
	var loggedIn = props.getBool('loggedIn');
	var isFavorite = false;
	if (loggedIn == true) {
		$(".hidden").css("display","inline");
		var name = props.getString('username');
		var pass = props.getString('password');
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
		xhr2.open("GET","http://"+name+":"+pass+"@twitter.com/favorites.json");
		xhr2.send();
	}
	else {
		$(".hidden").css("display","none");
		$("#favicon").css("opacity","0");
	}
	var id;

	function getMessageDetails() {
		$.getJSON("http://twitter.com/statuses/show/"+encodeURIComponent(msgID)+".json?callback=?", function(data){
			$(".usrimg").attr("src",data.user.profile_image_url);
			$(".usrname").html(data.user.screen_name);
			var link = /http:\/\/\S+/gi;
			$(".usrmsgdetail").html(data.text.replace(link, function(exp) {
				return ("<lnk>"+exp+"</lnk>");
			}));
			$(".msgstamp").html("Posted <heavy>"+humane_date(data.created_at)+"</heavy> from <heavy>"+data.source+"</heavy>");
			id = encodeURIComponent(data.user.screen_name);
			//Links
			$("lnk").bind('click',function(){
				Titanium.Platform.openURL($(this).text());
			});
		});
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
					var xhr = Titanium.Network.createHTTPClient();
					xhr.onload = function() {};
					xhr.open("POST","http://"+name+":"+pass+"@twitter.com/blocks/create/"+encodeURIComponent(id)+".json");
					xhr.send();
					Titanium.UI.currentWindow.close();
				}
			});
			blockconfirm.show();
		});
		Titanium.UI.currentWindow.setRightNavButton(blockbutton);
		
		//Reply button
		$(".replybutton").bind('click',function(e){
			//Set postHeader, initialPost, postMode globals
			props.setString('postHeader',"RE: "+$(".usrmsgdetail").html());
			props.setString('initialPost',"@"+id+" ");
			props.setInt('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
			}).open();
		});

		//Direct Message button
		$(".DMbutton").bind('click',function(e){
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
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {
					isFavorite = true;
					$("#favicon").animate({opacity:"1"},1000);
					$("#favorite").children(".label").text("Remove from favorites");
				};
				xhr.open("POST","http://"+name+":"+pass+"@twitter.com/favorites/create/"+encodeURIComponent(msgID)+".json");
				xhr.send();
			}
			else {
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {
					isFavorite = false;
					$("#favicon").animate({opacity:"0"},1000);
					$("#favorite").children(".label").text("Add as a favorite");
				};
				xhr.open("POST","http://"+name+":"+pass+"@twitter.com/favorites/destroy/"+encodeURIComponent(msgID)+".json");
				xhr.send();
			}
		});
	}
	
	

};