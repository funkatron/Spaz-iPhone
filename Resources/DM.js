window.onload = function() {
	
	//Initialize
	props = Titanium.App.Properties;
	var msgID = props.getString('msgID');
	var name = props.getString('username');
	var pass = props.getString('password');
	var id;

	function getDMDetails() {
		$.getJSON("http://"+name+":"+pass+"@twitter.com/direct_messages.json?since_id="+(msgID-1)+"&max_id="+(msgID+1)+"&callback=?", function(data){
			$(".usrimg").attr("src",data[0].sender.profile_image_url);
			$(".usrname").html(data[0].sender.screen_name);
			var link = /http:\/\/\S+/gi;
			$(".usrmsgdetail").html(data[0].text.replace(link, function(exp) {
				return ("<lnk>"+exp+"</lnk>");
			}));
			$(".msgstamp").html("Received <heavy>"+humane_date(data[0].created_at)+"</heavy>");
			id = encodeURIComponent(data[0].sender.screen_name);
			//Links
			$("lnk").bind('click',function(){
				Titanium.Platform.openURL($(this).text());
			});
		});
	};
	
	getDMDetails();
	
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
	
	//Delete button
	$(".replybutton").bind('click',function(e){
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

};