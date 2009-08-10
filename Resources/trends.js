window.onload = function() {
	
	var props = Titanium.App.Properties;
	
	//Get current trend data
	$.getJSON("http://search.twitter.com/trends.json?callback=?",function(data){
		$.each(data.trends, function(i,trend){
			$("#trend"+i).text(trend.name);
		});
	});
	
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