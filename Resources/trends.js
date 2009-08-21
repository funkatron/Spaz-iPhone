function getTrends() {

	if ($("#trcontainer").html() == "") {
		// Activity Indicator
		var ind = Titanium.UI.createActivityIndicator({
			id:'indicator',
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
			color:'#fff'
		});
		ind.setMessage('Loading...');
		ind.show();
	}
	if (props.getBool('loggedIn') == true && props.getInt('clientMode') == true) {	//logged on to Identica
		ind.hide();
		$(".header").text("Laconica currently does not support trends. Sorry!");
	} else {
		// //Get current trend data
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			var data = JSON.parse(this.responseText);
			var height = 0;
			var text = "";
			var first = true;
			$.each(data.trends, function(i,trend){
				//Place divider first except for first time
				if (first == false) {
					text += "<div class='divider'></div>";
				}
				first = false;
				height += 50;
				text += "<div class='option'><div class='label'>" +
					trend.name +
				"</div><img src='images/arrow_gray.png' class='optendimg'/></div>";
			});
			$("#trcontainer").animate({"height":height}, 1000);
			ind.hide();
			$(".header").text("Current Trends on Twitter");
			$("#trcontainer").html(text);
			$(".option").bind('click',function(e){
				//Set searchQuery & resultsMode globals
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
	
}

window.onload = function() {
	
	props = Titanium.App.Properties;
	
	getTrends();
	
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		
		getTrends();
		
	});
	
};