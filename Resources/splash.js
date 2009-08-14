window.onload = function() {
	
	// //Bouncy logo
	// $("#logo").animate({top:"-300px"}, 2000)
	// $("#logo").animate({top:"0px"}, 500);
	// $("#logo").animate({top:"-120px"}, 550);
	// $("#logo").animate({top:"0px"}, 600);
	// $("#logo").animate({top:"-48px"}, 650);
	// $("#logo").animate({top:"0px"}, 700);
	
	$("#logo").animate({opacity:'1'}, 2000);
	
	//Login button
	var loginbutton = Titanium.UI.createButton({
		id:'loginbutton',
		backgroundImage:'images/button_white.png',
		title:'Login to your account',
		color:'#111111'
	});
	loginbutton.addEventListener('click',function(e) {
		Titanium.UI.currentWindow.close({animated:true});
	});
	
	//Search and explore button
	var searchbuton = Titanium.UI.createButton({
		id:'searchbutton',
		backgroundImage:'images/button_dark.png',
		title:'Search & Explore Twitter',
		color:'#EEEEEE'
	});
	searchbutton.addEventListener('click',function(e) {
		Titanium.UI.currentWindow.close();
	});
	
};