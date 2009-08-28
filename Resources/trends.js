function getTrends() {
	// Logged in to Identica
	if (props.getBool('loggedIn') == true && props.getInt('clientMode') == 1) {
		$("#trcontainer").css("display","none");
		$(".header").text("Laconica currently does not support trends. Sorry!");
	} 
	else {
		$(".header").text("Current Trends on Twitter");
		// Activity Indicator
		var ind = Titanium.UI.createActivityIndicator({
			id:'indicator',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			color:'#fff'
		});
		ind.setMessage('Loading...');
		ind.show();
		// //Get current Twitter trend data
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var height = 0;
			var text = "";
			var first = true;
			// Create html with trend data
			$.each(data.trends, function(i,trend){
				// Place divider first except for first time
				if (first == false) {
					text += "<div class='divider'></div>";
				}
				first = false;
				height += 50;
				text += "<div class='option'><div class='label'>" +
					trend.name +
				"</div><img src='images/arrow_gray.png' class='optendimg'/></div>";
			});
			ind.hide();
			$("#trcontainer").css("display","inline");
			$("#trcontainer").animate({"height":height}, 1000);
			$("#trcontainer").html(text);
			$(".option").bind('click',function(e){
				// Set searchQuery & resultsMode globals
				props.setString('searchQuery',$(this).children(".label").text());
				props.setInt('resultsMode',0);
				Titanium.UI.createWindow({
					url:'results.html',
					barColor:'#423721',
				}).open();
			});
		};
		xhr.open("GET","http://search.twitter.com/trends.json");
		xhr.send();
	}
};

window.onload = function() {
	
	// Initialize globals
	props = Titanium.App.Properties;
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	
	getTrends();
	
	// Get trends on each page focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		getTrends();
		// Check for internet
		if (Titanium.Network.online == false) {
			Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
		}
	});
	
};