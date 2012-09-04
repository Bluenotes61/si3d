var howtoWin = Ti.UI.createWindow({
	url:'howtowin.js',
	visible: false
});
howtoWin.orientationModes = [ Titanium.UI.LANDSCAPE_LEFT ];

var drawWin = Ti.UI.createWindow({
	url:'drawwin.js',
	howtoWin:howtoWin,
	visible: false
});
drawWin.orientationModes = [ Titanium.UI.LANDSCAPE_LEFT ];

var startWin = Ti.UI.createWindow({
	url:'startwin.js',
	howtoWin:howtoWin,
	drawWin:drawWin
});
startWin.orientationModes = [ Titanium.UI.LANDSCAPE_LEFT ];

startWin.open();
drawWin.open(); 
howtoWin.open();
