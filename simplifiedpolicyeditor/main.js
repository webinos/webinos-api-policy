/* INIT */


/* document.ready equivalent (http://stackoverflow.com/questions/1795089/need-help-with-jquery-to-javascript/1795167#1795167) */
// Mozilla, Opera, Webkit
if ( document.addEventListener ) {
  document.addEventListener( "DOMContentLoaded", function(){
    document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
    domReady();
  }, false );

// If IE event model is used
} else if ( document.attachEvent ) {
  // ensure firing before onload
  document.attachEvent("onreadystatechange", function(){
    if ( document.readyState === "complete" ) {
      document.detachEvent( "onreadystatechange", arguments.callee );
      domReady();
    }
  });
}

var domObjs = {}; //a place to gather frequently used dom objects (+ onclick active class, and so on)

function domReady () {
	//header menu buttons + overlay
	document.getElementById('show-menu').onclick = function(){toggleMenu('menu')};
	document.getElementById('show-actions').onclick = function(){toggleMenu('actions')};
	document.getElementById('menu_overlay').onclick = function(){hideMenu()};

	//menu items and tabs init
	enableMenuAndInitFirstPage('menu', 'screens');
	enableMenuAndInitFirstPage('policyEditor-tabs', 'tabsPolEd');
	var polEdSwTabs = new SwipeableTabs('policyEditor-tabs', 'policyEditorPage');
    polEdSwTabs.init();
}


/* GENERAL */


function removeClass(element, className) {
	if(typeof element != 'object') element = document.getElementById(element);
	var classString = element.className;
	var newClassString = '';
	var indexPos = classString.indexOf(className);
	if(indexPos == -1) {
		return;
	} else if (indexPos == 0) {
		newClassString = classString.substring(0, indexPos) + classString.substr(indexPos+className.length);
	} else {
		newClassString = classString.substring(0, indexPos-1) + classString.substr(indexPos+className.length);
	}

	element.className = newClassString;
}

function addClass(element, className) {
	if(typeof element != 'object') element = document.getElementById(element);
	var classString = element.className;
	if(classString != '') {
		var indexPos = classString.indexOf(className);
		if(indexPos == -1) {
			element.className += ' '+className;
		}
	} else {
		element.className = className;
	}
}

function selectItem(elements, active) {
	if(typeof elements == 'string') {
		elements = domObjs[elements];
	} else if(typeof elements != 'object' || (typeof elements == 'object' && isNaN(elements.length)) ) { //not an array
		console.log("selectItem: bad object type");
	}

	for(var i=0, j=elements.length; i<j; i++) {
		if(i == active) {
			addClass(elements[i], 'selected');
			continue;
		}
		removeClass(elements[i], 'selected');
	}
}

function getObjFromArrayById(id, array, returnWithPosition) {
	var i = 0,
		j = array.length;
	for(i; i<j; i++) {
		if(array[i].id == id) {
			var result;
			if(returnWithPosition) {
				result = {obj:array[i], pos:i};
			} else {
				result = array[i];
			}
			return result;
		}
	}
	return false;
}

function GetVendorPrefix(arrayOfPrefixes) {
	var i = 0;
		j = arrayOfPrefixes.length;

	for (i; i < j; ++i) {
		if (typeof document.body.style[arrayOfPrefixes[i]] != 'undefined'){
			return arrayOfPrefixes[i];
		}
	}

	return null;
}
var transformPrefixed = GetVendorPrefix(["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"]);

function showPopup(popup) {
	domObjs.popupOverlay.style.top = document.body.scrollTop+'px'; //center
	domObjs.popupOverlay.style.display = "table";
	domObjs.popupContainer.style.display = "table-cell";
	popup.style.display = "block";
	//document.body.style.overflow = "hidden";

	if(!popup.closeButtonsInitialized) {
		var closeButtons = popup.getElementsByClassName('popup-close'),
			i=0,
			j=closeButtons.length;

		for(i; i<j; i++) {
			closeButtons[i].onclick = (function(thisPopup, buttonAction) {
				return function() {
					if(typeof buttonAction == "function") buttonAction(); //previously declared onclick function
					closePopup(thisPopup);
				};
			})(popup, closeButtons[i].onclick);
		}

		popup.closeButtonsInitialized = true;
	}
}

function closePopup(popup) {
	domObjs.popupOverlay.style.display = "none";
	domObjs.popupContainer.style.display = "none";
	popup.style.display = "none";
	//document.body.style.overflow = "visible";
}

function showPage(linkId, type) {
	var pageId = linkId.split("-")[1]; //"linkTo-quickSettings"
	if(pageId) {
		var cachedPages = domObjs.pages[type];
		var currentPage = cachedPages._currentPage;
		var page;
		if(cachedPages[pageId]) {
			page = cachedPages[pageId];
		} else {
			page = document.getElementById(pageId);
		}
		if(currentPage) currentPage.style.display = "none";
		page.style.display = "block";
		cachedPages._currentPage = page;
	} else {
		console.log("Can't show this page, bad id: "+linkId);
	}
}

function enableMenuAndInitFirstPage(id, type) {
	var clickables = document.getElementById(id).children;

	var i = 0,
	j = clickables.length;

	for(i;i<j;i++) {
		clickables[i].onclick = (function(elements, clickedEl, type) {
			return function() {
				if(window.skipNextClick == this) { //TODO
					window.skipNextClick = null;
					return;
				}
				selectItem(elements, clickedEl);
				showPage(this.id, type);
				hideMenu();
			};
		})(clickables, i, type);

		if(clickables[i].className == "selected") { //init
			domObjs.pages = domObjs.pages || {};
			domObjs.pages[type] = {};
			showPage(clickables[i].id, type);
		}
	}
};

function drawPermissionButtons(container, buttons, active) {
	if(typeof container != 'object') container = document.getElementById(container);

	var docFragment = document.createDocumentFragment();
	var buttonObjList = domObjs[container.id] = []; //if the container has no id, clicking will not work
	var tmpBtnObj;
	var i = 0,
		j = buttons.length;

	for(i;i<j;i++) {
		tmpBtnObj = document.createElement("div");
		tmpBtnObj.innerHTML = buttons[i].n;
		tmpBtnObj.className = "button "+buttons[i].c;

		tmpBtnObj.onclick = (function(buttons, clickedEl) {
			return function() {
				selectItem(buttons, clickedEl);
			};
		})(container.id, i);

		docFragment.appendChild(tmpBtnObj);
		buttonObjList.push(tmpBtnObj);
	}

	//set active button
	if(!active) {
		var active = 0;
	}
	addClass(buttonObjList[active], 'selected');

	//set class for number of buttons
	addClass(container, 'noOfButtons'+j);

	container.appendChild(docFragment);
}


/* DATE MANIPULATION */


function getDayName(date) {
	var dateNow = new Date();
	var dateYesterday = new Date();
	dateYesterday.setDate(dateNow.getDate() - 1);
	var givenYear = date.getFullYear(),
		givenMonth = date.getMonth(),
		givenDay = date.getDate();

	if (givenYear === dateNow.getFullYear() &&
		givenMonth === dateNow.getMonth() &&
		givenDay === dateNow.getDate()
		)
	{
		return 'Today';
	} else if (	givenYear === dateYesterday.getFullYear() &&
				givenMonth === dateYesterday.getMonth() &&
				givenDay === dateYesterday.getDate()
				)
	{
		return 'Yesterday';
	} else {
		if(givenDay<10) givenDay = '0'+givenDay;
		givenMonth+=1;
		if(givenMonth<10) givenMonth = '0'+givenMonth;
		return givenDay+'.'+givenMonth+'.'+givenYear;
	}
	/* else {
		var day = date.getDay();
		switch (day) {
		case 0:
			return 'Sunday';
			break;
		case 1:
			return 'Monday';
			break;
		case 2:
			return 'Tuesday';
			break;
		case 3:
			return 'Wednesday';
			break;
		case 4:
			return 'Thursday';
			break;
		case 5:
			return 'Friday';
			break;
		case 6:
			return 'Saturday';
			break;
		}
	}*/
}

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	var hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}


/* DRAW */


var enablePopups = function() {
	//init
	domObjs.popupOverlay = document.getElementById('popup_overlay');
	domObjs.popupContainer = document.getElementById('popup_container');

	//popups
	domObjs.popupTest = document.getElementById('popup-test');
	

	domObjs.popupAddPermission = document.getElementById('popup-addPermission');
	domObjs.popupDeletePermission = document.getElementById('popup-deletePermission');

	//buttons opening popups
	document.getElementById('t-test').onclick = function() {showPopup(domObjs.popupTest)};

	document.getElementById('peopleAddAllow').onclick = function() {permissionEditPopup('allow')};
	document.getElementById('peopleAddDeny').onclick = function() {permissionEditPopup('deny')};

	document.getElementById('servicesAddAllow').onclick = function() {permissionEditPopup('allow')};
	document.getElementById('servicesAddDeny').onclick = function() {permissionEditPopup('deny')};

	document.getElementById('popup-deletePermission-confirm').onclick = function() {deletePermission()};
	//buttons/elements inside popups
	document.getElementById('popup-addPermission-save').onclick = function() {addEditPermission()};

	domObjs.popupAddPermissionId = document.getElementById('popup-addPermission-id');
	domObjs.popupAddPermissionName = document.getElementById('popup-addPermission-name');
	domObjs.popupAddPermissionPerson = document.getElementById('popup-addPermission-person');
	domObjs.popupAddPermissionType = document.getElementById('popup-addPermission-type');
	domObjs.popupAddPermissionAction = document.getElementById('popup-addPermission-action');
	domObjs.popupAddPermissionNameContainer = document.getElementById('popup-addPermission-name-container');


	/* policy entity edit tabs - quite verbose... but it seems like I don't need a function for anything similar to this */
	var popupAddPermissionSummaryTab = document.getElementById('popup-addPermission-summary-tab');
	var popupAddPermissionDetailsTab = document.getElementById('popup-addPermission-details-tab');
	var popupAddPermissionTabs = [popupAddPermissionSummaryTab, popupAddPermissionDetailsTab];
	domObjs.popupAddPermissionSummaryPage = document.getElementById('popup-addPermission-summary-content');
	domObjs.popupAddPermissionDetailsPage = document.getElementById('popup-addPermission-details-content');

	popupAddPermissionSummaryTab.onclick = function() {
		selectItem(popupAddPermissionTabs, 0);
		domObjs.popupAddPermissionSummaryPage.style.display = 'block';
		domObjs.popupAddPermissionDetailsPage.style.display = 'none';
	}
	popupAddPermissionDetailsTab.onclick = function() {
		selectItem(popupAddPermissionTabs, 1);
		domObjs.popupAddPermissionSummaryPage.style.display = 'none';
		domObjs.popupAddPermissionDetailsPage.style.display = 'block';
	}
	/* policy entity edit tabs END */

}();

/*var toolbarShowHide = function() {
	domObjs.toolbar = document.getElementById('toolbar');
	document.getElementById('toolbar-showhide').onclick = function() {
		if(domObjs.toolbar.style.maxHeight != '100%') {
			domObjs.toolbar.style.maxHeight = '100%';
			addClass(this, 'hide');
		} else {
			domObjs.toolbar.style.maxHeight = '10px';
			removeClass(this, 'hide');
		}
	};
}();*/


function toggleMenu(menu) {
	if(!appData.menuVisible) {
		addClass(document.body, menu+'-unfolded');
		appData.menuVisible = menu;
	} else {
		removeClass(document.body, appData.menuVisible+'-unfolded');
		if(appData.menuVisible == menu) {
			appData.menuVisible = false;
		} else {
			addClass(document.body, menu+'-unfolded');
			appData.menuVisible = menu;
		}
	}
}
function hideMenu() {
	removeClass(document.body, appData.menuVisible+'-unfolded');
	appData.menuVisible = false;
}

function SwipeableTabs(elId, containerId) {
	var that = this;

	this.container = document.getElementById(containerId);
	this.tabs = document.getElementById(elId);

	this.container_width = 0;
	this.tab_width = 0;
	this.scroll_limit = 0;
	this.current_pos = 0;

	this.init = function() {
		this.initNeeded = true;
		this.setDimensions();

		window.addEventListener("orientationchange", function() { this.initNeeded = true; }, false);
		window.addEventListener("resize", function() { this.initNeeded = true; }, false);
	};

	this.setDimensions = function() {
		if(this.initNeeded) {
			this.container_width = this.container.offsetWidth;
			this.tab_width = this.tabs.offsetWidth;
			//check old limit here and adjust pos?
			this.scroll_limit = this.container_width - this.tab_width;
			this.reinitNeeded = false;
			if(this.scroll_limit != 0) {
				this.tabs.style.cursor = 'move';
			} else {
				this.tabs.style.cursor = 'default';
			}
		}
	};

	this.setContainerOffset = function(move, animate) {
		//container.removeClass("animate");

		//if(animate) {
		//	container.addClass("animate");
		//}
		var newPos = this.current_pos + move;
		if(newPos > 0) {
			newPos = 0;
		} else if(newPos < this.scroll_limit) {
			newPos = this.scroll_limit;
		}

		if(transformPrefixed) { //this is set outside this object somewhere above
			this.tabs.style[transformPrefixed] = "translate3d("+ newPos +"px,0,0)";
		} else {
			var px = ((pane_width*pane_count) / 100) * percent; //TODO
			container.css("left", px+"px");
		}

		this.current_pos = newPos;
	}

	function handleHammer(ev) {
		//console.log(ev);
		// disable browser scrolling
		ev.gesture.preventDefault();

		switch(ev.type) {
			case 'touch':
				that.setDimensions();
				that.oldDeltaX = 0;
				window.skipNextClick = null; //TODO
				break;
			case 'dragright':
			case 'dragleft':
				that.setContainerOffset(ev.gesture.deltaX - that.oldDeltaX);
				that.oldDeltaX = ev.gesture.deltaX;
				window.skipNextClick = ev.target; //TODO
				break;
		}
	}

	Hammer(this.tabs, { drag_lock_to_axis: true }).on("touch dragleft dragright", handleHammer);
}
