function getView(mode) {
	if (mode == 0) {
		return Titanium.UI.currentWindow.getViewByName('all');
	} else if (mode == 1) {
		return Titanium.UI.currentWindow.getViewByName('replies');
	} else if (mode == 2) {
		return Titanium.UI.currentWindow.getViewByName('dms');
	} else if (mode == 3) {
		return Titanium.UI.currentWindow.getViewByName('public');
	}
};

window.onload = function() {
	
	//Initialize globals (timeline.js only loads once)
	props = Titanium.App.Properties;	//pointer to globals
	props.setBool('loggedIn', false);
	props.setBool('accountCreated',false);
	props.setBool('accountChangeAll',false);
	props.setBool('accountChangeReplies',false);
	props.setBool('accountChangeDMs',false);
	props.setString('username','');
	props.setString('password','');
	props.setString('searchQuery','');
	props.setString('screenname','');
	props.setString('msgID','');
	props.setString('postHeader','');
	props.setString('initialPost','');
	props.setString('accName','');
	props.setInt('clientMode',0); // 0 = Twitter, 1 = Identi.ca
	props.setInt('inboxMode',0);
	props.setInt('postMode',0);
	props.setInt('accountMode',0);
	
	// Check for internet
	var noInternet = Titanium.UI.createWebView({url:'nointernet.html', name:'nointernet'});
	Titanium.UI.currentWindow.addView(noInternet);
	if (Titanium.Network.online == false) {
		Titanium.UI.currentWindow.showView(Titanium.UI.currentWindow.getViewByName('nointernet'));
	}
	
	//Initialize databse
	//db = Titanium.Database.open('mydb');
	//db.remove();
	db = Titanium.Database.open('mydb');
	//CLIENT: 0 = Twitter, 1 = Identica
	//DEF: 0 = NO, 1 = YES
	//db.execute('DROP TABLE ACCOUNTS');
	db.execute('CREATE TABLE IF NOT EXISTS ACCOUNTS (CLIENT INTEGER, ACCOUNT TEXT, PASSWORD TEXT, DEF INTEGER, TIMELINE TEXT, REPLIES TEXT, DMS TEXT, FAVORITES TEXT)');
	
	// Login default account if exists
	var initialState; // 0 = No accounts, 1 = Accounts but no default, 2 = Default login success
	var rc = db.execute('SELECT COUNT(*) FROM ACCOUNTS');
	var rowCount = rc.field(0);
	rc.close();
	if (rowCount == 0) {
		initialState = 0;	// 0 = No accounts
	}
	else {
		// Check for default account
		var existsDefault = false;
		var accs = db.execute('SELECT * FROM ACCOUNTS');
		for (var i = 0; i < rowCount; i++) {
			if (accs.fieldByName('def') == 1) {
				existsDefault = true;
				break;
			}
			accs.next();
		}
		if (existsDefault == true) {
			props.setBool('loggedIn',true);
			props.setString('username',accs.fieldByName('account'));
			props.setString('password',accs.fieldByName('password'));
			props.setInt('clientMode',accs.fieldByName('client'));
			props.setBool('accountChangeAll',true);
			props.setBool('accountChangeReplies',true);
			props.setBool('accountChangeDMs',true);
			initialState = 2;	// 2 = Default login success
		}
		else {
			initialState = 1;	// 1 = Accounts exist, but no default
		}
		accs.close();
	}
	
	// Stack windows depending on initial state
	if (initialState == 0) {
		// Stack accounts screen on top of timeline window
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open({animated:false});

		// Stack splash screen on top of accounts window (initial window)
		Titanium.UI.createWindow({
			url:'splash.html',
			hideNavBar:true,
			hideTabBar:true,
		}).open({animated:false});
	}
	else if (initialState == 1) {
		// Stack accounts screen on top of timeline window
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open({animated:false});
	}
	else if (initialState == 2) {
	}
	
	var viewAll = Titanium.UI.createWebView({url:'timeline-all.html', name:'all'});
	var viewReplies = Titanium.UI.createWebView({url:'timeline-replies.html', name:'replies'});
	var viewDMs = Titanium.UI.createWebView({url:'timeline-dms.html', name:'dms'});
	var viewPublic = Titanium.UI.createWebView({url:'timeline-public.html', name:'public'});
	Titanium.UI.currentWindow.addView(viewAll);
	Titanium.UI.currentWindow.addView(viewReplies);
	Titanium.UI.currentWindow.addView(viewDMs);
	Titanium.UI.currentWindow.addView(viewPublic);	

	// Accounts button
	var accountbutton = Titanium.UI.createButton({
		image:'images/button_icon_profile.png',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
	});
	accountbutton.addEventListener('click', function(e) {
		Titanium.UI.createWindow({
			url:'accounts.html',
			barColor:'#423721',
		}).open();
	});
	Titanium.UI.currentWindow.setLeftNavButton(accountbutton);

	// Tool Bar
		// Timeline tabbed bar
		var tabbar = Titanium.UI.createTabbedBar({
			index:props.getInt('inboxMode'),
			labels:['All','Replies','DM\'s'],
			backgroundColor:'#423721'
		});
		tabbar.addEventListener('click',function(e){
			props.setInt('inboxMode',e.index);
			Titanium.UI.currentWindow.showView(getView(props.getInt('inboxMode')));
		});
		
		// Post new tweet button
		var newmsgbutton = Titanium.UI.createButton({
		    image:'images/button_icon_post.png',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		});
		newmsgbutton.addEventListener('click',function(){
			props.setString('postHeader','New Post');
			props.setString('initialPost','');
			props.setString('postMode',0);
			Titanium.UI.createWindow({
				url:'post.html',
				barColor:'#423721',
				title:props.getString('username'),
			}).open();
		});

		// Flexspace button
		var flexSpace = Titanium.UI.createButton({
		    systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		
	// Get timeline on focus
	Titanium.UI.currentWindow.addEventListener('focused',function(){
		//Show toolbar only if logged in.
		if (props.getBool('loggedIn') == true) {
			Titanium.UI.currentWindow.setToolbar([tabbar,flexSpace,newmsgbutton]);
		}
		else {
			Titanium.UI.currentWindow.setToolbar(null);
		}
		Titanium.UI.currentWindow.showView(getView(props.getInt('inboxMode')));
	});

};