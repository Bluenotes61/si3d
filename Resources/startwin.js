/*
 * Start window if appliucation with buttons for
 * opening drawing window and help window.
 */

var win = Ti.UI.currentWindow;
win.title = 'Start';
win.backgroundColor = '#000';

var winbg = Ti.UI.createImageView({
	image:'img/splash.png',
	width:'100%'
});
win.add(winbg);

var buttonRow = Ti.UI.createView({
  height:90,
	bottom:0
});

var startButton =	Ti.UI.createButton({
  width:'50%',
  height:90,
  left:0,
  backgroundColor:'#ffc0e7f8',
  backgroundSelectedColor:'#ff93dcfc',
  image:'img/btn_start.png',
  backgroundImage:'none'
});
startButton.addEventListener('click', function() {
	win.drawWin.show();
});
buttonRow.add(startButton);

var helpButton =	Ti.UI.createButton({
  width:'50%',
  height:90,
  right:0,
  backgroundColor:'#ff94c4da',
  backgroundSelectedColor:'#ff63b1d5',
  image:'img/btn_howto.png',
  backgroundImage:'none'
});
helpButton.addEventListener('click', function(){
	win.howtoWin.show();
});
buttonRow.add(helpButton);

win.add(buttonRow);