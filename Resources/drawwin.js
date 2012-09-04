Ti.include('dialogs.js', 'storekit.js');

var win = Ti.UI.currentWindow;
win.title = 'Draw si3D';

var maxSavedItems = 20;

/*
 * Database table for savung si3d drawings
 */
var db = Ti.Database.open('si3dDB');
db.execute('CREATE TABLE IF NOT EXISTS drawings(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT, json TEXT);');
db.execute('CREATE TABLE IF NOT EXISTS userid(id TEXT PRIMARY KEY NOT NULL);');
var urs = db.execute('SELECT id FROM userid');
var userId = (urs.isValidRow() ? urs.fieldByName('id') : "");
urs.close();  
db.close();

var depthSlider = null;
var widthSlider = null;

/*
 * Add window elements
 */
var drawToolbar = createDrawToolbar();
win.add(drawToolbar);
var sliderBar = createSliderBar();
win.add(sliderBar);
var drawView = createDrawView();
win.add(drawView);
var si3dToolbar = createSi3dToolbar();
win.add(si3dToolbar);


/*
 * Called from html javascript
 */
Titanium.App.addEventListener('getCanvasSize', function(e) {
	si3DPropsDlg.props.width = e.size.width;
	si3DPropsDlg.props.height = e.size.height;
	si3DPropsDlg.props.fieldWidth = Math.ceil(si3DPropsDlg.props.width/si3DPropsDlg.props.nofFields);
});
Titanium.App.addEventListener('setDrawingStyle', function(e) {
	depthSlider.setValue(e.style.depth);
	widthSlider.setValue(e.style.width);
});


/*
 * Creates and returns a toolbar button
 */
function createTbButton(width, height, image, clickevent){
	var btn =	Ti.UI.createButton({
	  width:width,
	  height:height,
	  left:0,
	  image:image,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		borderWidth:1,
		borderColor:'#666'
	});
	btn.addEventListener('click', function(){clickevent(btn);});
	return btn;
}


/*
 * Creates the button toolbar when the window is in drawing mode
 */
function createDrawToolbar() {
	var buttonBar = Titanium.UI.createView({
	    width:'100%',
	    height:'40dp',
	    top:0,
		  backgroundGradient: {
				type:'linear',
			  colors:['#ffc0e7f8','#ff94c4da'],
			  startPoint:{x:0,y:0},
			  endPoint:{x:0,y:'40dp'},
			  backFillStart:false
			},
	    layout:'horizontal'
	});
	
	buttonBar.add(createTbButton('9.99%', '40dp', 'img/btn_new.png', function(){
		continueDlg.open("Your current drawing will be lost.", function(){
  	  drawView.evalJS("newDrawing()");
		});
	}));
	buttonBar.add(createTbButton('10%', '40dp', 'img/btn_open.png', function(){
		continueDlg.open("Your current drawing will be lost.", function(){
		  setTimeout(function(){ openDrawingDlg.open(); }, 500);	
		});
	}));
	buttonBar.add(createTbButton('10%', '40dp', 'img/btn_save.png', function(){
	  var data = drawView.evalJS("getDrawData()");
	  saveDrawingDlg.open(data);
	}));
	buttonBar.add(createTbButton('10%', '40dp', 'img/btn_undo.png', function(){
	  drawView.evalJS("undo()");
	}));
	buttonBar.add(createTbButton('10%', '40dp', 'img/btn_redo.png', function(){
	  drawView.evalJS("redo()");
	}));
	buttonBar.add(createTbButton('10%', '40dp', 'img/btn_help.png', function(){
	  win.howtoWin.show();
	}));
	buttonBar.add(createTbButton('40%', '40dp', 'img/btn_create.png', function(){
		if (Ti.Network.online)
		  si3DPropsDlg.open();
		else
		  alert("No Internet connection detected. You need an Internet connection to create si3ds.");
	}));
	
	return buttonBar;
}
	
	
/*
 * Creates the sliders to adjust depth and width in drawing mode
 */
function createSliderBar() {	
	var aBar = Titanium.UI.createView({
	    width:'100%',
	    height:'40dp',
	    top:'40dp',
		  backgroundGradient: {
				type:'linear',
			  colors:['#ffc0e7f8','#ff94c4da'],
			  startPoint:{x:0,y:0},
			  endPoint:{x:0,y:'40dp'},
			  backFillStart:false
			},
			borderWidth:1,
			borderColor:'#666',
	    layout:'horizontal'
	});
	
	depthSlider = Titanium.UI.createSlider({
		thumbImage:'img/thumb_depth.png',
		height:'30dp',
	  width: '33%',
		left:'5%',
	  top: '5dp',
	  min: 0,
	  max: 255,
	  value: 180
	});
	depthSlider.addEventListener('change', function(e) {
		var adepth = parseInt(depthSlider.value);
		if (adepth != 128)
  	  currdepth = adepth;
		var js = "setDrawingStyle(" + adepth + ", null)";
  	eraseBtn.setState(adepth == 128);
	  drawView.evalJS(js);
	});
	aBar.add(depthSlider);
	  
	var currdepth = parseInt(depthSlider.value);
	  
	var eraseBtn = createTbButton('14%', '40dp', 'img/btn_erase.png', function(btn){
		btn.down = !btn.down;
		var depth = (btn.down ? 128 : currdepth);
	  depthSlider.setValue(depth);
	  drawView.evalJS("setDrawingStyle(" + depth + ", null)");
	});
	eraseBtn.down = false;
	eraseBtn.setState = function(on){
		if (on) 
			this.backgroundGradient = {
					type:'linear',
				  colors:['#ff94c4da','#ffc0e7f8'],
				  startPoint:{x:0,y:0},
				  endPoint:{x:0,y:'40dp'},
				  backFillStart:false
				}
		else
		  this.backgroundGradient = {};
		this.down = on;
	};
	eraseBtn.setState(false);
	eraseBtn.top = 0;
	eraseBtn.left = '5%';
	aBar.add(eraseBtn);
	    
	widthSlider = Titanium.UI.createSlider({
		thumbImage:'img/thumb_width.png',
		height:'30dp',
	  width: '33%',
		left:'5%',
	  top: '5dp',
	  min: 0,
	  max: 100,
	  value: 50
	});
	widthSlider.addEventListener('change', function(e) {
		var js = "setDrawingStyle(null, " + widthSlider.value + ")";
	  drawView.evalJS(js);
	});
	aBar.add(widthSlider);
	
	return aBar;
}


/*
 * Creates the WebView with canvas for drawing
 */
function createDrawView() {
	var aView = Titanium.UI.createWebView({
	  top:'80dp',
	  bottom:0,
	  backgroundColor:'#fff',
	  url:'drawarea.html'
	});
	return aView;
}

function hasLicense() {
	return checkIfProductPurchased("si3Dsharing");
	//return true;
}

function purchaseLicense() {
	if (Storekit.canMakePayments) {
		requestProduct("si3Dsharing", function(product){
			purchaseProduct(product);
		});
	}
  else 
	  alert("No purchases can be made from this device.");
}

/*
 * Creates the button toolbar when the window is in si3D mode
 */
function createSi3dToolbar() {
	var buttonBar = Titanium.UI.createView({
	    width:'100%',
	    height:'80dp',
	    top:0,
		  backgroundGradient: {
				type:'linear',
			  colors:['#ffc0e7f8','#ff94c4da'],
			  startPoint:{x:0,y:0},
			  endPoint:{x:0,y:'80dp'},
			  backFillStart:false
			},
			borderWidth:1,
			borderColor:'#666',
	    layout:'horizontal',
	    visible:false
	});
	
	buttonBar.add(
		createTbButton('50%', '80dp', 'img/btn_back.png', function(){
			drawToolbar.setVisible(true);
			sliderBar.setVisible(true);
			buttonBar.setVisible(false);
			drawView.evalJS("showDrawing()");
		})
	);
	buttonBar.add(
		createTbButton('50%', '80dp', 'img/btn_share.png', function(){
			if (hasLicense())
			  shareDlg.open(si3DPropsDlg.props.si3durl);
			else
			  purchaseDlg.open();
		})
	);

	return buttonBar;
}


/*
 * Dialog callback. Save a drawing to local database
 */
function saveDrawing(name, data) {
  var dbsql = Ti.Database.open('si3dDB');
	
	var rs = dbsql.execute('SELECT count(*) as nof FROM drawings');
	if (rs.fieldByName('nof') >= maxSavedItems)
  	dbsql.execute('delete from drawings where id in (select min(id) from drawings)');
	rs.close();  

  dbsql.execute("insert into drawings(name, json) values('" + name + "', '" + data + "')");
  dbsql.close();
}

/*
 * Dialog callback. Open a drawing from local database
 */
function openDrawing(arow) {
  drawView.evalJS("openImg('" + arow.custom_item + "')");
}

/*
 * Dialog callback. Call server to create si3d
 */
function createSi3D() {
	var wait = showWait();
	
  var drawing = drawView.evalJS("getDrawing()").replace("data:image/png;base64,","");
	var decoded = Ti.Utils.base64decode(drawing);
	
	var xhr = Titanium.Network.createHTTPClient();
  xhr.onload = function(e) {
  	var res = e.source.responseText.split(';');
  	if (res[0].indexOf('http') != 0) {
	  	wait.hideMe();
  		alert("An error occurred: " + res[0]);
  	}
  	else {
	  	si3DPropsDlg.props.si3durl = res[0];
	  	if (userId.length == 0) {
	  		userId = res[1];
			  var dbsql = Ti.Database.open('si3dDB');
			  dbsql.execute("insert into userid(id) values('" + userId + "')");
			  dbsql.close();
	  	}
	  	drawToolbar.setVisible(false);
	  	sliderBar.setVisible(false);
	  	si3dToolbar.setVisible(true);
	  	wait.hideMe();
	  	drawView.evalJS("showSi3d('" + si3DPropsDlg.props.si3durl + "')");
	  }
  };
  xhr.onerror = function(err){
    alert("An error occurred: " + err);
	  wait.hideMe();
  }
  xhr.open('POST','http://si3d.040.se/si3d.aspx');
  var img = null;
  if (!si3DPropsDlg.props.random) {
    img = si3DPropsDlg.props.image;
	  img = img.imageAsCropped({x:0, y:0, width:si3DPropsDlg.props.fieldWidth, height:si3DPropsDlg.props.height});
	}
  xhr.send({'drawing':decoded, "template":img, "noffields": si3DPropsDlg.props.nofFields, 'userid': userId, 'todelete': (hasLicense() ? "0" : "1")});
}

/*
 * Open an activity indicator
 */
function showWait()  {
  var indWin = null;
	if (Ti.Platform.osname != 'android')  {
		indWin = Titanium.UI.createWindow({
			height:150,
			width:150
		});
		var indView = Titanium.UI.createView({
			height:150,
			width:150,
			backgroundColor:'#000',
			borderRadius:10,
			opacity:0.8
		});
		indWin.add(indView);
	}

	var actInd = Titanium.UI.createActivityIndicator({
		style:Titanium.UI.iPhone && Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		height:30,
		width:30
	});

	if (Ti.Platform.osname != 'android') {
		indWin.add(actInd);

		var message = Titanium.UI.createLabel({
			text:'Generating...',
			color:'#fff',
			width:'auto',
			height:'auto',
			font:{fontSize:20,fontWeight:'bold'},
			bottom:20
		});
		indWin.add(message);
		indWin.open();
	} 
	else {
		actInd.message = "Generating...";
	}
	actInd.show();
	
	actInd.hideMe = function() {
		actInd.hide();
		if (Ti.Platform.osname != 'android') {
			indWin.close({opacity:0,duration:500});
		}
	}
	return actInd;
}


/*
 * Create dialogs with callback functions as parameters
 */
var saveDrawingDlg = new SaveDrawingDlg(saveDrawing);
var openDrawingDlg = new OpenDrawingDlg(openDrawing);
var si3DPropsDlg = new Si3DPropsDlg(createSi3D);
var shareDlg = new ShareDlg(drawView);
var purchaseDlg = new PurchaseDlg(purchaseLicense);
var continueDlg = new ContinueDlg();
