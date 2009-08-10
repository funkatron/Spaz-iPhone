window.onload = function() {
	
	var props = Titanium.App.Properties;
	var loggedIn = props.getBool('loggedIn');
	var name = props.getString('username');
	var pass = props.getString('password');
	var postHeader = props.getString('postHeader');
	var initialPost = props.getString('initialPost');
	var mode = props.getInt('postMode');
	var sendTo = props.getString('sendTo');
	var message = '';
	
	$(".postheader").html(postHeader);
	
	//Text field
	var tfield = Titanium.UI.createTextField({
		id:'text_field',
		value:initialPost,
		color:'#000',
		backgroundColor:'#fff',
		returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
		enableReturnKey:true,
		keyboardType:Titanium.UI.KEYBOARD_ASCII,
		autocorrect:false,
		hintText:'Type Post Here',
		clearOnEdit:false,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	});
	tfield.addEventListener('change',function(e){
		$("#counter").html(140-e.value.length);
		message = e.value;
	});
	tfield.addEventListener('return',function(e){
		tfield.blur();
	});
	
	$("#counter").html(140-tfield.value.length);
	
	//Add photo button
	var photobutton = Titanium.UI.createButton({
		id:'photobutton',
		backgroundImage:'images/camera.png',
		backgroundSelectedImage:'images/camera_pressed.png',
		height:32,
		width:32,
		style:Titanium.UI.iPhone.SystemButtonStyle.DONE ,
	});
	
	//Post button
	var postbutton = Titanium.UI.createButton({
		id:'postbutton',
		backgroundImage:'images/green_butt.png',
		title:'Post',
		color:'#fff'
	});
	postbutton.addEventListener('click',function(e) {
		var confirm = '';
		if (mode == 0) {	//Tweet
			confirm = "Update status?";
		}
		else if (mode == 1) {	//Direct Message
			confirm = "Send message?";
		}
		var postconfirm = Titanium.UI.createAlertDialog({
            title: confirm,
            buttonNames: ['OK', 'Cancel'],
        });
		postconfirm.addEventListener('click', function(k) {
			if (k.index == 0) {
				var url = '';
				var sendObject = {};
				if (mode == 0) {	//Tweet
					url = "http://"+name+":"+pass+"@twitter.com/statuses/update.json";
					sendObject = {"status":message};
				}
				else if (mode == 1) {	//Direct Message
					url = "http://"+name+":"+pass+"@twitter.com/direct_messages/new.json";
					sendObject = {"screen_name":sendTo,"text":message};
				}
				var xhr = Titanium.Network.createHTTPClient();
				xhr.onload = function() {};
				xhr.open("POST",url);
				xhr.send(sendObject);
				if (mode == 0) {
					Titanium.UI.createAlertDialog({
			            title: "Status Updated!",
			            buttonNames: ['OK'],
			        }).show();
				}
				else if (mode == 1) {
					Titanium.UI.createAlertDialog({
			            title: "Message Sent!",
			            buttonNames: ['OK'],
			        }).show();
				}
				Titanium.UI.currentWindow.close();
			}
		});
		postconfirm.show();
	});
	
	//Cancel button
	var cancelbutton = Titanium.UI.createButton({
		id:'cancelbutton',
		backgroundImage:'images/red_butt.png',
		title:'Cancel',
		color:'#fff',
	});
	cancelbutton.addEventListener('click',function(e) {
		Titanium.UI.currentWindow.close();
	});
		
};