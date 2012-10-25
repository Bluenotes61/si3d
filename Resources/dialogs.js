/*
 * Creates a standard text button
 */
function getTextButton(left, text, color) {
	var btn =	Ti.UI.createButton({
		backgroundImage:(color == 'brown' ? "img/btn_bg_brown.png" : "img/btn_bg_blue.png"),
		backgroundSelectedImage:(color == 'brown' ? "img/btn_bg_brown_pressed.png" : "img/btn_bg_blue_pressed.png"),
		left: left,
	  width: (Ti.Platform.osname == 'ipad' ? '120dp' : '100dp'),
	  height: '40dp',
	  color:(color == 'brown' ? '#fff' : '#666'),
	  selectedColor:(color == 'brown' ? '#fff' : '#000'),
	  font: {fontSize:'18dp', fontWeight:'bold'},
	  title: text
	});
	return btn;
}

/*
 * Dialog with parent common functionality for the dialogs below
 */
var BaseDialog = function() {
	
	var obj = this;
	this.dlg = null;
	
	this.createDialog = function(width, height, title, okText, okCallback) {
		var t = Ti.UI.create2DMatrix();
  	t = t.scale(0);

		obj.dlg = Ti.UI.createWindow({
			backgroundColor: '#266984',
			borderColor:'#fff',
			borderWidth:'2dp',
			borderRadius: 10,
			navBarHidden: true,
			width: width,
			height: height,
			transform:t
		});
		
  	this.title = Ti.UI.createLabel({
			text: title,
			top: (Ti.Platform.osname == 'ipad' ? '20dp' : '10dp'),
			left:(Ti.Platform.osname == 'ipad' ? '20dp' : '10dp'),
			right:(Ti.Platform.osname == 'ipad' ? '20dp' : '10dp'),
			textAlign:'center',
			shadowColor:'#666',
			shadowOffset:'10dp',
			color:"#fff",
			font: {fontSize:'24dp', fontWeight:'bold'}
		});

		obj.dlg.add(obj.title);

    this.setTitle = function(atitle){
    	obj.title.setText(atitle);
    };
    
	  obj.dbb = Ti.UI.createView({
	  	layout: 'horizontal',
	  	top:parseInt(height)-(Ti.Platform.osname == 'ipad' ? 60 : 50),
	  	left:parseInt(width)/2 - 260/2
	  });
	  obj.dlg.add(obj.dbb);
	  if (okText.length > 0) {
	  	var okbtn = getTextButton('0dp', okText, "brown");
			okbtn.addEventListener('click', okCallback);
		  obj.dbb.add(okbtn);
	  
	  	var cancelbtn = getTextButton('20dp', 'CANCEL', 'blue');
			cancelbtn.addEventListener('click', function(){
				obj.close();
			});
		  obj.dbb.add(cancelbtn);
		}
	}
	
	this.close = function() {
		var t3 = Titanium.UI.create2DMatrix();
		t3 = t3.scale(0);
		obj.dlg.close({transform:t3,duration:500});
	}
  
  this.open = function() {
    var t1 = Titanium.UI.create2DMatrix();
	  t1 = t1.scale(1.1);
	  var a = Titanium.UI.createAnimation();
	  a.transform = t1;
	  a.duration = 500;		
		
		a.addEventListener('complete', function() {
			var t2 = Titanium.UI.create2DMatrix();
			t2 = t2.scale(1.0);
			obj.dlg.animate({transform:t2, duration:200});
		});
		
 	 obj.dlg.open(a);
  }
}

/*
 * Dialog where the user can answer Continue or Cancel
 */
var ContinueDlg = function(headline) {
	var parent = new BaseDialog();
	var okCallback = null;
	
	parent.createDialog('300dp', '160dp', "headline", 'CONTINUE', function(){
		okCallback();
		parent.dlg.close();
	});

  this.open = function(headline, aokCallback) {
  	parent.setTitle(headline);
  	okCallback = aokCallback;
  	parent.open();
  }
}


/*
 * Dialog for naming a drawing for saving to local database
 */
var SaveDrawingDlg = function(okCallback) {
	var parent = new BaseDialog();
	var drawingData = '';
	
	parent.createDialog('350dp', '180dp', 'Name your si3D drawing', 'SAVE', function(){
		if (textField.value.length > 0) {
			okCallback(textField.value, drawingData);
			parent.dlg.close();
		}
	});

  this.open = function(data) {
  	drawingData = data;
  	parent.open();
  }
	var textField =	Ti.UI.createTextField({
		borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    color: '#000',
		left:'20dp',
		top:'70dp',
		width:'310dp'
	});
	parent.dlg.add(textField);

}


/*
 * Dialog for selecting a saved si3d drawing
 */
var OpenDrawingDlg = function(okCallback) {
	var parent = new BaseDialog();
  var dlgheight = (Ti.Platform.osname == 'ipad' ? '350dp' : '300dp');

	parent.createDialog('350dp', dlgheight, 'Select saved drawing', 'OPEN', function(){
		okCallback(picker.getSelectedRow(0));
		parent.dlg.close();
	});

  this.open = function() {
  	getData();
  	parent.open();
  }
  var picker = Ti.UI.createPicker({
    top:'70dp',
    left:'20dp',
    right:'20dp',
    bottom:'90dp'
  });
  picker.selectionIndicator = true;
  parent.dlg.add(picker);
  
  function getData() {
	  var data = [];
	  var idx = 0;
	  var dbsql = Ti.Database.open('si3dDB');
		var rs = dbsql.execute('SELECT name, json FROM drawings order by id desc');
		while (rs.isValidRow()) {
		  var item = {title:rs.fieldByName('name'), custom_item:rs.fieldByName('json')};
	    data[idx] = Ti.UI.createPickerRow(item);
		  rs.next();
		  idx++;
		}
		rs.close();
		dbsql.close();
		
    if (picker.columns[0]) {
      var col = picker.columns[0];
      while (col.rowCount > 0) 
        col.removeRow(col.rows[0]);
    }		
	  picker.add(data);
	}

}



/*
 * Dialog with options for creating the si3D
 */
var Si3DPropsDlg = function(okCallback) {
	var obj = this;
	var parent = new BaseDialog();
	var dlgheight = (Ti.Platform.osname == 'ipad' ? '400dp' : '300dp');
	/*
	 * si3d properties
	 */
	this.props = {
		width:0,
		height:0,
		nofFields: 6,
		fieldWidth:0,
		random:true,
		image:null,
		thumbPath:  '',
		si3durl:''
	}

	parent.createDialog('400dp', dlgheight, 'Stereogram creation options', 'CREATE', function(){
		parent.dlg.close();
		okCallback();
	});

  if (Ti.Platform.osname != 'ipad') 
    parent.dbb.setLeft('160dp');

  this.open = function() {
		btnRandom.setEnabled(!obj.props.random);
		btnImage.setEnabled(obj.props.random);

  	parent.open();
    picker.setSelectedRow(0, obj.props.nofFields - 4);
  }

	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Pattern repeats',
			left:'35dp',
			top:(Ti.Platform.osname == 'ipad' ? '65dp' : '50dp'),
			color:"#fff",
			font:{fontSize:'18pt', fontWeight:'bold'}
		})
	);
	var picker = Ti.UI.createPicker({
    top:(Ti.Platform.osname == 'ipad' ? '95dp' : '80dp'),
    left:'45dp',
    width:'100dp',
    visibleItems:5,
    selectionIndicator:true
  });
  var data = [];
  for (var i=4; i <= 12; i++)
    data[i-4]=Ti.UI.createPickerRow({title:String(i)});
  picker.add(data);
	picker.addEventListener('change', function(e){
		obj.props.nofFields = e.row.title;
  	obj.props.fieldWidth = Math.ceil(obj.props.width/obj.props.nofFields);
	});
  parent.dlg.add(picker);
	
	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Pattern type',
			top:(Ti.Platform.osname == 'ipad' ? '65dp' : '50dp'),
			left:'210dp',
			color:"#fff",
			font:{fontSize:'18pt', fontWeight:'bold'}
		})
	);
	
	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Random dots',
			top:(Ti.Platform.osname == 'ipad' ? '105dp' : '85dp'),
			left:'250dp',
			color:"#fff"
		})
	);
	var btnRandom = Ti.UI.createButton({
	  backgroundImage:'img/radio_off.png',
	  backgroundDisabledImage:'img/radio_on.png',
	  enabled:false,
	  width:'21dp',
	  height:'21dp',
	  top:(Ti.Platform.osname == 'ipad' ? '105dp' : '85dp'),
	  left:'210dp'
	});
	btnRandom.addEventListener('click',function(e) {
		obj.props.random = true;
		btnImage.setEnabled(true);
		this.setEnabled(false);
  });
	parent.dlg.add(btnRandom);
	
	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Image',
			top:(Ti.Platform.osname == 'ipad' ? '150dp' : '120dp'),
			left:'250dp',
			color:"#fff"
		})
	);
	var btnImage = Ti.UI.createButton({
	  backgroundImage:'img/radio_off.png',
	  backgroundDisabledImage:'img/radio_on.png',
	  enabled:true,
	  width:'21dp',
	  height:'21dp',
	  top:(Ti.Platform.osname == 'ipad' ? '150dp' : '120dp'),
	  left:'210dp'
	});
	btnImage.addEventListener('click', function(){
		if (!obj.props.image) {
			selectImage();
		}
		else {
		  obj.props.random = false;
			btnRandom.setEnabled(true);
			this.setEnabled(false);
		}
  });
	parent.dlg.add(btnImage);
	
	var btnSelImage = Ti.UI.createButton({
		backgroundColor:'#266984',
	  backgroundImage:'',
	  enabled:true,
	  width:(Ti.Platform.osname == 'ipad' ? '100dp' : '80dp'),
	  height:(Ti.Platform.osname == 'ipad' ? '100dp' : '80dp'),
	  top: (Ti.Platform.osname == 'ipad' ? '205dp' : '160dp'),
	  left:'210dp'
	});
	btnSelImage.addEventListener('click', selectImage);
	parent.dlg.add(btnSelImage);

  function getGuid() {
		function S4() {  
		  return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
		}
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
  }

	function selectImage() {
	  Ti.Media.openPhotoGallery({success:function(e){
	  	var aspect = e.media.width/e.media.height;
	  	var ih = obj.props.height;
	  	var iw = ih*aspect;
	
			obj.props.image = e.media.imageAsResized(parseInt(iw), parseInt(ih));

	  	var thumb = e.media.imageAsThumbnail((Ti.Platform.osname == 'ipad' ? 100 : 80), 1, 10);
	    var tf = Titanium.Filesystem.getFile(Titanium.Filesystem.getTempDirectory(), getGuid() + '.jpg');
	    tf.write(thumb); 
	    obj.props.thumbPath = tf.nativePath;

      obj.props.random = false;
	  	btnSelImage.backgroundImage = obj.props.thumbPath;
			btnRandom.setEnabled(true);
			btnImage.setEnabled(false);
	  }});
	}
}


/*
 * Dialog with different options for sharing the si3d
 */
var ShareDlg = function(drawView) {
	var parent = new BaseDialog();
	var si3durl = '';
  
  function addImageButton(left, top, image, clickevent) {
		var btn =	Ti.UI.createButton({
		  width:'60dp',
		  height:'60dp',
		  left:left,
		  top:top,
		  image:image,
			style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		btn.addEventListener('click', clickevent);
    parent.dlg.add(btn);		
  }
	
  parent.createDialog('350dp', (Ti.Platform.osname == 'ipad' ? '330dp' : '280dp'), 'Share your stereogram', '', function(){});

	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Open in browser',
			top:(Ti.Platform.osname == 'ipad' ? '60dp' : '40dp'),
			left:'30dp',
			color:"#fff"
		})
	);
  addImageButton('70dp', (Ti.Platform.osname == 'ipad' ? '80dp' : '60dp'), 'img/btn_www.png', function(){
    parent.dlg.close();
		Ti.Platform.openURL(si3durl);
  });

	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Save to device',
			top:(Ti.Platform.osname == 'ipad' ? '60dp' : '40dp'),
			left:'200dp',
			color:"#fff"
		})
	);
  addImageButton('230dp', (Ti.Platform.osname == 'ipad' ? '80dp' : '60dp'), 'img/btn_savesi3d.png', function(){
    parent.dlg.close();
		var img = drawView.toImage();
		Titanium.Media.saveToPhotoGallery(img);
		alert('si3D stereogram has been saved in your image gallery.');
  });

	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Share on Facebook',
			top:(Ti.Platform.osname == 'ipad' ? '160dp' : '120dp'),
			left:'30dp',
			color:"#fff"
		})
	);
  addImageButton('70dp', (Ti.Platform.osname == 'ipad' ? '190dp' : '150dp'), 'img/btn_facebook.png', function(){
    parent.dlg.close();
		Titanium.Platform.openURL("http://www.facebook.com/sharer.php?u=" + si3durl + "&t=si3D stereogram");
  });
  
	parent.dlg.add(
		Ti.UI.createLabel({
			text:'Send by email',
			top:(Ti.Platform.osname == 'ipad' ? '160dp' : '120dp'),
			left:'200dp',
			color:"#fff"
		})
	);
  addImageButton('220dp', (Ti.Platform.osname == 'ipad' ? '190dp' : '150dp'), 'img/btn_mail.png', function(){
    parent.dlg.close();
    setTimeout(function(){
		var emailDialog = Titanium.UI.createEmailDialog();
		  emailDialog.setSubject("Stereogram from si3D");
		  emailDialog.setMessageBody("View the stereogram here: " + si3durl);
		  //emailDialog.setHtml("To view the stereogram, <a href='" + si3DPropsDlg.props.si3durl + "'>click here</a>.");
		  emailDialog.open();
    }, 1000);
  });

	var closebtn = getTextButton('100dp', 'Close', "brown");
	closebtn.top = (Ti.Platform.osname == 'ipad' ? '270dp' : '230dp');
	closebtn.left = '115dp';
	closebtn.addEventListener('click', function(){
    parent.dlg.close();
	});
	parent.dlg.add(closebtn);

  this.open = function(asi3durl) {
  	si3durl = asi3durl;
  	parent.open();
  }
}


/*
 * Dialog with information for buying a license
 */
var PurchaseDlg = function(okCallback) {
	var parent = new BaseDialog();
  
	parent.createDialog('350dp', '220dp', 'Share your stereogram', 'PROCEED', function(){
		okCallback();
		parent.dlg.close();
	});
	
	var text =	Ti.UI.createLabel({
		text:'To get your si3D stereograms in higher resolution and to be able to save them or share them with your friends, you need a si3D sharing license.',
		top:'60dp',
		color:"#fff",
		left:'20dp',
		width:'310dp'
	});
	parent.dlg.add(text);

  this.open = function(ahasLicense, asi3durl) {
  	parent.open();
  }
}
