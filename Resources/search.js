function savedSearches() {
	if (props.getString('loggedIn') == true && props.getInt('clientMode') == 0) {
		$("#savedsearches").empty();
		var ind = Titanium.UI.createActivityIndicator({
			id:'indicator',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			color:'#fff'
		});
		ind.setMessage('Loading...');
		ind.show();
		var name = props.getString('username');
		var pass = props.getString('password');
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var text = '';
			text += "<div class='header'>Saved Searches</div><div id='scontainer' class='option_container'>";
			var height = 0;
			var first = true;
			$.each(data, function(i,search){
				//Place divider first except for first time
				if (first == false) {
					text += "<div class='divider'></div>";
				}
				first = false;
				height += 50;
				text += "<div class='option'><div class='label'>" +
					search.query +
				"</div><img src='images/arrow_gray.png' class='optendimg'/></div>";
			});
			text += "</div>";
			ind.hide();
			$("#scontainer").animate({"height":height}, 1000);
			$("#savedsearches").html(text);
			$(".option").bind('click',function(e){
				//Set searchQuery & resultsMode globals
				props.setString('searchQuery',$(this).children(".label").html());
				props.setInt('resultsMode',0);
				Titanium.UI.createWindow({
					url:'results.html',
					barColor:'#423721',
				}).open();
			});
		};
		xhr.open("GET","http://"+name+":"+pass+"@twitter.com/saved_searches.json");
		xhr.send();
	}
	else {
		$("#savedsearches").empty();
	}
};

window.onload = function() {

	// Initialize
	props = Titanium.App.Properties;
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	
	//Search text field object
	var sfield = Titanium.UI.createTextField({
		id:'search_field',
		color:'#000',
		backgroundColor:'#fff',
		returnKeyType:Titanium.UI.RETURNKEY_SEARCH,
		enableReturnKey:true,
		keyboardType:Titanium.UI.KEYBOARD_ASCII,
		autocorrect:false,
		hintText:'Enter Search Terms',
		clearOnEdit:true,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS,
	});
	//Return takes user to serach results page
	sfield.addEventListener('return',function(e){
		//Set searchQuery & resultsMode globals
		props.setString('searchQuery',e.value);
		props.setInt('resultsMode',0);
		Titanium.UI.createWindow({
			url:'results.html',
			title:'Search Twitter',
			barColor:'#423721',
		}).open();
	});
	
	savedSearches();
	
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		// Check for internet
		if (Titanium.Network.online == false) {
			Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
		}
		savedSearches();
	});
	
};