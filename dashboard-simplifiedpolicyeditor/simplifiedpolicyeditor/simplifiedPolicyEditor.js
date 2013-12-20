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

var appData = {
    quickSettings: [],
    quickStatus: [],
    people: {},
    services: {},
    permissions: {}
},
    timeout;

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
//commented to remove quickSettings
/*	var quickSettingsSwitchesContainer = document.getElementById('quickSettings-switches-content'),
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
*/}();


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
//	console.log('drag end');
//	console.log(this);
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


//-----------------------------draw the select and options of SERVICES---


function fillServicesTab() {
	var services = appData.services || {},
		people = appData.people || {},
        tabName = 'servicesPolicies';

	appData[tabName] = {};
	domObjs[tabName] = {};

	domObjs[tabName].peopleListContainer = document.getElementById('people-list');
	domObjs[tabName].servicesSelect = document.getElementById('services-people');
	domObjs[tabName].allow = document.getElementById('people-allow');
	domObjs[tabName].deny = document.getElementById('people-deny');

//    domObjs[tabName].allow.innerHTML = '';
//    domObjs[tabName].deny.innerHTML = '';

	domObjs[tabName].people = {};
	domObjs[tabName].permissions = {};

	createPeopleList(people, domObjs[tabName].peopleListContainer, tabName);

	createServicesDropdownOptions(services, domObjs[tabName].servicesSelect, tabName);

	dragDropInitColumns();

	if(Object.keys(services).length > 0) {
        showPeopleForService(appData[tabName].currentServiceId);
    }
}

function showPeopleForService(serviceId) {
    getPolicy_PeopleForServices(serviceId, function(people) {
        var permissions = {};

        people.map(function (person) {
            if (person != 'anyUser') {
                var permission = {
                    id: person,
                    personId: person,
                    name: person,
                    serviceId: serviceId,
                    perm: 1
                }
                if (!permissions[person]){
                    permissions[person] = permission;
                }
            }
        });
        webinos.session.getConnectedDevices().map( function(elem) {
            if (people.indexOf(elem.id) == -1) {
                var permission = {
                    id: elem.id,
                    personId: elem.id,
                    name: elem.id,
                    serviceId: serviceId,
                    perm: -1
                }
                if (!permissions[elem.id]) {
                    permissions[elem.id] = permission;
                }
            }
        });

        drawDraggablePermissions('servicesPolicies', permissions);
    });
}

function createServicesDropdownOptions(services, dropdown, tab) {
	var docFrag = document.createDocumentFragment(),
        activeServiceIsSet = false,
		option;

    dropdown.innerHTML = '';

	Object.keys(services).map(function (k) {
		option = document.createElement("option");
		option.setAttribute('value', k);
		option.textContent = services[k].name + " - " + services[k].desc;
		docFrag.appendChild(option);
		if(!activeServiceIsSet) {
			setActiveService(k, tab); //init internal state
            activeServiceIsSet = true;
		}
	});

	dropdown.appendChild(docFrag);
	dropdown.onchange = function() {
		var id = this.options[this.selectedIndex].value;
		setActiveService(id);
		showPeopleForService(id);

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
	var docFrag = document.createDocumentFragment();

	Object.keys(people).map(function (k) {
		createPeopleListEntry(people[k], docFrag, tab);
	});

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


//-----------------------------draw the select and options of PEOPLE---


function fillPeopleTab() {
	var services = appData.services || {},
		people = appData.people || {};
        tabName = 'peoplePolicies';

	appData[tabName] = {};
	domObjs[tabName] = {};

	domObjs[tabName].servicesListContainer = document.getElementById('services-list');
	domObjs[tabName].peopleSelect = document.getElementById('people-services');
	domObjs[tabName].allow = document.getElementById('services-allow');
	domObjs[tabName].deny = document.getElementById('services-deny');

//    domObjs[tabName].allow.innerHTML = '';
//    domObjs[tabName].deny.innerHTML = '';

	domObjs[tabName].services = {};
	domObjs[tabName].permissions = {};

    createServicesList(services, domObjs[tabName].servicesListContainer, tabName);

	createPeopleDropdownOptions(people, domObjs[tabName].peopleSelect, tabName);

	dragDropInitColumns();

	if(Object.keys(people).length > 0) {
        showServicesForPerson(appData[tabName].currentPersonId);
	}
}

function showServicesForPerson(personId){
    getPolicy_ServicesForPeople(personId, function(services) {
        var permissions = {};

        services.map(function (service) {
            var permission = {
                id: service.serviceId,
                personId: appData[tabName].currentPersonId,
                name: service.serviceId,
                serviceId: service.serviceId,
                perm: service.access == "enable" ? 1 : -1
            }
            if (!permissions[service.serviceId]){
                permissions[service.serviceId] = permission;
            }
        });

        drawDraggablePermissions(tabName, permissions);
    });
}

function createPeopleDropdownOptions(people, dropdown, tab) {
    dropdown.innerHTML = "";
	var docFrag = document.createDocumentFragment(),
		activePersonIsSet = false,
        option;

    dropdown.innerHTML = '';

    Object.keys(people).map(function (k) {
		option = document.createElement("option");
		option.setAttribute('value', k);
		option.textContent = people[k].name;
		docFrag.appendChild(option);
		if(!activePersonIsSet) {
			setActivePerson(k, tab); //initial internal state.
            activePersonIsSet = true;
		}
	});

	dropdown.appendChild(docFrag);
	dropdown.onchange = function() {
		var id = this.options[this.selectedIndex].value;
		setActivePerson(id);
		showServicesForPerson(id);
	}
}

function setActivePerson(id, tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	appData[tab].currentPersonId = id;
}

function createServicesList(services, container, tab) {
    var docFrag = document.createDocumentFragment();

    Object.keys(services).map(function(k){
        createServicesListEntry(services[k], docFrag, tab);
    });

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


function drawDraggablePermissions(tab, permissions) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}

    if(!permissions){
        var permissions = {};
    }

	var temPersonId = appData[tab].currentPersonId,
		temServiceId = appData[tab].currentServiceId;

//	if(!tab || !temPersonId || !temServiceId) return false;

	domObjs[tab].allow.innerHTML = '';
	domObjs[tab].deny.innerHTML = '';

	var docFragAllow = document.createDocumentFragment(),
		docFragDeny = document.createDocumentFragment();

// This place still need to modify.

	if(tab == 'peoplePolicies') {
		Object.keys(permissions).map(function(k) {
			if(permissions[k].personId == temPersonId) {
				if(permissions[k].perm == 1) {
					docFrag = docFragAllow;
				} else if(permissions[k].perm == -1) {
					docFrag = docFragDeny;
				}
				createPermissionEntry(permissions[k], docFrag, tab);
			}
		});
	}
	else if(tab == 'servicesPolicies') {
        Object.keys(permissions).map(function (k) {
			if(permissions[k].serviceId == temServiceId) {
				if(permissions[k].perm == 1) {
					docFrag = docFragAllow;
				} else if(permissions[k].perm == -1) {
					docFrag = docFragDeny;
				}
				createPermissionEntry(permissions[k], docFrag, tab);
			}
		});
    }
    else {
        return ;
    }

    domObjs[tab].allow.appendChild(docFragAllow);
    domObjs[tab].deny.appendChild(docFragDeny);
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

	if(tab == 'peoplePolicies' && appData.services[permission.serviceId]) {
	//	nameHtml = '<b>' + getObjFromArrayById(permission.serviceId, appData.services).name + '</b>';
		    nameHtml = '<b>' + appData.services[permission.serviceId].name + '</b><p class="desc">' + appData.services[permission.serviceId].desc + '</p>';
	} else if(tab == 'servicesPolicies' && appData.people[permission.personId]) {
		nameHtml = '<b>' + appData.people[permission.personId].name + '</b>';
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


//-----------------------------------------------LOAD DATA


function loadData(uri, sid) {
    var apiURI = '*';
    var serviceId = null;
    if(uri) {
        apiURI = uri;
    }
    if(sid) {
        serviceId = sid;
    }
    if(uri || sid) {
        $("#tabTo-peoplePolicies").hide();
        $("#tabTo-servicesPolicies").click();
        //$("#peoplePolicies").hide();
        //$("#tabTo-servicesPolicies").addClass("selected");
        //$("#servicesPolicies").show();
    }
    //console.log("apiURI: " + apiURI);
    webinos.session.getConnectedDevices().map( function(elem) {
        appData.people[elem.id] = {
            id: elem.id,
            name: elem.friendlyName,
            email: ''
        };
    });

    webinos.discovery.findServices(new ServiceType(apiURI), {
        onFound: function (service) {
            if(sid) {
                if(service.id.indexOf(sid) == -1) {
                    return;
                }
            }
            appData.services[service.id] = {
                id: service.id,
                name: service.displayName,
                desc: service.description
            };

            if(!sid) {
                var name = service.api.split('/');
                appData.services[service.api] = {
                    id: service.api,
                    name: name[name.length-1]+' Api',
                    desc: 'Generic API feature'
                };
            }

            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                    console.log("fillTabs");
                    fillPeopleTab();
                    fillServicesTab();
                } , 250);
        }
    },
    null,
    {
        zoneId: [webinos.session.getPZPId()]
    });
}

function updatePermission(id, permission) {
    var userId = null, serviceId = null, access = null;
    var currentPage = domObjs.pages.tabsPolEd._currentPage.id;

    if (currentPage == 'peoplePolicies') {
        userId = appData[currentPage].currentPersonId;
        serviceId = id;
    }
    else if (currentPage == 'servicesPolicies') {
        userId = id;
        serviceId = appData[currentPage].currentServiceId;
    }
    if (permission == 1) {
        access = 'enable';
    }
    else if (permission == -1) {
        access = 'disable';
    }
    if (userId != null && serviceId != null && access != null) {
        setPolicy_ServiceForPeople(userId, serviceId, access, function(msg) {
            if (currentPage == 'peoplePolicies') {
                if (serviceId === appData['servicesPolicies'].currentServiceId) {
                    showPeopleForService(serviceId);
                }
            }
            else if (currentPage == 'servicesPolicies') {
                if (userId === appData['peoplePolicies'].currentPersonId) {
                    showServicesForPerson(userId);
                }
            }
        }, function (msg) {
            if (currentPage == 'peoplePolicies') {
                showServicesForPerson(userId);
            }
            else if (currentPage == 'servicesPolicies') {
                showPeopleForService(serviceId);
            }
            console.log('policy editing failed: ' + msg);
        });
    }
    else {
        if (currentPage == 'peoplePolicies' && userId != null) {
            showServicesForPerson(userId);
        }
        else if (currentPage == 'servicesPolicies' && serviceId != null) {
            showPeopleForService(serviceId);
        }
        console.log('policy editing failed');
    }
}

//webinos.session.addListener('registeredBrowser', loadData);

function dashboardConfig() {
    webinos.dashboard.getData(
            function(tokenData){
                var apiURI = null;
                var serviceId = null;
                if(tokenData.apiURI) {
                    apiURI = tokenData.apiURI;
                }
                if(tokenData.serviceId) {
                    serviceId = tokenData.serviceId;
                }
                loadData(apiURI, serviceId);
            },
            function(){
                loadData();
            }
        );
}
webinos.session.addListener('registeredBrowser', dashboardConfig);


//------------------------simplified editor functions

var friendsURI = 'http://webinos.org/subject/id/known';

var getPolicy_ServiceForPeople = function() {
    var requestorId = null;
    var userId = arguments[0];
    var serviceId = arguments[1];
    if (arguments.length == 3) {
        var successCB = arguments[2];
    } else if ( arguments.length == 4 ) {
        var requestorId = arguments[2];
        var successCB = arguments[3];
    }
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
                        if (isWebinosAPI(serviceId)) {
                            request.resourceInfo.apiFeature = serviceId;
                        }
                        else {
                            request.resourceInfo.serviceId = serviceId;
                        }
                        if(requestorId != null) {
                            request.deviceInfo = {};
                            request.deviceInfo.requestorId = requestorId;
                        }

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
    },
    null,
    {
        zoneId: [webinos.session.getPZPId()]
    });
};


var getPolicy_ServicesForPeople = function() {
    var requestorId = null;
    var userId = arguments[0];

    if (arguments.length == 2) {
        var successCB = arguments[1];
    } else if (arguments.length == 3) {
        var requestorId = arguments[1];
        var successCB = arguments[2];
    }


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

                        webinos.discovery.findServices(new ServiceType("*"), {
                            onFound: function (resource) {
                                var serviceRequest = {};
                                serviceRequest.subjectInfo = {};
                                serviceRequest.subjectInfo.userId = userId;
                                serviceRequest.resourceInfo = {};
                                serviceRequest.resourceInfo.serviceId = resource.id;

                                if (requestorId != null) {
                                    serviceRequest.deviceInfo = {};
                                    serviceRequest.deviceInfo.requestorId = requestorId;
                                }

                                var service = {};
                                service.serviceId = resource.id;
                                var newLength = result.push(service);
                                test(ps, serviceRequest, newLength - 1);

                                var found = false;
                                for (var i = 0; i < result.length; i++) {
                                    if (result[i].serviceid === resource.api) {
                                        found = true;
                                        break
                                    }
                                }
                                if (found == false) {
                                    var apiRequest = {};
                                    apiRequest.subjectInfo = {};
                                    apiRequest.subjectInfo.userId = userId;
                                    apiRequest.resourceInfo = {};
                                    apiRequest.resourceInfo.apiFeature = resource.api;

                                    if (requestorId != null) {
                                        apiRequest.deviceInfo = {};
                                        apiRequest.deviceInfo.requestorId = requestorId;
                                    }

                                    var service = {};
                                    service.serviceId = resource.api;
                                    var newLength = result.push(service);
                                    test(ps, apiRequest, newLength - 1);
                                }
                            }
                        },
                        null,
                        {
                            zoneId: [webinos.session.getPZPId()]
                        });
                    }, null);
                }
            });
        }
    },
    null,
    {
        zoneId: [webinos.session.getPZPId()]
    });
};

var getPolicy_PeopleForServices = function() {
    var requestorId = null;
    var serviceId = arguments[0];
    if (arguments.length == 2) {
        var successCB = arguments[1];
    } else if (arguments.length == 3) {
        var requestorId = arguments[1];
        var successCB = arguments[2];
    }

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
                        var users = webinos.session.getConnectedDevices();
                        for (var i = -1; i < users.length; i++) {
                            var request = {};
                            request.resourceInfo = {};
                            if (isWebinosAPI(serviceId)) {
                                request.resourceInfo.apiFeature = serviceId;
                            }
                            else {
                                request.resourceInfo.serviceId = serviceId;
                            }

                            if(requestorId != null) {
                                request.deviceInfo = {};
                                request.deviceInfo.requestorId = requestorId;
                            }

                            if (i > -1) {
                                request.subjectInfo = {};
                                request.subjectInfo.userId = users[i].id;
                                test(ps, request, users[i].id);
                            }
                            else {
                                test(ps, request, 'anyUser');
                            }

                        }
                    }, null);
                }
            });
        }
    },
    null,
    {
        zoneId: [webinos.session.getPZPId()]
    });
};

/* function getMatch(policy, string) {
    var obj = {}, ret = [];

    var exp = new RegExp('"' + string + '"\s*,\s*"match"\s*:\s*"([^"]*)', 'g');
    extractItems(policy, exp, obj);
    var exp = new RegExp('match"\s*:\s*"([^"]*)"\s*,\s*"attr"\s*:\s*"' + string + '"', 'g');
    extractItems(policy, exp, obj);

    if (string == 'user-id') {
        // add zone owner
        var zoneOwner = webinos.session.getPZHId()
        if (zoneOwner) {
            obj[zoneOwner] = 0;
        }
        else { // PZP not enrolled
            obj[webinos.session.getPZPId()] = 0;
        }
        // add friends
        var friends = webinos.session.getConnectedPzh();
        for (var i in friends) {
            obj[friends[i]] = 0;
        }
    }

    for (var i in obj) {
        ret.push(i);
    }
    return ret;
} */

var extractItems = function(policy, exp, obj) {
    var genericURIs = [
        'http://webinos.org/subject/id/PZ-Owner',
        'http://webinos.org/subject/id/known'
    ];

    while (val = exp.exec(policy)) {
        // split required to manage bags
        var items = val[1].split(',');
        for (var i in items) {
            item = items[i].trim();
            // skip generic URIs
            if (genericURIs.indexOf(item) == -1) {
                obj[item] = 0;
            }
        }
    }
}

// input formats
// with device: setPolicy_ServiceForPeople(userId, serviceId, requestorId, access, successCB, errorCB);
// without device: setPolicy_ServiceForPeople(userId, serviceId, access, successCB, errorCB);
var setPolicy_ServiceForPeople = function() {
    var userId = arguments[0];
    var serviceId = arguments[1];
    var requestorId = null;
    if (arguments.length == 5) {
        var access = arguments[2];
        var successCB = arguments[3];
        var errorCB = arguments[4];
    } else if (arguments.length == 6) {
        var requestorId = arguments[2]
        var access = arguments[3];
        var successCB = arguments[4];
        var errorCB = arguments[5];
    }

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
                        if (isWebinosAPI(serviceId)) {
                            request.resourceInfo.apiFeature = serviceId;
                        }
                        else {
                            request.resourceInfo.serviceId = serviceId;
                        }
                        if (requestorId != null) {
                            request.deviceInfo = {};
                            request.deviceInfo.requestorId = requestorId;
                        }
                        policyeditor.testPolicy(ps, request, function(res) {
                            if ((access == 'enable' && res.effect != 0) ||
                                (access == 'disable' && res.effect != 1)) {

                                var newPs = editPolicy(policyeditor, ps, access, request, res);
                                if (!newPs.error) {
                                    policyeditor.testNewPolicy(newPs, request, function (result) {
                                        if ((access == 'enable' && result.effect == 0) ||
                                            (access == 'disable' && result.effect == 1)) {
                                            policyeditor.save(newPs, function() {
                                                successCB('save succesful');
                                            }, function() {
                                                errorCB('save failed');
                                            });
                                        } else {
                                            errorCB('editing failed');
                                        }
                                    }, null);
                                } else {
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
    },
    null,
    {
        zoneId: [webinos.session.getPZPId()]
    });
};

var editPolicy = function (pe, ps, access, request, res) {
    var userId = request.subjectInfo.userId;
    var serviceId = null;
    if (request.resourceInfo.serviceId) {
        serviceId = request.resourceInfo.serviceId;
    }
    else if (request.resourceInfo.apiFeature) {
        serviceId = request.resourceInfo.apiFeature;
    }
    var requestorId = null;
    var date = new Date().getTime();
    if (request.deviceInfo) {
        requestorId = request.deviceInfo.requestorId;
    }

    var path = JSON.parse(res.user.path);

    // policy with devices
    if (requestorId != null) {
        var policySetPosition = 0;
        var policyPosition = 0;

        var policySet = ps.getPolicySet([userId]);
        if (policySet.matched.length > 0) {
            policySet = policySet.matched[0].toJSONObject();
            // get policy set position
            for (var i = 0; i < path['policy-set'].length; i++) {
                if (path['policy-set'][i].id === policySet.$.id) {
                    policySetPosition = path['policy-set'][i].position;
                    break;
                }
            }

            var policy = null;
            var userIds = policySet.target[0].subject[0]['subject-match'][0].$.match.split(',');
            // check if target contains the friends generic URI or a bag
            if (policySet.target[0].subject[0]['subject-match'][0].$.match === friendsURI || userIds.length > 1) {
                if (userIds.length > 1) {
                    var index = userIds.indexOf(userId);
                    userIds.splice(index, 1);
                    policySet.target[0].subject[0]['subject-match'][0].$.match = userIds.toString();
                }
                // make a copy of the policySet (clone object)
                policySet = JSON.parse(JSON.stringify(policySet));
                // modify policySet ids
                policySet.$.id = 'ps_' + userId + '_' + date;
                policySet.$.description = userId + '-policySet';
                // modify target to replace the generic URI
                policySet.target[0].subject[0]['subject-match'][0].$.match = userId;
                for (var i = 0; i < policySet.policy.length; i++) {
                    // modify policy's and rules' ids
                    var id = 'Default';
                    if (policySet.policy[i].target) {
                        var id = policySet.policy[i].target[0].subject[0]['subject-match'][0].$.match;
                    }
                    policySet.policy[i].$.id = 'p_' + userId + id + '_' + date;
                    policySet.policy[i].$.description = userId + id + '-policy';
                    for (var j = 0; j < policySet.policy[i].rule.length; j++) {
                        policySet.policy[i].rule[j].$.id = 'r_' + userId + id + '_' + ++date;
                    }
                }
            }
            // policy set without friends URI
            else {
                // remove old policy set
                ps.removePolicySet(policySet.$.id);
            }
            var policySetObject = new pe.policyset(policySet);
            var result = policySetObject.getPolicy([requestorId]);
            if (result.matched.length > 0) {
                policy = result.matched[0].toJSONObject();
            }
            else if (result.generic.length > 0) {
                // start from default policy when adding a new device
                policy = result.generic[0].toJSONObject();
            }
            if (policy != null) {
                // get policy position
                for (var i = 0; i < path['policy-set'].length; i++) {
                    if (path['policy-set'][i].id === policySet.$.id) {
                        for (var j = 0; j < path['policy-set'][i].policy.length; j++) {
                            if (path['policy-set'][i].policy[j].id === policy.$.id) {
                                policyPosition = path['policy-set'][i].policy[j].position;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        // Start from default policy set when adding a new user
        else if (policySet.generic.length > 0) {
            policySet = policySet.generic[0].toJSONObject();
            // get policy set position
            for (var i = 0; i < path['policy-set'].length; i++) {
                if (path['policy-set'][i].id === policySet.$.id) {
                    policySetPosition = path['policy-set'][i].position;
                    break;
                }
            }

            // make a copy of the policySet (clone object)
            policySet = JSON.parse(JSON.stringify(policySet));
            // modify policySet ids
            policySet.$.id = 'ps_' + userId + '_' + date;
            policySet.$.description = userId + '-policySet';
            for (var i = 0; i < policySet.policy.length; i++) {
                // modify policy's and rules' ids
                var id = 'Default';
                if (policySet.policy[i].target) {
                    var id = policySet.policy[i].target[0].subject[0]['subject-match'][0].$.match;
                }
                policySet.policy[i].$.id = 'p_' + userId + id + '_' + date;
                policySet.policy[i].$.description = userId + id + '-policy';
                for (var j = 0; j < policySet.policy[i].rule.length; j++) {
                    policySet.policy[i].rule[j].$.id = 'r_' + userId + id + '_' + ++date;
                }
            }
            policySet.target = [];
            policySet.target.push({'subject': [{'subject-match': [{'$' : {'attr' : 'user-id', 'match' : userId}}]}]});
            var policySetObject = new pe.policyset(policySet);
            var result = policySetObject.getPolicy([requestorId]);
            if (result.matched.length > 0) {
                policy = result.matched[0].toJSONObject();
            }
            else if (result.generic.length > 0) {
                // start from default policy when adding a new device
                policy = result.generic[0].toJSONObject();
            }
            if (policy != null) {
                // get policy position
                for (var i = 0; i < path['policy-set'].length; i++) {
                    if (path['policy-set'][i].id === policySet.$.id) {
                        for (var j = 0; j < path['policy-set'][i].policy.length; j++) {
                            if (path['policy-set'][i].policy[j].id === policy.$.id) {
                                policyPosition = path['policy-set'][i].policy[j].position;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        // add new policySet
        else {
            policySet = ps.createPolicySet('ps_' + userId + '_' + date, 'first-matching-target', userId + '-policy');
            policySet = policySet.toJSONObject();
            // add default rule
            policySet.policy = [];
            policySet.policy.push({'rule': [{'$' : {'effect' : 'deny', 'id' : 'r_' + userId + '_default'}}]});
        }

        if (policy != null) {
            // this is not the default policy
            if (policy.target) {
                var requestorIds = policy.target[0].subject[0]['subject-match'][0].$.match.split(',');
                // check if target contains a bag
                if (requestorIds.length > 1) {
                    var index = requestorIds.indexOf(requestorId);
                    requestorIds.splice(index, 1);
                    policy.target[0].subject[0]['subject-match'][0].$.match = requestorIds.toString();
                    // make a copy of the policy (clone object)
                    policy = JSON.parse(JSON.stringify(policy));
                    // modify policy's and rules' ids
                    policy.$.id = 'p_' + userId + requestorId + '_' + date;
                    policy.$.description = userId + requestorId + '-policy';
                    for (var i = 0; i < policy.rule.length; i++) {
                        policy.rule[i].$.id = 'r_' + userId + requestorId + '_' + ++date;
                    }
                    // modify target to replace the generic URI
                    policy.target[0].subject[0]['subject-match'][0].$.match = requestorId;
                    policySet.policy.splice(policyPosition, 0, policy);
                }
            }
            // this is the default policy
            else {
                // make a copy of the policy (clone object)
                policy = JSON.parse(JSON.stringify(policy));
                // modify policy's and rules' ids
                policy.$.id = 'p_' + userId + requestorId + '_' + date;
                policy.$.description = userId + requestorId + '-policy';
                for (var i = 0; i < policy.rule.length; i++) {
                    policy.rule[i].$.id = 'r_' + userId + requestorId + '_' + ++date;
                }
                // add target
                policy.target = [];
                policy.target.push({'subject': [{'subject-match': [{'$' : {'attr' : 'requestor-id', 'match' : requestorId}}]}]});
                policySet.policy.splice(policyPosition, 0, policy);
            }
            policy = removeOldResourceMatch(policy, serviceId, access);
        }
        // add new policy
        else {
            policy = createNewPolicy(ps, 'requestor-id', requestorId, userId + requestorId, date);
            policySet.policy.splice(0, 0, policy);
        }
        policy = addResource(policy, userId + requestorId, serviceId, access, ++date);

        var newPolicySet = new pe.policyset(policySet);
        ps.addPolicySet(newPolicySet, policySetPosition);

    }
    // policy without devices
    else {
        var policy = ps.getPolicy([userId]);
        var position = 0;
        if (policy.matched.length > 0) {
            policy = policy.matched[0].toJSONObject();
            for (var i = 0; i < path.policy.length; i++) {
                if (path.policy[i].id === policy.$.id) {
                    position = path.policy[i].position;
                    break;
                }
            }
            var userIds = policy.target[0].subject[0]['subject-match'][0].$.match.split(',');
            // check if target contains the friends generic URI or a bag
            if (policy.target[0].subject[0]['subject-match'][0].$.match === friendsURI || userIds.length > 1) {
                if (userIds.length > 1) {
                    var index = userIds.indexOf(userId);
                    userIds.splice(index, 1);
                    policy.target[0].subject[0]['subject-match'][0].$.match = userIds.toString();
                }
                // make a copy of the policy (clone object)
                policy = JSON.parse(JSON.stringify(policy));
                // modify policy's and rules' ids
                policy.$.id = 'p_' + userId + '_' + date;
                policy.$.description = userId + '-policy';
                for (var i = 0; i < policy.rule.length; i++) {
                    policy.rule[i].$.id = 'r_' + userId + '_' + ++date;
                }
                // modify target to replace the generic URI
                policy.target[0].subject[0]['subject-match'][0].$.match = userId;
            }
            else {
                // remove the old policy
                ps.removePolicy(policy.$.id);
            }

            policy = removeOldResourceMatch(policy, serviceId, access);
        } else {
            if (policy.generic.length > 0) {
                policy = policy.generic[0].toJSONObject();
                for (var i = 0; i < path.policy.length; i++) {
                    if (path.policy[i].id === policy.$.id) {
                        position = path.policy[i].position;
                        break;
                    }
                }
                // make a copy of the policy (clone object)
                policy = JSON.parse(JSON.stringify(policy));
                // modify policy's and rules' ids
                policy.$.id = 'p_' + userId + '_' + date;
                policy.$.description = userId + '-policy';
                for (var i = 0; i < policy.rule.length; i++) {
                    policy.rule[i].$.id = 'r_' + userId + '_' + ++date;
                }
                // add target
                policy.target = [];
                policy.target.push({'subject': [{'subject-match': [{'$' : {'attr' : 'user-id', 'match' : userId}}]}]});
                policy = removeOldResourceMatch(policy, serviceId, access);
            }
            else {
                // new user, add policy
                policy = createNewPolicy(ps, 'user-id', userId, userId, date);
            }
        }

        policy = addResource(policy, userId, serviceId, access, ++date);

        var newPolicy = new pe.policy(policy);
        ps.addPolicy(newPolicy, position);
    }

    return ps;
};

var removeOldResourceMatch = function (policy, serviceId, access) {
    var removedResourceMatch = false
    for (var i = 0; i < policy.rule.length; i++) {
        if ((policy.rule[i].$.effect == 'permit' && access == 'disable') ||
            (policy.rule[i].$.effect == 'deny' && access == 'enable')) {
            if (policy.rule[i].condition && (policy.rule[i].condition[0].$.combine == 'or' ||
                (policy.rule[i].condition[0].$.combine == 'and' && policy.rule[i].condition[0]['resource-match'].length < 2))) {

                for (var j = 0; j < policy.rule[i].condition[0]['resource-match'].length; j++) {
                    if (policy.rule[i].condition[0]['resource-match'][j].$.match == serviceId) {
                        policy.rule[i].condition[0]['resource-match'].splice(j,1);
                        removedResourceMatch = true;
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
    return policy;
}

var createNewPolicy = function (ps, attr, match, id, date) {
    var policy = ps.createPolicy('p_' + id + '_' + date, 'first-applicable', id + '-policy');
    var subject = {};
    subject['subject-match'] = [];
    subject['subject-match'].push({'$' : {'attr' : attr, 'match' : match}});
    policy.addSubject('s_' + id, subject);
    policy = policy.toJSONObject();
    // add default rule
    policy.rule = [];
    policy.rule.push({'$' : {'effect' : 'deny', 'id' : 'r_' + id + '_default'}});
    return policy;
}

var addResource = function (policy, Id, serviceId, access, date) {
    var addedResourceMatch = false;

    // add new resource match
    for (var i = 0; i < policy.rule.length; i++) {
        if (((policy.rule[i].$.effect == 'permit' && access == 'enable') ||
            (policy.rule[i].$.effect == 'deny' && access == 'disable')) &&
            policy.rule[i].condition && (policy.rule[i].condition[0].$.combine == 'or' ||
            (policy.rule[i].condition[0].$.combine == 'and' && policy.rule[i].condition[0]['resource-match'].length == 1))) {

            var resourceMatch = {};
            resourceMatch.$ = {};
            if (isWebinosAPI(serviceId)) {
                resourceMatch.$.attr = 'api-feature';
            }
            else {
                resourceMatch.$.attr = 'service-id';
            }
            resourceMatch.$.match= serviceId;
            policy.rule[i].condition[0]['resource-match'].push(resourceMatch);
            if (policy.rule[i].condition[0].$.combine == 'and') {
                policy.rule[i].condition[0].$.combine = 'or';
            }
            addedResourceMatch = true;
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
        rule.$.id = 'r_' + Id + '_' + date;
        rule.condition = [];
        rule.condition[0] = {};
        rule.condition[0].$ = {};
        rule.condition[0].$.combine = 'or';
        rule.condition[0]['resource-match'] = [];
        rule.condition[0]['resource-match'][0] = {};
        rule.condition[0]['resource-match'][0].$ = {};
        if (isWebinosAPI(serviceId)) {
            rule.condition[0]['resource-match'][0].$.attr = 'api-feature';
        }
        else {
            rule.condition[0]['resource-match'][0].$.attr = 'service-id';
        }
        rule.condition[0]['resource-match'][0].$.match = serviceId;
        policy.rule.splice(0,0,rule);
    }
    return policy;
}

var isWebinosAPI = function(URI) {
    var exp = new RegExp ('.+(?:api|ns|manager|mwc|core)\/(?:w3c\/|api-perms\/|internal\/|discovery\/)?[^\/\.]+','');
    if (exp.exec(URI)) {
        return true;
    }
    else {
        return false;
    }
}
