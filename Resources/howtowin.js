/*
 * Window with help texts
 */
var activeView = 0;
var buttonHeight = (Ti.Platform.osname == 'ipad' ? 40 : 20);
var buttonFontSize = (Ti.Platform.osname == 'ipad' ? '20dp' : '12dp');
var h1size = (Ti.Platform.osname == 'ipad' ? 30 : 16);
var psize = (Ti.Platform.osname == 'ipad' ? 20 : 12);
var htmltop = '<html><head><style>' + 
  'h1{' + 
    'font-size:' + h1size + 'px;' + 
    'font-weight:bold;' + 
    'font-family:Arial;' + 
  '}' + 
  'body,p,li{' + 
    'font-size:' + psize + 'px;' + 
    'font-family:Arial;' + 
  '}' + 
  'p {' +
    'margin-bottom: ' + String(psize/2) + 'px' +
  '}' +
  'a {' + 
    'color:#fff;' + 
    'text-decoration:none;' + 
  '}' + 
  '</style></head><body>';
var htmlbottom = '</body></html>'
var views = [];
var viewsData = [{
	title: 'About',
	html: 
	  '<h1>About si3D</h1>' +
	  '<p>With si3D (Single Image 3D) stereogram generator you can generate custom 3D stereograms, also known as SIRDs (Single Image Random Dot). ' +
	  'These are seemingly meaningless images with repetitive patterns, but with some training (see "How to view") ' + 
	  'you can reveal hidden 3D shapes within the stereogram images.</p>' +
	  '<p>You can also save your generated si3D stereograms as images or share them with your friends through e.g. email or Facebook.</p>' +
	  '<p>We created si3D</p>' + 
	  '<p><img src="img/logo040.png" /></p>' +
	  '<p><b>040 Internet</b><br />a web agency in Malmö, Sweden<br /><a href="#" onclick="Ti.App.fireEvent(\'openURL\', { url: \'http://www.040.se\'})">www.040.se</a><br /><br />' +
	  'Contact us with questions, bug reports or improvement suggestions on <a href="#" onclick="Ti.App.fireEvent(\'sendMail\')">si3d@040.se</a></p>'
},{
	title: 'How to draw',
	html: 
	  '<h1>How to draw stereograms</h1>' +
	  '<p>The si3D stereograms will be generated based on templates that you draw with your finger.</p>' +
	  '<p>The 3D depth in your generated stereograms is represented by the drawing color in your template. ' +
	  'Light colors will appear above the plane in the generated stereogram. The lighter the color, the further above the plane. ' +
	  'Dark colors will appear below the plane.</p>' +
	  '<p>Draw big bold shapes. Tiny details are generally difficult to see in the gererated stereogram.</p>' +
	  '<p>You can change the 3D depth by the left slider and the with of the drawing brush with the right slider.</p>' +
	  '<p>You can use undo/redo to correct mistakes and save your drawings for later use.</p>'
},{
	title: 'How to generate',
	html: 
	  '<h1>How to generate stereograms</h1>' +
	  '<p>A si3D stereogram consists of a repetitive pattern and the number of repeats can be selected.</p>' +
	  '<p>The repetitive pattern can consist either of random dots or be an arbitrary image, selected from the images stored on the device.</p>' +
	  '<p>The selected pattern, in combination with the number of repeats, can affect how difficult it is so see the drawn figures in the stereogram. ' +
	  'It can also affect the apperance of the figures. For certain values the figures might look duplicated.</p>' +
	  '<p>If a stored image is selected as repetitive pattern, the best result is achieved if the image has lots of details and no big one-colored areas.</p>' 
},{
	title: 'How to view',
	html: 
	  '<h1>How to view stereograms</h1>' +
	  '<p>If you are new to 3D stereograms you might find it difficult to reveal the figures in the stereograms. But if you don\'t see them, don\'t give up! ' + 
	  'It can take some training to learn.</p>' +
	  '<p>Most people find it easiest to see the figures if the default options for generation are used, ' +
	  'i.e. 6 number of repeats and random dots.</p>' + 
	  '<p>The main trick is trying to focus on a point "behind" the si3D stsreogram. Relax and try to find that "dreamy" ' + 
	  'feeling that you have when you are looking at something without really seeing it.</p>' +    
	  '<p><b>Some hints:</b><br /><ul>' +
	  '<li>Look at the si3D in bright light.</li>' +
	  '<li>If you wear glasses, try with and without them on.</li>' +
	  '<li>Don\'t twist your head.</li>' +
	  '<li>Send your stereogram to your computer, e.g. by email, and enlarge it.</li>' +
	  '<li>Try to start with your eyes close to the stereogram and slowly move it away.</li>' +
	  '<li>Try with different numbers of repetitions.</li>' +
	  '<li>If you still don\'t see it, keep trying!</li></ul></p>'
}];


var win = Ti.UI.currentWindow;
win.title = 'How to';
win.backgroundColor = "#000";

/*
 * Adjust the height of the opened help view
 */
win.addEventListener('open', function(){
	for (var i=0; i < views.length; i++) {
		views[i].index = i;
	  views[i].contentScroll.setHeight(win.size.height - ((views.length + 1)*buttonHeight) + 'dp');
  	views[i].setActive(false, true);
	}
	views[0].setActive(true, true);
});

/*
 * Add the help views to the window
 */
for (var i=0; i < viewsData.length; i++) {
  win.add(
  	createView(viewsData[i].title, htmltop + viewsData[i].html + htmlbottom)
  );	
}

var backButton = getButton('Back', function(){
	win.hide();
});
backButton.setBottom(0);
backButton.backgroundGradient = {
	type:'linear',
  colors:['#849ab5','#ffc0e7f8','#849ab5'],
  startPoint:{x:0,y:0},
  endPoint:{x:0,y:buttonHeight},
  backFillStart:false
};
backButton.setColor('#333');
win.add(backButton);


/*
 * Called by http link in the help texts
 */
Ti.App.addEventListener('openURL', function(e){
  Ti.Platform.openURL(e.url);
});

/*
 * Called by nail link in the help texts
 */
Ti.App.addEventListener('sendMail', function(e){
	var emailDialog = Titanium.UI.createEmailDialog();
  emailDialog.toRecipients = ['si3d@040.se'];
  emailDialog.open();
});

/*
 * Create one help view with a button
 */
function createView(title, html){
	var view = Titanium.UI.createView({
		backgroundColor:'#849ab5',
		layout:'vertical'
	});
	
	view.button = getButton(title, function(){
		view.setActive(true);
	});
	view.button.setTop(0);
	view.add(view.button);
	
	view.contentScroll = Ti.UI.createScrollView({
		backgroundColor:'#849ab5',
		layout:'vertical',
		top:0
	});
	view.add(view.contentScroll);
	view.contentScroll.add(
		Ti.UI.createWebView({
		  backgroundColor:'#849ab5',
		  html:html
	  })
	);
	
	view.addContent = function(content){
		view.contentScroll.add(content);
	}
	
	view.setActive = function(active, skipAnimation){
		skipAnimation = true;
	  var animation = Titanium.UI.createAnimation(); 
	  animation.duration = 1000; 
 	  
 	  if (active) {
  		activeView = view.index;
  		for (var i=0; i < views.length; i++)
  			views[i].setActive(false);
			animation.height = 'auto';
			animation.top = view.index*buttonHeight + 'dp';
			animation.bottom = null;
		}
		else {
			animation.height = buttonHeight + 'dp';
	    if (this.index < activeView) {
				animation.top = this.index*buttonHeight + 'dp';
				animation.bottom = null;
	    }
	    else {
				animation.top = null;
				animation.bottom = (views.length - this.index)*buttonHeight + 'dp';
	     }
		}
		if (skipAnimation) {
	  	this.setTop(animation.top);
	    this.setBottom(animation.bottom);
	    this.setHeight(animation.height);
	  }
	  else
	    this.animate(animation);

  	this.button.setActive(active);
	}

	views.push(view);
  return view;	
}

/*
 * Creates a button with the title of a help section 
 */
function getButton(title, clickevent) {
	var selGradient = {
		type:'linear',
	  colors:['#4c5968','#9dadc2','#4c5968'],
	  startPoint:{x:0,y:0},
	  endPoint:{x:0,y:buttonHeight},
	  backFillStart:false
	};
	var unselGradient = {
		type:'linear',
	  colors:['#aaa','#ddd', '#aaa'],
	  startPoint:{x:0,y:0},
	  endPoint:{x:0,y:buttonHeight},
	  backFillStart:false
	};
	var selColor = '#fff';
	var unselColor = '#666';
	var btn = Ti.UI.createButton({
		title:title,
		color:unselColor,
		width:'100%',
		height:buttonHeight,
		font:{fontSize:	buttonFontSize},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundGradient: unselGradient
	});
	
	btn.addEventListener('click', clickevent);
	
	btn.setActive = function(active){
		if (active) {
			this.setBackgroundGradient(selGradient);
			this.setColor(selColor);
		}
		else {
			this.setBackgroundGradient(unselGradient);
			this.setColor(unselColor);
		}
	}
	return btn;
}
