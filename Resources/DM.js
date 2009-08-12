window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	var msgID = props.getString('msgID');
	var name = props.getString('username');
	var pass = props.getString('password');
	var client = props.getInt('clientMode');
	var id;

	function getDMDetails() {
		var request = '';
		if (client == 0) {
			request = "http://"+name+":"+pass+"@twitter.com/direct_messages.json?since_id="+(msgID-1)+"&max_id="+(msgID+1);
		} else {
			request = "http://"+name+":"+pass+"@identi.ca/api/direct_messages.json?since_id="+(msgID-1)+"&max_id="+(msgID+1);
		}
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			$(".usrimg").attr("src",data[0].sender.profile_image_url);
			$(".usrname").html(data[0].sender.screen_name);
			var link = /(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?/gi;
			var mention = /@\w{1,15}/gi;
			$(".usrmsgdetail").html(data[0].text.replace(link, function(exp) {
				return ("<lnk>"+exp+"</lnk>");
				}).replace(mention, function(exp) {
					return ("<usr>"+exp+"</usr>");
				})
			);
			$(".msgstamp").html("Received <heavy>"+humane_date(data[0].created_at)+"</heavy>");
			id = encodeURIComponent(data[0].sender.screen_name);
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
		xhr.open("GET",request);
		xhr.send();
	};
	
	getDMDetails();
	
	// Block button
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
	
	// Delete button
	$(".leftbutton").bind('click',function(e){
		if (client == 0) {
			var delconfirm = Titanium.UI.createAlertDialog({
	            title: "Are you sure you delete this message?",
	            buttonNames: ['OK', 'cancel'],
	        });
			delconfirm.addEventListener('click', function(k) {
				if (k.index == 0) {
					var xhr = Titanium.Network.createHTTPClient();
					xhr.onload = function() {};
					xhr.open("POST","http://"+name+":"+pass+"@twitter.com/direct_messages/destroy/"+encodeURIComponent(msgID)+".json");
					xhr.send();
					Titanium.UI.currentWindow.close();
				}
			});
			delconfirm.show();
		} else {
			Titanium.UI.createAlertDialog({
	            title: "Laconica currently does not support deleting DM's. Sorry!",
	            buttonNames: ['OK'],
	        }).show();
		}
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

};