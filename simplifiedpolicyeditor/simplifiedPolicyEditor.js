/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 Torsec -Computer and network security group-
 * Politecnico di Torino
 *
 ******************************************************************************/



var mocked = {};

mocked.quickSettings = [{
	name: "Incognito",
	enabled: true
}, {
	name: "Internet",
	enabled: false
}, {
	name: "Local Discovery",
	enabled: true
}, {
	name: "Location",
	enabled: true
}, {
	name: "Payment",
	enabled: false
}, {
	name: "People",
	enabled: true
}, {
	name: "SMS & Telephony",
	enabled: false
}];


mocked.quickStatus = [{
	name: "Internet",
	status: false
}, {
	name: "GPS",
	status: true
}];

// Here we delete the people matrix but instead fo rawPeople and rawServices, after deleted the already existing services and people, it will be inserted into the people, and services matrix.
// No, too complex, the name is used in many ways, better use another name to store the lists.

mocked.people = [{
	id: 1,
	name: "Tardar Sauce",
	email: "grumpy@nonexistent.com",
}, {
	id: 2,
	name: "Pokey Feline",
	email: "pokey@nonexistent.com",
}];
/*
mocked.people = [];
webinos.session.getConnectedDevices().map( function(elem) {
    mocked['people'].push({'id':elem.id
      , 'name':elem.friendlyName
      , 'email':''
    })
});
console.log("\n\n\n\n");
console.log(mocked.people);
console.log("\n\n\n\n");
*/

mocked.services = [{
	id: 1,
	name: 'GPS'
}, {
	id: 2,
	name: 'Wifi'
}, {
	id: 3,
	name: 'Photo'
}, {
	id: 4,
	name: 'Video'
}, {
	id: 5,
	name: 'SMS'
}];

mocked.permissions = [{
	id: 0,
	personId: 1,
	name: "Navigation",
	serviceId: 1,
	perm: 1 //1 allow, 0 prompt, -1 deny
}, {
	id: 1,
	personId: 1,
	name: "Wifi",
	serviceId: 2,
	perm: 1
}, {
	id: 2,
	personId: 1,
	name: "Photos",
	serviceId: 3,
	perm: 1
}, {
	id: 3,
	personId: 1,
	name: "Camera",
	serviceId: 4,
	perm: -1
}, {
	id: 4,
	personId: 1,
	name: "SMS",
	serviceId: 5,
	perm: -1
}, { //2nd person
	id: 6,
	personId: 2,
	name: "GPS",
	serviceId: 1,
	perm: -1
}, {
	id: 7,
	personId: 2,
	name: "Wifi",
	serviceId: 2,
	perm: 1
}];

//mock generator
var generateMockedData = function(arrayObjectName, quantity) {
	var i = 0,
		randomnumber,
		destArr = mocked[arrayObjectName];

	for(i; i<quantity; i++) {
	        if(arrayObjectName == 'people') {
		        destArr.push({
				id: i+3,
			        name: "Loremford Ipsumov "+(i+1),
				email: "lorips"+(i+1)+"@nonexistent.com",
			});
		}
	}
}

// generate more mocked data
generateMockedData('people', 4);



//-----------------------------------Functions starts here--------
var appData = {};
appData = mocked; //Here works for the presentation......

// Trying to delete existing entries.
appData.deletedPeople = appData.people;
appData.deletedServices = appData.services;



//-----------------------------------Quick Settings here----------
function disableQuickSettingsSwitch(name) {
	var quickSettings = appData.quickSettings,
		i = 0,
		j = quickSettings.length;

	for(i; i<j; i++) {
		if(quickSettings[i].name == name) {
			document.getElementById('myonoffswitch'+i).disabled = true;
			addClass('qsnl'+i, 'disabled');
			break;
		}
	}
}



var drawQuickSettings = function() {
	var quickSettingsSwitchesContainer = document.getElementById('quickSettings-switches-content'),
		quickSettingsStatusContainer = document.getElementById('quickSettings-status-content'),
		html = '',
		quickSettings = appData.quickSettings || [],
		quickStatus = appData.quickStatus || [],
		i = 0,
		j = quickSettings.length,
		checked = '',
		active = '';

	for(i; i<j; i++) {
		if(quickSettings[i].enabled) {
			checked = ' checked';
		} else {
			checked = '';
		}

		html += '' +
			'<label id="qsnl'+i+'" class="onoffswitch-namelabel" for="myonoffswitch'+i+'">'+quickSettings[i].name+'</label>' +
			'<div class="onoffswitch">' +
				'<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch'+i+'"'+checked+'>' +
				'<label class="onoffswitch-label" for="myonoffswitch'+i+'">' +
					'<div class="onoffswitch-inner"></div>' +
					'<div class="onoffswitch-switch"></div>' +
				'</label>' +
			'</div>';
	}

	quickSettingsSwitchesContainer.innerHTML = html;

	//reset and continue
	html = '';
	i = 0;
	j = quickStatus.length;

	for(i; i<j; i++) {
		if(quickStatus[i].status) {
			active = ' active';
		} else {
			active = ' inactive';
			disableQuickSettingsSwitch(quickStatus[i].name);
		}

		html += '' +
			'<div class="qstatus-name">'+quickStatus[i].name+'</div><div class="qstatus-icon'+active+'" id="status-icon'+i+'"></div>';
	}

	quickSettingsStatusContainer.innerHTML = html;
}();




//------------------------------------------------- DRAG & DROP here

function handleDragStart(e) { // this / e.target is the source node.
	this.style.opacity = '0.4';
	appData.dragSrcEl = this;
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData("text/plain", ""); //firefox needs this
	//console.log('drag start');
	//console.log(this);
}

function handleDragEnter(e) { // this / e.target is the current hover target.
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	addClass(this, 'over');
	appData.dragDestEl = this;
}

function handleDragOver(e) { // this / e.target is the current hover target.
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	e.dataTransfer.dropEffect = 'move';
	return false;
}

function handleDragLeave(e) { // this / e.target is previous target element.
	removeClass(this, 'over');
}

function handleDrop(e) { // this / e.target is current target element.
	if (e.stopPropagation) {
		e.stopPropagation(); // stops the browser from redirecting.
	}
	if (appData.dragSrcEl != this) {
		this.appendChild(appData.dragSrcEl);
		var id = appData.dragSrcEl.id;
		var columnId = this.id;
		var permission;
		if(columnId.indexOf('allow') != -1) {
			permission = 1;
		}  else if(columnId.indexOf('deny') != -1) {
			permission = -1;
		}
		updatePermission(id, permission);
	}
	//console.log('drag drop');
	//console.log(this);
	return false;
}

function handleDragEnd(e) { // this/e.target is the source node.
	this.style.opacity = '1';
	removeClass(appData.dragDestEl, 'over');
	//console.log('drag end');
	//console.log(this);
}

function dragDropInitColumns() {
	var cols = document.querySelectorAll('.column');
	[].forEach.call(cols, function(col) {
		col.addEventListener('dragenter', handleDragEnter, false)
		col.addEventListener('dragover', handleDragOver, false);
		col.addEventListener('dragleave', handleDragLeave, false);
		col.addEventListener('drop', handleDrop, false);
	});
}






//-----------------------------draw the select and options of PEOPLE---

var drawServices = function() {
	var services = appData.services || [],
		people = appData.people || [],
		delPeople = appData.deletedPeople || [];

	appData.servicesPolicies = {};
	domObjs.servicesPolicies = {};
	domObjs.servicesPolicies.peopleListContainer = document.getElementById('people-list');
	domObjs.servicesPolicies.servicesSelect = document.getElementById('services-people');
	domObjs.servicesPolicies.allow = document.getElementById('people-allow');
	domObjs.servicesPolicies.deny = document.getElementById('people-deny');

	domObjs.servicesPolicies.people = {};
	domObjs.servicesPolicies.permissions = {};

	createPeopleList(delPeople, domObjs.servicesPolicies.peopleListContainer, 'servicesPolicies');

	createServicesDropdownOptions(services, domObjs.servicesPolicies.servicesSelect, 'servicesPolicies');
	

	dragDropInitColumns();

	if(services.length > 0) {
		drawDraggablePermissions('servicesPolicies');
	}

}();

function createServicesDropdownOptions(services, dropdown, tab) {
	var docFrag = document.createDocumentFragment(),
		i = 0,
		j = services.length,
		option;

	for(i; i<j; i++) {
		option = document.createElement("option");
		option.setAttribute('value', services[i].id);
		option.textContent = services[i].name;
		docFrag.appendChild(option);
		if( i == 0 ) {
			setActiveService(services[i].id, tab); //init internal state		
		}
	}
	dropdown.appendChild(docFrag);
	dropdown.onchange = function() {
		var id = this.options[this.selectedIndex].value;
		setActiveService(id);
		drawDraggablePermissions();

	// If want to modify the people-list or the services-list, better start in this position, with draw new people/services lists.
	}
}

function setActiveService(id, tab) {
	if(!tab) {
		var tab =domObjs.pages.tabsPolEd._currentPage.id;
	}
	appData[tab].currentServiceId = id;
}


function createPeopleList(people, container, tab) {
	var i = 0,
		j = people.length,
		docFrag = document.createDocumentFragment();

	for(i; i<j; i++) {
		createPeopleListEntry(people[i], docFrag, tab);
	}
	container.appendChild(docFrag);
}

function createPeopleListEntry(people, parentElement, tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	var entry = document.createElement("div");
	entry.setAttribute('draggable', 'true');
	entry.setAttribute('style','display: block; font-weight: bold; font-size:100%');

	entry.textContent = people.name;

	entry.addEventListener('dragstart', handleDragStart, false);
	entry.addEventListener('dragend', handleDragEnd, false);

	parentElement.appendChild(entry);

	domObjs[tab].people[people.id] = entry;

	return entry;
}




//-----------------------------draw the select and options of SERVICES---

var drawPeople = function() {
	var services = appData.services || [],
		people = appData.people || [],
		delServices = appData.deletedServices || [];

	appData.peoplePolicies = {};
	domObjs.peoplePolicies = {};

	domObjs.peoplePolicies.servicesListContainer = document.getElementById('services-list');
	domObjs.peoplePolicies.peopleSelect = document.getElementById('people-services');
	domObjs.peoplePolicies.allow = document.getElementById('services-allow');
	domObjs.peoplePolicies.deny = document.getElementById('services-deny');

	domObjs.peoplePolicies.services = {};
	domObjs.peoplePolicies.permissions = {};

	createServicesList(delServices, domObjs.peoplePolicies.servicesListContainer, 'peoplePolicies');

	createPeopleDropdownOptions(people, domObjs.peoplePolicies.peopleSelect, 'peoplePolicies');

	dragDropInitColumns();
	
	if(people.length > 0) {
		drawDraggablePermissions('peoplePolicies');
	}

	fillOptionsFromArray(domObjs.popupAddPermissionType, appData.services);
	fillOptionsFromArray(domObjs.popupAddPermissionPerson, appData.people);
}();


function createPeopleDropdownOptions(people, dropdown, tab) {
	var docFrag = document.createDocumentFragment(),
		i = 0,
		j = people.length,
		option;

	for(i; i<j; i++) {
		option = document.createElement("option");
		option.setAttribute('value', people[i].id);
		option.textContent = people[i].name;
		docFrag.appendChild(option);
		if(i == 0) {
			setActivePerson(people[i].id, tab); //initial internal state.
		}
	}
	dropdown.appendChild(docFrag);
	dropdown.onchange = function() {
		var id = this.options[this.selectedIndex].value;
		setActivePerson(id);
		drawDraggablePermissions();
	}
}

function setActivePerson(id, tab) {
	if(!tab) {
		var tab =domObjs.pages.tabsPolEd._currentPage.id;
	}
	appData[tab].currentPersonId = id;
}



function createServicesList(services, container, tab) {
	var i = 0,
		j = services.length,
		docFrag = document.createDocumentFragment();
	
	for(i; i<j; i++) {
		createServicesListEntry(services[i], docFrag, tab);
	}
	container.appendChild(docFrag);
}

function createServicesListEntry(service, parentElement, tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	var entry = document.createElement("div");
	entry.setAttribute('draggable','true');
	entry.setAttribute('style','font-weight: bold; font-size:100%');
	entry.textContent = service.name;

	entry.addEventListener('dragstart', handleDragStart, false);
	entry.addEventListener('dragend', handleDragEnd, false);


	parentElement.appendChild(entry);
	domObjs[tab].services[service.id] = entry;
	return entry;
	
}







//-----------Supplimentary functions---------------



function drawDraggablePermissions(tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	var permissions,
		permissionId;

	permissions = appData.permissions || [];

	var temPersonId = appData[tab].currentPersonId,
		temServiceId = appData[tab].currentServiceId;
//	if(!tab || !temPersonId || !temServiceId) return false;

	domObjs[tab].allow.innerHTML = '';
	domObjs[tab].deny.innerHTML = '';

	var docFragAllow = document.createDocumentFragment(),
		docFragDeny = document.createDocumentFragment(),
		i = 0,
		j = permissions.length;

// This place still need to modify.	

	if(tab == 'peoplePolicies') {
		for(i; i<j; i++) {
			//if(permissions[i][permissionId] == currentPermId && permissions[i].personId == personId) {
			if(permissions[i].personId == temPersonId) {
				if(permissions[i].perm == 1) {
					docFrag = docFragAllow;
				} else if(permissions[i].perm == -1) {
					docFrag = docFragDeny;
				}
				createPermissionEntry(permissions[i], docFrag, tab);
			}	
		}
		domObjs[tab].allow.appendChild(docFragAllow);
		domObjs[tab].deny.appendChild(docFragDeny);
		
	}
	else if(tab == 'servicesPolicies') {
	
		for(i; i<j; i++) {
			//if(permissions[i][permissionId] == currentPermId && permissions[i].personId == personId) {
			if(permissions[i].serviceId == temServiceId) {
				if(permissions[i].perm == 1) {
					docFrag = docFragAllow;
				} else if(permissions[i].perm == -1) {
					docFrag = docFragDeny;
				}
				createPermissionEntry(permissions[i], docFrag, tab);
			}	
		}
		domObjs[tab].allow.appendChild(docFragAllow);
		domObjs[tab].deny.appendChild(docFragDeny);
	}

}

// This function has not finished yet. This function only works with the entry, not what I need now.
function createPermissionEntry(permission, docFrag, tab) {
	var entry,
		name,
		controls,
		edit,
		del,
		nameHtml;
	
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	if(tab == 'peoplePolicies') {
		nameHtml = '<b>'+getObjFromArrayById(permission.serviceId, appData.services).name+'</b>';
						
	} else if(tab == 'servicesPolicies') {
		nameHtml = '<b>'+getObjFromArrayById(permission.personId, appData.people).name+'</b>';
	}
	entry = document.createElement("div");
	entry.setAttribute('draggable', 'true');
	entry.id = permission.id;
	name = document.createElement("div");
	name.innerHTML = nameHtml;
	entry.appendChild(name);
	
    /*//REMOVED Controls: Edit / Delete
	controls = document.createElement("span");
	edit = document.createElement("img");
	edit.src = "simplifiedpolicyeditor/img/edit.png";
	edit.setAttribute('alt', 'Edit');
	edit.onclick = function(e) {permissionEditPopup(permission.id);};
	del = document.createElement("img");
	del.src = "simplifiedpolicyeditor/img/delete.png";
	del.setAttribute('alt', 'Delete');
	del.onclick = function(e) {permissionDeletePopup(permission.id);};
	controls.appendChild(edit);
	controls.appendChild(del);
	entry.appendChild(controls);
    //*/

	docFrag.appendChild(entry);

	entry.addEventListener('dragstart', handleDragStart, false);
	entry.addEventListener('dragend', handleDragEnd, false);

	domObjs[tab].permissions[permission.id] = name;

	return entry;
}


function fillOptionsFromArray(dropdown, optionsData) {
	var docFrag = document.createDocumentFragment(),
		option,
		i = 0,
		j = optionsData.length;

	for(i; i<j; i++) {
		option = document.createElement("option");
		option.setAttribute('value', optionsData[i].id);
		option.textContent = optionsData[i].name;
		docFrag.appendChild(option);
	}
	dropdown.appendChild(docFrag);
}




// ****************Start to work!!!!!



function permissionEditPopup(newPermissionOrId) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;

	if(isNaN(newPermissionOrId)) { //new
		if(newPermissionOrId == "allow" || newPermissionOrId == 'deny') {
			domObjs.popupAddPermissionAction.value = newPermissionOrId;
		} else {
			domObjs.popupAddPermissionAction.options[0].selected = "selected";
		}
		//reset other fields
		domObjs.popupAddPermissionId.value = '';
		domObjs.popupAddPermissionName.value = '';

		domObjs.popupAddPermissionPerson.options[0].selected = "selected";
		domObjs.popupAddPermissionType.options[0].selected = "selected";
	} else { //edit
		var permission;

		permission = getObjFromArrayById(newPermissionOrId, appData.permissions);
		
		var permValue;
		if(permission.perm == 1) {
			permValue = 'allow';
		} else if(permission.perm == -1) {
			permValue = 'deny';
		}

		domObjs.popupAddPermissionId.value = permission.id;
		domObjs.popupAddPermissionName.value = permission.name;
		domObjs.popupAddPermissionPerson.value = permission.personId;
		domObjs.popupAddPermissionType.value = permission.serviceId;
		domObjs.popupAddPermissionAction.value = permValue;
	}


	domObjs.popupAddPermissionNameContainer.style.display = "block";
//	domObjs.popupAddPermissionAppContainer.style.display = "block";
	

	//TODO block here options that would collide with already set permissions
	//this would have to be pretty dynamic = not so easy

	showPopup(domObjs.popupAddPermission);
}



function addEditPermission() {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;

	var type = domObjs.popupAddPermissionType.value;
	var perm = domObjs.popupAddPermissionAction.value;
//	var personId = appData[tab].currentPersonId;

	var personId = domObjs.popupAddPermissionPerson.value;

	var newName = domObjs.popupAddPermissionName.value;
	if(newName == '') {
		newName = getObjFromArrayById(type, appData.services).name;
	}

	var destColumn;
	if(perm == 'allow') {
		perm = 1;
		destColumn = domObjs[tab].allow;
	} else if(perm == 'deny') {
		perm = -1;
		destColumn = domObjs[tab].deny;
	}

	var id = domObjs.popupAddPermissionId.value,
		permission;

	if(!id) { //new
		permission = {};
		permission.id = new Date().valueOf();

		permission.serviceId = type;
		permission.perm = perm;
		permission.personId = personId;

		appData.permissions.push(permission);

		//draw
		var docFrag = document.createDocumentFragment();
		createPermissionEntry(permission, docFrag);
		destColumn.appendChild(docFrag);
		drawDraggablePermissions();

	} else { //edit

		permission = getObjFromArrayById(id,appData.permissions);
		if(!permission) return;

		var permissionChanged = false;
		if(permission.perm != perm) {
			permissionChanged = true;
		}

		permission.serviceId = type;
		permission.perm = perm;
		permission.personId = personId;

		var nameHtml;
		if(tab == 'peoplePolicies') {
			nameHtml = '<b>'+getObjFromArrayById(permission.serviceId, appData.services).name+'</b>';
		} else if(tab == 'servicesPolicies') {
			permission.name = newName;
			nameHtml = '<b>'+getObjFromArrayById(permission.personId, appData.people).name + '</b>';
		}

		//re-draw
		domObjs[tab].permissions[id].innerHTML = nameHtml;
		if(permissionChanged) {
			destColumn.appendChild(domObjs[tab].permissions[id].parentNode);
		}
	}
}





// **********************Start to work!!!!!!!!




function permissionDeletePopup(id) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;
	appData[tab].permissionToDelete = id; //TODO meh
	showPopup(domObjs.popupDeletePermission);
}


function deletePermission() {
	var tab = domObjs.pages.tabsPolEd._currentPage.id,
		id = appData[tab].permissionToDelete,
		permission;
	
	permission = getObjFromArrayById(id, appData.permissions, true);
	appData.permissions.splice(permission.pos,1);
	
	var permissionDiv = domObjs[tab].permissions[id].parentNode; //one node higher
	permissionDiv.parentNode.removeChild(permissionDiv);
	delete domObjs[tab].permissions[id]; //remove reference
	appData[tab].permissionToDelete = undefined;
}

function updatePermission(id, permission) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id,

	permissionObj = getObjFromArrayById(id, appData.permissions);

	if(!permissionObj) return;
	if(!isNaN(permission)) permissionObj.perm = permission;
}




//------------------------simplified editor functions 

var getPolicy_ServiceForPeople  = function(userId, serviceId, successCB) {
    webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), {
        onFound: function(service) {
            policyeditor = service;
            policyeditor.bindService({
                onBind: function(service) {
                    policyeditor.getPolicySet(0, function(ps) {
                        var request = {};
                        request.subjectInfo = {};
                        request.subjectInfo.userId = userId;
                        request.resourceInfo = {};
                        request.resourceInfo.serviceId = serviceId;
                        var policy = ps.toJSONObject()
                        policyeditor.testPolicy(ps, request, function(res) {
                            if (res.effect == 0) {
                                successCB('enable');
                            }
                            else if (res.effect == 1) {
                                successCB('disable');
                            }
                            else {
                                successCB(null);
                            }
                        });
                    }, null);
                }
            });
        }
    });
};

var getPolicy_ServicesForPeople = function(userId, successCB) {

    var result = [];
    var done = function(callback) {
            var counter = 0;
            return function (incr) {
                    if (0 == (counter += incr))
                            callback();
            };
    };
    var sync = done(function() { successCB(result); });
    var test = function (ps, request, i) {
        sync(+1);
        policyeditor.testPolicy(ps, request, function(res) {
            if (res.effect == 0) {
                result[i].access = 'enable';
            }
            else if (res.effect == 1) {
                result[i].access = 'disable';
            }
            else {
                result[i].access = null;
            }
            sync(-1);
        });

    };

    webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), {
        onFound: function(service) {
            policyeditor = service;
            policyeditor.bindService({
                onBind: function(service) {
                    policyeditor.getPolicySet(0, function(ps) {
                        var policy = ps.toJSONObject()
                        var policyString = JSON.stringify(policy);
                        var services = getMatch(policyString, 'service-id');
                        for (var i = 0; i < services.length; i++) {
                            var request = {};
                            request.subjectInfo = {};
                            request.subjectInfo.userId = userId;
                            request.resourceInfo = {};
                            request.resourceInfo.serviceId = services[i];
                            var service = {};
                            service.serviceId = services[i];
                            result.push(service);
                            test(ps, request, i);
                        }
                    }, null);
                }
            });
        }
    });
};

var getPolicy_PeopleForServices  = function(serviceId, successCB) {

    var result = [];
    var done = function(callback) {
            var counter = 0;
            return function (incr) {
                    if (0 == (counter += incr))
                            callback();
            };
    };
    var sync = done(function() { successCB(result); });
    var test = function (ps, request, user) {
        sync(+1);
        policyeditor.testPolicy(ps, request, function(res) {
            if (res.effect == 0) {
                result.push(user);
            }
            sync(-1);
        });
    };

    webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), {
        onFound: function(service) {
            policyeditor = service;
            policyeditor.bindService({
                onBind: function(service) {
                    policyeditor.getPolicySet(0, function(ps) {
                        var policy = ps.toJSONObject()
                        var policyString = JSON.stringify(policy);
                        var users = getMatch(policyString, 'user-id');
                        for (var i = -1; i < users.length; i++) {
                            var request = {};
                            request.resourceInfo = {};
                            request.resourceInfo.serviceId = serviceId;
                            if (i > -1) {
                                request.subjectInfo = {};
                                request.subjectInfo.userId = users[i];
                                test(ps, request, users[i]);
                            }
                            else {
                                test(ps, request, 'anyUser');
                            }
                        }
                    }, null);
                }
            });
        }
    });
};

function getMatch(policy, string) {
    var obj = {}, ret = [], val;

    var exp = new RegExp('"' + string + '"\s*,\s*"match"\s*:\s*"([^"]*)', 'g');
    while (val = exp.exec(policy)) {
        obj[val[1]] = 0;
    }
    var exp = new RegExp('match"\s*:\s*"([^"]*)"\s*,\s*"attr"\s*:\s*"' + string + '"', 'g');
    while (val = exp.exec(policy)) {
        obj[val[1]] = 0;
    }
    if (string == 'user-id') {
        if (webinos.session.isConnected()) {
            obj[webinos.session.getPZHId()] = 0;
        }
        else{ //virgin mode only
            obj[webinos.session.getPZPId()] = 0;
        }
    }

    for (var i in obj) {
        ret.push(i);
    }
    return ret;
}

var setPolicy_ServiceForPeople  = function(userId, serviceId, access, successCB, errorCB) {
    webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), {
        onFound: function(service) {
            policyeditor = service;
            policyeditor.bindService({
                onBind: function(service) {
                    policyeditor.getPolicySet(0, function(ps) {
                        var request = {};
                        request.subjectInfo = {};
                        request.subjectInfo.userId = userId;
                        request.resourceInfo = {};
                        request.resourceInfo.serviceId = serviceId;
                        policyeditor.testPolicy(ps, request, function(res) {
                            if ((access == 'enable' && res.effect != 0) ||
                                (access == 'disable' && res.effect != 1)) {
                                var newPs = editPolicy(policyeditor, ps, userId, serviceId, access, request, res);
                                console.log("ritorno dalla edit policy");
                                if (!newPs.error) {
                                    console.log("la nuova policy non contiene errori");
                                    policyeditor.testNewPolicy(newPs, request, function (result) {
                                        if ((access == 'enable' && result.effect == 0) ||
                                            (access == 'disable' && result.effect == 1)) {
                                            console.log("test superato, proviamo a salvare");
                                            policyeditor.save(newPs, function() {
                                                console.log("policy salvata");
                                                successCB('save succesful');
                                            }, function() {
                                                console.log("policy NON salvata");
                                                errorCB('save failed');
                                            });
                                        } else {
                                            console.log("la testNewPolicy dice che l'editing e' fallito");
                                            errorCB('editing failed');
                                        }
                                    }, null);
                                } else {
                                    console.log("errore restituito dalla edito policy");
                                    errorCB(newPs.error);
                                }
                            }
                            else {
                                successCB();
                            }
                        });
                    }, null);
                }
            });
        }
    });
};

var editPolicy = function (pe, ps, userId, serviceId, access, request, res) {
    console.log("siamo in edit policy");
    var policy = ps.getPolicy([userId]);
    if (policy.matched.length > 0) {
        policy = policy.matched[0].toJSONObject();
        ps.removePolicy(policy.$.id);

        var removedResourceMatch = false

        // remove old resource match
        for (var i = 0; i < policy.rule.length; i++) {
            if ((policy.rule[i].$.effect == 'permit' && access == 'disable') ||
                (policy.rule[i].$.effect == 'deny' && access == 'enable')) {
                if (policy.rule[i].condition) {
                    for (var j = 0; j < policy.rule[i].condition[0]['resource-match'].length; j++) {
                        if (policy.rule[i].condition[0]['resource-match'][j].$.match == serviceId) {
                            policy.rule[i].condition[0]['resource-match'].splice(j,1);
                            removedResourceMatch = true;
                            console.log("rimossa la vecchia regola");
                            break;
                        }
                    }
                    if (removedResourceMatch == true && policy.rule[i].condition[0]['resource-match'].length == 0) {
                        policy.rule.splice(i,1);
                        break;
                    }
                }
            }
        }
    } else {
        // new user, add policy
        var policy = ps.createPolicy('p_' + userId + '_' + new Date().getTime(), 'first-applicable', userId + '-policy');
        var subject = {};
        subject['subject-match'] = [];
        subject['subject-match'].push({'$' : {'attr' : 'user-id', 'match' : userId}});
        policy.addSubject('s_' + userId, subject);
        policy = policy.toJSONObject();
        delete policy.target[0].subject[0].$; // workaround to remove invalid id
        // add default rule
        policy.rule = [];
        policy.rule.push({'$' : {'effect' : 'deny', 'id' : 'r_' + userId + '_default'}});
    }

    var addedResourceMatch = false;

    // add new resource match
    for (var i = 0; i < policy.rule.length; i++) {
        if (((policy.rule[i].$.effect == 'permit' && access == 'enable') ||
            (policy.rule[i].$.effect == 'deny' && access == 'disable')) &&
            policy.rule[i].condition) {

            var resourceMatch = {};
            resourceMatch.$ = {};
            resourceMatch.$.attr = 'service-id';
            resourceMatch.$.match= serviceId;
            policy.rule[i].condition[0]['resource-match'].push(resourceMatch);
            addedResourceMatch = true;
            console.log("aggiunta la nuova regola");
        }
    }

    if (addedResourceMatch == false) {
        // add resource failed, try to add a rule
        var rule = {};
        rule.$ = {};
        if (access == 'enable') {
            rule.$.effect = 'permit';
        } else {
            rule.$.effect = 'deny';
        }
        rule.$.id = 'r_' + userId + '_' + new Date().getTime();
        rule.condition = [];
        rule.condition[0] = {};
        rule.condition[0].$ = {};
        rule.condition[0].$.combine = 'or';
        rule.condition[0]['resource-match'] = [];
        rule.condition[0]['resource-match'][0] = {};
        rule.condition[0]['resource-match'][0].$ = {};
        rule.condition[0]['resource-match'][0].$.attr = 'service-id';
        rule.condition[0]['resource-match'][0].$.match = serviceId;
        policy.rule.splice(0,0,rule);
    }

    var newPolicy = new pe.policy(policy);
    var position = 0;
    var path = JSON.parse(res.user.path);
    for (var i = 0; i < path.policy.length; i++) {
        if (path.policy[i].id == policy.$.id) {
            position = path.policy[i].position;
            break;
        }
    }
    ps.addPolicy(newPolicy, position);
    console.log("policy dopo la add");
    console.log(JSON.stringify(ps.toJSONObject()));

    return ps;
};

$(document).ready(function(){
    $("#b1").bind('click', function () {
        var user = webinos.session.getPZPId();
        var service = "service1";
        getPolicy_ServiceForPeople(user, service, function(access) {
            $('#status').html('STATUS: ');
            $('#status').append(access + " access to " + service + " service by " + user);
        });
    });
    $("#b2").bind('click', function () {
        var user = "friend1";
        var service = "service1";
        getPolicy_ServiceForPeople(user, service, function(access) {
            $('#status').html('STATUS: ');
            $('#status').append(access + " access to " + service + " service by " + user);
        });
    });
    $("#b3").bind('click', function () {
        var user = "friend2";
        var service = "service1";
        getPolicy_ServiceForPeople(user, service, function(access) {
            $('#status').html('STATUS: ');
            $('#status').append(access + " access to " + service + " service by " + user);
        });
    });
    $("#b4").bind('click', function () {
        var user = "friend3";
        var service = "service1";
        getPolicy_ServiceForPeople(user, service, function(access) {
            $('#status').html('STATUS: ');
            $('#status').append(access + " access to " + service + " service by " + user);
        });
    });

    $("#b5").bind('click', function () {
        var user = webinos.session.getPZPId();
        getPolicy_ServicesForPeople(user, function(services) {
            console.log("services: " + JSON.stringify(services));
            $('#status').html('STATUS: ');
            for (var i = 0; i < services.length; i++) {
                $('#status').append(services[i].access + " access to " + services[i].serviceId + " service by " + user + "<br />");
            }
        });
    });
    $("#b6").bind('click', function () {
        var user = "friend1";
        getPolicy_ServicesForPeople(user, function(services) {
            console.log("services: " + JSON.stringify(services));
            $('#status').html('STATUS: ');
            for (var i = 0; i < services.length; i++) {
                $('#status').append(services[i].access + " access to " + services[i].serviceId + " service by " + user + "<br />");
            }
        });
    });
    $("#b7").bind('click', function () {
        var user = "friend2";
        getPolicy_ServicesForPeople(user, function(services) {
            console.log("services: " + JSON.stringify(services));
            $('#status').html('STATUS: ');
            for (var i = 0; i < services.length; i++) {
                $('#status').append(services[i].access + " access to " + services[i].serviceId + " service by " + user + "<br />");
            }
        });
    });
    $("#b8").bind('click', function () {
        var user = "friend3";
        getPolicy_ServicesForPeople(user, function(services) {
            console.log("services: " + JSON.stringify(services));
            $('#status').html('STATUS: ');
            for (var i = 0; i < services.length; i++) {
                $('#status').append(services[i].access + " access to " + services[i].serviceId + " service by " + user + "<br />");
            }
        });
    });

    $("#b9").bind('click', function () {
        var service = "service1";
        getPolicy_PeopleForServices(service, function(users) {
            $('#status').html('STATUS: ');
            for (var i = 0; i < users.length; i++) {
                $('#status').append("enable access to " + service + " service by " + users[i] + "<br />");
            }
        });
    });
    $("#b10").bind('click', function () {
        var service = "service2";
        getPolicy_PeopleForServices(service, function(users) {
            $('#status').html('STATUS: ');
            for (var i = 0; i < users.length; i++) {
                $('#status').append("enable access to " + service + " service by " + users[i] + "<br />");
            }
        });
    });
    $("#b11").bind('click', function () {
        var service = "service3";
        getPolicy_PeopleForServices(service, function(users) {
            $('#status').html('STATUS: ');
            for (var i = 0; i < users.length; i++) {
                $('#status').append("enable access to " + service + " service by " + users[i] + "<br />");
            }
        });
    });
    $("#b12").bind('click', function () {
        var service = "service4";
        getPolicy_PeopleForServices(service, function(users) {
            $('#status').html('STATUS: ');
            for (var i = 0; i < users.length; i++) {
                $('#status').append("enable access to " + service + " service by " + users[i] + "<br />");
            }
        });
    });

    $("#b13").bind('click', function () {
        var user = webinos.session.getPZPId();
        var service = "service2";
        var access = "enable"
        setPolicy_ServiceForPeople(user, service, access, function(users) {
            $('#status').html('STATUS ServiceForPeople1: ');
            $('#status').append(access + " access to " + service + " service by " + user + "<br />");
        });
    });
    $("#b14").bind('click', function () {
        var user = webinos.session.getPZPId();
        var service = "service1";
        var access = "enable"
        setPolicy_ServiceForPeople(user, service, access, function() {
            $('#status').html('STATUS ServiceForPeople2: ');
            $('#status').append(access + " access to " + service + " service by " + user + "<br />");
        }, function(msg) {
            $('#status').html('STATUS: ');
            $('#status').append("error " + msg + "<br />");
        });
    });
    $("#b15").bind('click', function () {
        var user = "friend1";
        var service = "service1";
        var access = "disable"
        setPolicy_ServiceForPeople(user, service, access, function() {
            $('#status').html('STATUS ServiceForPeople3: ');
            $('#status').append(access + " access to " + service + " service by " + user + "<br />");
        }, function(msg) {
            $('#status').html('STATUS: ');
            $('#status').append("error " + msg + "<br />");
        });
    });
    $("#b16").bind('click', function () {
        var user = "friend3";
        var service = "service1";
        var access = "enable"
        setPolicy_ServiceForPeople(user, service, access, function() {
            $('#status').html('STATUS ServiceForPeople4: ');
            $('#status').append(access + " access to " + service + " service by " + user + "<br />");
        }, function(msg) {
            $('#status').html('STATUS: ');
            $('#status').append("error " + msg + "<br />");
        });
    });
});

