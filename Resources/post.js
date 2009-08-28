window.onload = function() {
	
	// Check for internet
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	if (Titanium.Network.online == false) {
		Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
	}
	
	// Initialize
	var props = Titanium.App.Properties;
	var loggedIn = props.getBool('loggedIn');
	var client = props.getInt('clientMode');
	var name = props.getString('username');
	var pass = props.getString('password');
	var postHeader = props.getString('postHeader');
	var mode = props.getInt('postMode');
	var sendTo = props.getString('sendTo');
	var message = props.getString('initialPost');
	$(".postheader").text(postHeader);
	
	// Text field
	var tfield = Titanium.UI.createTextArea({
		id:'text_field',
		value:message,
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
	
	// Add photo button
	var photobutton = Titanium.UI.createButton({
		id:'photobutton',
		backgroundImage:'images/camera.png',
		backgroundSelectedImage:'images/camera_pressed.png',
		height:32,
		width:32,
		style:Titanium.UI.iPhone.SystemButtonStyle.DONE ,
	});
	photobutton.addEventListener('click',function(e) {
		var camoption = Titanium.UI.createOptionDialog();
		camoption.setTitle("Choose a picture source");
		camoption.setOptions(["Picture gallery","Take a picture","Cancel"]);
		camoption.setCancel(2);
		camoption.addEventListener('click',function(k) {
			if (k.index == 0) {
				Titanium.Media.openPhotoGallery({
					success: function(image,details) {
						postImg(image);
					},
					error: function(e) {
						Titanium.UI.createAlertDialog({
							title:'Whoops!',
							message:'There was a problem with your photo gallery.'
						}).show();
					},
					cancel: function() {},
					allowImageEditing:true
				});
			}
			else if (k.index == 1) {
				Titanium.Media.showCamera({
					success: function(image,details) {
						postImg(image);
					},
					error: function(e) {
						Titanium.UI.createAlertDialog({
							title:'Whoops!',
							message:'There was a problem with your device camera.'
						}).show();
					},
					cancel: function() {},
					allowImageEditing:true
				});
			}
		});
		camoption.show();
	});
	
	function postImg(image) {
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var xml = this.responseXML;
			var imageurl = xml.documentElement.getElementsByTagName("mediaurl")[0].childNodes[0].nodeValue;
			message += imageurl;
			tfield.value = message;
			tfield.update();
			$("#counter").html(140-tfield.value.length);
		};
		xhr.open("POST","http://twitpic.com/api/upload");
		xhr.send({
			media:image,
			username:name,
			password:pass
		});
	};
	
	// Post button
	var postbutton = Titanium.UI.createButton({
		id:'postbutton',
		backgroundImage:'images/green_butt.png',
		title:'Post',
		color:'#fff'
	});
	postbutton.addEventListener('click',function(e) {
		if (message == "") {
			Titanium.UI.createAlertDialog({
	            title: "No message!",
				message: "Please type a message above.",
	            buttonNames: ['OK'],
	        }).show();
		}
		else {
			var url = '';
			var sendObject = {};
			if (mode == 0) {	// Tweet
				if (client == 0) {
					url = "http://"+name+":"+pass+"@twitter.com/statuses/update.json";
				} else {
					url = "http://"+name+":"+pass+"@identi.ca/api/statuses/update.json";
				}
				sendObject = {"status":message,"source":"Spaz"};
			}
			else if (mode == 1) {	// Direct Message
				if (client == 0) {
					url = "http://"+name+":"+pass+"@twitter.com/direct_messages/new.json";
				} else {
					url = "http://"+name+":"+pass+"@identi.ca/api/direct_messages/new.json";
				}
				sendObject = {"screen_name":sendTo,"text":message,"source":"Spaz"};
			}
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onload = function() {
				props.setBool('accountChangeAll',true);
				Titanium.UI.currentWindow.close();
			};
			xhr.open("POST",url);
			xhr.send(sendObject);
		}
	});
	
	// Cancel button
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