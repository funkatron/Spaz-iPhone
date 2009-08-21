function savedSearches() {
	
	var loggedIn = props.getString('loggedIn');
	if (loggedIn == true){
		var client = props.getInt('clientMode');
		if (client == 0) {
			var ind = Titanium.UI.createActivityIndicator({
				id:'indicator',
				style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
				color:'#fff'
			});
			ind.setMessage('Loading...');
			ind.show();
			$("#savedsearches").empty();
			var text = '';
			var name = props.getString('username');
			var pass = props.getString('password');
			text += "<div class='header'>Saved Searches</div><div id='scontainer' class='option_container'>";
			var xhr = Titanium.Network.createHTTPClient();
			xhr.onload = function() {
				var data = JSON.parse(this.responseText);
				var height = 0;
				var first = true;
				$.each(data, function(i,search){
					//Place divider first except for first time
					if (first == false) {
						text += "<div class='divider'></div>";
					}
					first = false;
					height += 50;
					text += "<div class='option'><div class='label'>";
					text += search.query;
					text += "</div><img src='images/arrow_gray.png' class='optendimg'/></div>";
				});
				text += "</div>";
				$("#scontainer").animate({"height":height}, 1000);
				ind.hide();
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
	}
	else {
		$("#savedsearches").empty();
	}
};

window.onload = function() {

	props = Titanium.App.Properties;
	
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
		
		savedSearches();
		
	});
	
};