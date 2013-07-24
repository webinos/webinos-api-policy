var appData = {};
var policyeditor;

var discovery = "http://webinos.org/api/discovery";


webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), {
    onFound: function(service) {
        policyeditor = service;
        policyeditor.bindService({
            onBind: function(service) {
                policyeditor.getPolicySet(0, function(ps) {
                    var people, applications, profiles, services;

                    var policy = ps.toJSONObject()
                    var policyString = JSON.stringify(policy);
                    people = getMatch(policyString, "user-id");
                    appData.people = [];
                    for (var i = 0; i < people.length; i++) {
                        var p = {};
                        p.id = i + 1;
                        p.name = people[i];
                        p.email = p.name + "@webinos.org";
                        p.lastAccess = 0000000000000;
                        appData.people.push(p);
                    }
                    drawPeopleList();

                    applications = getMatch(policyString, "id");
                    appData.applications = [];
                    for (var i = 0; i < applications.length; i++) {
                        var p = {};
                        p.id = i + 1;
                        p.name = applications[i];
                        appData.applications.push(p);
                    }

                    profiles = getMatch(policyString, "profile");
                    appData.profiles = [];
                    for (var i = 0; i < profiles.length; i++) {
                        var p = {};
                        p.id = i + 1;
                        p.name = profiles[i];
                        appData.profiles.push(p);
                    }

                    // the following code is a workaround to add fake
                    // environments when we don't have real ones
                    if (appData.profiles.length == 0) {
                        var p = {};
                        p.id = 1;
                        p.name = "Misc.";
                        appData.profiles.push(p);
                    }

                    services = getMatch(policyString, "api-feature");
                    appData.services = [];
                    for (var i = 0; i < services.length; i++) {
                        var p = {};
                        p.id = i + 1;
                        p.uri = services[i];
                        p.name = p.uri.split('/').pop();
                        appData.services.push(p);
                    }

                    var id = 1;
                    appData.permissions = [];

                    // code to populate environments tab
                    for (var i = 0; i < appData.people.length; i++) {
                        for (var j = 0; j < appData.applications.length; j++) {
                            for (var k = 0; k < appData.services.length; k++) {
                                for (var l = 0; l < appData.profiles.length; l++) {
                                    var p = {};
                                    p.id = id;
                                    id++;
                                    p.personId = appData.people[i].id;
                                    p.appId = appData.applications[j].id;
                                    p.serviceId = appData.services[k].id;
                                    p.name = appData.services[k].name;
                                    p.profileId = appData.profiles[l].id;
                                    var request = {};
                                    request.subjectInfo = {};
                                    request.subjectInfo.userId = appData.people[i].name;
                                    request.widgetInfo = {};
                                    request.widgetInfo.id = appData.applications[j].name;
                                    request.resourceInfo = {};
                                    request.resourceInfo.apiFeature = appData.services[k].uri;
                                    request.environmentInfo = {};
                                    request.environmentInfo.profile = appData.profiles[l].name;
                                    appData.permissions.push(p);
                                    syncPermissions(+1);
                                    envEnforceRequest(policyeditor, ps, appData.permissions.length, request);
                                }
                            }
                        }
                    }

                    id = 1;
                    appData.appPermissions = [];

                    for (var i = 0; i < appData.people.length; i++) {
                        for (var j = 0; j < appData.applications.length; j ++) {
                            for (var k = 0; k < appData.services.length; k ++) {
                                var p = {};
                                p.id = id;
                                id++;
                                p.personId = appData.people[i].id;
                                p.appId = appData.applications[j].id;
                                p.serviceId = appData.services[k].id;
                                var request = {};
                                request.subjectInfo = {};
                                request.subjectInfo.userId = appData.people[i].name;
                                request.widgetInfo = {};
                                request.widgetInfo.id = appData.applications[j].name;
                                request.resourceInfo = {};
                                request.resourceInfo.apiFeature = appData.services[k].uri;
                                appData.appPermissions.push(p);
                                syncAppPermissions(+1);
                                appEnforceRequest(policyeditor, ps, appData.appPermissions.length, request);
                            }
                        }
                    }

                    // At the moment we don't know the user-id of the zone
                    // owner. As a workaround we suppose to have a policy with
                    // id "local-discoverability".
                    // The user-id in the target of this policy is the one of
                    // the zone owner.
                    var localDiscoverabilityPolicy = ps.getPolicy("local-discoverability");
                    if (localDiscoverabilityPolicy) {
                        var owner = getMatch(JSON.stringify(localDiscoverabilityPolicy.toJSONObject()), "user-id");
                        if (owner[0]) {
                            appData.localQuickSettings = [];
                            for (var i = 0; i < appData.services.length; i++) {
                                if (appData.services[i].uri !== discovery) {
                                    var p = {};
                                    p.name = appData.services[i].name;
                                    var request = {};
                                    request.subjectInfo = {};
                                    request.subjectInfo.userId = owner[0];
                                    request.resourceInfo = {};
                                    request.resourceInfo.apiFeature = discovery;
                                    request.resourceInfo.paramFeature = appData.services[i].uri;
                                    appData.localQuickSettings.push(p);
                                    syncLocalQuickSettings(+1);
                                    localQuickSettingsEnforceRequest(policyeditor, ps, appData.localQuickSettings.length, request);
                                }
                            }
                        }
                    }
                    appData.remoteQuickSettings = [];
                    for (var i = 0; i < appData.services.length; i++) {
                        if (appData.services[i].uri !== discovery) {
                            var p = {};
                            p.name = appData.services[i].name;
                            var request = {};
                            request.resourceInfo = {};
                            request.resourceInfo.apiFeature = discovery;
                            request.resourceInfo.paramFeature = appData.services[i].uri;
                            appData.remoteQuickSettings.push(p);
                            syncRemoteQuickSettings(+1);
                            remoteQuickSettingsEnforceRequest(policyeditor, ps, appData.remoteQuickSettings.length, request);
                        }
                    }
                }, null);
            }
        });
    }
});

var permissionsDone = function(callback) {
        var counter = 0;
        return function (incr) {
                if (0 == (counter += incr))
                        callback();
        };
};

var syncPermissions = permissionsDone(function() { drawPlaces(); });

function envEnforceRequest(pe, ps, i, req) {
    pe.testPolicy(ps, req, function(res) {
        // received data: 0 permit, 1 deny, 2 prompt_oneshot, 3 prompt_session, 4 prompt_blanket, 5 undetermined, 6 inapplicable
        // stored data: 1 allow, 0 prompt, -1 deny

        if (res.effect == 0) {
            appData.permissions[i-1].perm = 1;
        }
        if (res.effect == 1 || res.effect == 5 || res.effect == 6) {
            appData.permissions[i-1].perm = -1;
        }
        if (res.effect > 1 && res.effect < 5) {
            appData.permissions[i-1].perm = 0;
        }
        console.log("===================");
        console.log(JSON.stringify(req));
        console.log(JSON.stringify(res));
        console.log(JSON.stringify(appData.permissions[i-1]));
        console.log("===================");
        syncPermissions(-1);
    }, null);
}

var appPermissionsDone = function(callback) {
        var counter = 0;
        return function (incr) {
                if (0 == (counter += incr))
                        callback();
        };
};

var syncAppPermissions = appPermissionsDone(function() { drawApps(); });

function appEnforceRequest(pe, ps, i, req) {
    pe.testPolicy(ps, req, function(res) {
        // received data: 0 permit, 1 deny, 2 prompt_oneshot, 3 prompt_session, 4 prompt_blanket, 5 undetermined, 6 inapplicable
        // stored data: 1 allow, 0 prompt, -1 deny

        if (res.effect == 0) {
            appData.appPermissions[i-1].perm = 1;
        }
        if (res.effect == 1 || res.effect == 5 || res.effect == 6) {
            appData.appPermissions[i-1].perm = -1;
        }
        if (res.effect > 1 && res.effect < 5) {
            appData.appPermissions[i-1].perm = 0;
        }
        //console.log(JSON.stringify(req));
        //console.log(JSON.stringify(appData.appPermissions[i-1]));
        syncAppPermissions(-1);
    }, null);
}

var localQuickSettingsDone = function(callback) {
        var counter = 0;
        return function (incr) {
                if (0 == (counter += incr))
                        callback();
        };
};

var syncLocalQuickSettings = localQuickSettingsDone(function() { drawLocalQuickSettings(); });

function localQuickSettingsEnforceRequest(pe, ps, i, req) {
    pe.testPolicy(ps, req, function(res) {
        // received data: 0 permit, 1 deny, 2 prompt_oneshot, 3 prompt_session, 4 prompt_blanket, 5 undetermined, 6 inapplicable

        if (res.effect == 0) {
            appData.localQuickSettings[i-1].enabled = true;
        }
        else {
            appData.localQuickSettings[i-1].enabled = false;
        }
        syncLocalQuickSettings(-1);
    }, null);
}

var remoteQuickSettingsDone = function(callback) {
        var counter = 0;
        return function (incr) {
                if (0 == (counter += incr))
                        callback();
        };
};

var syncRemoteQuickSettings = localQuickSettingsDone(function() { drawRemoteQuickSettings(); });

function remoteQuickSettingsEnforceRequest(pe, ps, i, req) {
    pe.testPolicy(ps, req, function(res) {
        // received data: 0 permit, 1 deny, 2 prompt_oneshot, 3 prompt_session, 4 prompt_blanket, 5 undetermined, 6 inapplicable

        if (res.effect == 0) {
            appData.remoteQuickSettings[i-1].enabled = true;
        }
        else {
            appData.remoteQuickSettings[i-1].enabled = false;
        }
        syncRemoteQuickSettings(-1);
    }, null);
}

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

    for (var i in obj) {
        ret.push(i);
    }
    return ret;
}

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

/* DRAG & DROP */


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
		} else if(columnId.indexOf('prompt') != -1) {
			permission = 0;
		} else if(columnId.indexOf('deny') != -1) {
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
/*function dragDropInitDraggables() {
	var draggables = document.querySelectorAll('[draggable]');
	[].forEach.call(draggables, function(draggable) {
		draggable.addEventListener('dragstart', handleDragStart, false);
		draggable.addEventListener('dragend', handleDragEnd, false);
	});
}*/


function drawLocalQuickSettings() {
	var localQuickSettingsContainer = document.getElementById('localQuickSettings-content'),
		html = '',
		localQuickSettings = appData.localQuickSettings || [],
		i = 0,
		j = localQuickSettings.length,
		checked = '',
		active = '';

	for(i; i<j; i++) {
		if(localQuickSettings[i].enabled) {
			checked = ' checked';
		} else {
			checked = '';
		}

		html += '' +
			'<label id="qsnl'+i+'" class="onoffswitch-namelabel" for="myonoffswitch'+i+'">'+localQuickSettings[i].name+'</label>' +
			'<div class="onoffswitch">' +
				'<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch'+i+'"'+checked+'>' +
				'<label class="onoffswitch-label" for="myonoffswitch'+i+'">' +
					'<div class="onoffswitch-inner"></div>' +
					'<div class="onoffswitch-switch"></div>' +
				'</label>' +
			'</div>';
	}

	localQuickSettingsContainer.innerHTML = html;
/*
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

	quickSettingsStatusContainer.innerHTML = html;*/
};

function drawRemoteQuickSettings() {
	var remoteQuickSettingsContainer = document.getElementById('remoteQuickSettings-content'),
		html = '',
		remoteQuickSettings = appData.remoteQuickSettings || [],
		i = 0,
		j = remoteQuickSettings.length,
		checked = '',
		active = '';

	for(i; i<j; i++) {
		if(remoteQuickSettings[i].enabled) {
			checked = ' checked';
		} else {
			checked = '';
		}

		html += '' +
			'<label id="qsnl'+i+'" class="onoffswitch-namelabel" for="myonoffswitch'+i+'">'+remoteQuickSettings[i].name+'</label>' +
			'<div class="onoffswitch">' +
				'<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch'+i+'"'+checked+'>' +
				'<label class="onoffswitch-label" for="myonoffswitch'+i+'">' +
					'<div class="onoffswitch-inner"></div>' +
					'<div class="onoffswitch-switch"></div>' +
				'</label>' +
			'</div>';
	}

	remoteQuickSettingsContainer.innerHTML = html;
};


var drawStoreList = function() {
	var storeListContainer = document.getElementById('storeListContainer'),
		html = '',
		stores = appData.stores || [],
		i = 0,
		j = stores.length,
		checked;

	for(i; i<j; i++) {
		if(stores[i].allow) {
			checked = ' checked="checked"';
		} else {
			checked = '';
		}
		html += '' +
			'<div>' +
				'<input type="checkbox"'+checked+' id="store'+i+'">' +
				'<label for="store'+i+'">'+ stores[i].name +'</label>' +
			'</div>';
	}

	storeListContainer.innerHTML = html;

	drawPermissionButtons('unk-loc-per-con', [{n:"Allow",c:"allow"}, {n:"Allow once",c:"prompt"}, {n:"Deny",c:"deny"}], 1);
}();

var listOptions, peopleList;

var drawPeopleList = function() {
	var peopleListContainer = document.getElementById('people-list'),
		html = '',
		people = appData.people || [],
		i = 0,
		j = people.length,
		pic,
		date;

	for(i; i<j; i++) {
		if(!people[i].img) {
			pic = 'placeholder.png';
		} else {
			pic = people[i].img;
		}

		thaDate = new Date(people[i].lastAccess);

		html += '' +
			'<li>' +
				'<img src="policyeditor/img/'+pic+'">' +
				'<div class="name">'+ people[i].name +'</div>' +
				'<div class="email">'+ people[i].email +'</div>' +
				'<div class="lastused">Last used your personal zone: <span>'+ getDayName(thaDate)+', '+formatAMPM(thaDate) +'</span></div>' +
				'<div class="lastused-timestamp">'+ thaDate.getTime() +'</div>' +
				//'<div class="button">Edit permissions</div>' +
			'</li>';
	}

	peopleListContainer.innerHTML = html;

    // list.js
        listOptions = {
        valueNames: ['name', 'email', 'lastused-timestamp']
    };

        peopleList = new List('peoplePolicies', listOptions);
    // end of list.js
};


var filledServicesSelection = false;

function drawPlaces() {
	var profiles = appData.profiles || [],
		people = appData.people || [];

	appData.placesPolicies = {};
	domObjs.placesPolicies = {};
	domObjs.placesPolicies.profileListContainer = document.getElementById('places-profiles');
	domObjs.placesPolicies.peopleSelect = document.getElementById('places-people');
	domObjs.placesPolicies.allow = document.getElementById('places-allow');
	domObjs.placesPolicies.prompt = document.getElementById('places-prompt');
	domObjs.placesPolicies.deny = document.getElementById('places-deny');
	domObjs.placesPolicies.profiles = {};
	domObjs.placesPolicies.permissions = {};

	createProfileList(profiles, domObjs.placesPolicies.profileListContainer, 'placesPolicies');

	createPeopleDropdownOptions(people, domObjs.placesPolicies.peopleSelect, 'placesPolicies');

	dragDropInitColumns();

	if(profiles.length > 0) {
		drawDraggablePermissions('placesPolicies');
	}

	fillOptionsFromArray(domObjs.popupAddPermissionApp, appData.applications);
    if (filledServicesSelection == false) {
        filledServicesSelection = true;
        fillOptionsFromArray(domObjs.popupAddPermissionType, appData.services); //also needed for "app" tab
    }
};

var drawApps = function() {
	var applications = appData.applications || [],
		people = appData.people || [];

	appData.appsPolicies = {};
	domObjs.appsPolicies = {};
	domObjs.appsPolicies.appListContainer = document.getElementById('apps-list');
	domObjs.appsPolicies.peopleSelect = document.getElementById('apps-people');
	domObjs.appsPolicies.allow = document.getElementById('apps-allow');
	domObjs.appsPolicies.prompt = document.getElementById('apps-prompt');
	domObjs.appsPolicies.deny = document.getElementById('apps-deny');
	domObjs.appsPolicies.profiles = {};
	domObjs.appsPolicies.permissions = {};

	createProfileList(applications, domObjs.appsPolicies.appListContainer, 'appsPolicies');

	createPeopleDropdownOptions(people, domObjs.appsPolicies.peopleSelect, 'appsPolicies');

	dragDropInitColumns();

	if(applications.length > 0) {
		drawDraggablePermissions('appsPolicies');
	}

    if (filledServicesSelection == false) {
        filledServicesSelection = true;
	    fillOptionsFromArray(domObjs.popupAddPermissionType, appData.services);
    }
};

function createProfileList(profiles, container, tab) {
	var i = 0,
		j = profiles.length,
		docFrag = document.createDocumentFragment();

	for(i; i<j; i++) {
		createProfileListEntry(profiles[i], docFrag, tab);
		if(i == 0) {
			setActiveProfile(profiles[i].id, tab); //initial highlight
		}
	}
	container.appendChild(docFrag);
}

function createProfileListEntry(profile, parentElement, tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	var entry = document.createElement("div");
	entry.textContent = profile.name;
	entry.onclick = function() {openProfile(profile.id)};
	if(tab == 'placesPolicies') {
		var controls = document.createElement("span");
		var edit = document.createElement("img");
		edit.src = "policyeditor/img/edit.png";
		edit.setAttribute('alt', 'Edit');
		edit.onclick = function(e) {e.stopPropagation(); profileEditPopup(profile.id);};
		var del = document.createElement("img");
		del.src = "policyeditor/img/delete.png";
		del.setAttribute('alt', 'Delete');
		del.onclick = function(e) {e.stopPropagation(); profileDeletePopup(profile.id);};
		controls.appendChild(edit);
		controls.appendChild(del);
		entry.appendChild(controls);
	}
	parentElement.appendChild(entry);

	domObjs[tab].profiles[profile.id] = entry;

	return entry;
}
function setActiveProfile(id, tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	appData[tab].currentProfileId = id;
	var obj = domObjs[tab].profiles[id];
	obj.className = 'selected'; //addClass ?
	domObjs[tab].currentProfileDiv = obj;
}

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
			setActivePerson(people[i].id, tab); //init internal state
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
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	appData[tab].currentPersonId = id;
}

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
	if(tab == 'appsPolicies') {
		nameHtml = '<b>'+getObjFromArrayById(permission.serviceId, appData.services).name+'</b>';
	} else if(tab == 'placesPolicies') {
		nameHtml = '<b>'+permission.name+'</b>@'+getObjFromArrayById(permission.appId, appData.applications).name;
	}
	entry = document.createElement("div");
	entry.setAttribute('draggable', 'true');
	entry.id = permission.id;
	name = document.createElement("div");
	name.innerHTML = nameHtml;
	entry.appendChild(name);
	controls = document.createElement("span");
	edit = document.createElement("img");
	edit.src = "policyeditor/img/edit.png";
	edit.setAttribute('alt', 'Edit');
	edit.onclick = function(e) {permissionEditPopup(permission.id);};
	del = document.createElement("img");
	del.src = "policyeditor/img/delete.png";
	del.setAttribute('alt', 'Delete');
	del.onclick = function(e) {permissionDeletePopup(permission.id);};
	controls.appendChild(edit);
	controls.appendChild(del);
	entry.appendChild(controls);

	docFrag.appendChild(entry);

	entry.addEventListener('dragstart', handleDragStart, false);
	entry.addEventListener('dragend', handleDragEnd, false);

	domObjs[tab].permissions[permission.id] = name;

	return entry;
}

function drawDraggablePermissions(tab) {
	if(!tab) {
		var tab = domObjs.pages.tabsPolEd._currentPage.id;
	}
	var permissions,
		permissionId,
		currentPermId;
	if(tab == 'appsPolicies') {
		permissions = appData.appPermissions || [];
		permissionId = 'appId';
	} else if(tab == 'placesPolicies') {
		permissions = appData.permissions || [];
		permissionId = 'profileId';
	}

	var personId = appData[tab].currentPersonId,
		currentPermId = appData[tab].currentProfileId;
	if(!permissionId || !personId || !tab) return false;

	domObjs[tab].allow.innerHTML = '';
	domObjs[tab].prompt.innerHTML = '';
	domObjs[tab].deny.innerHTML = '';

	var docFragAllow = document.createDocumentFragment(),
		docFragPrompt = document.createDocumentFragment(),
		docFragDeny = document.createDocumentFragment(),
		i = 0,
		j = permissions.length;

	for(i = 0; i<j; i++) {
		if(permissions[i][permissionId] == currentPermId && permissions[i].personId == personId) {
			if(permissions[i].perm == 1) {
                console.log("perm allow");
				docFrag = docFragAllow;
			} else if(permissions[i].perm == 0) {
                console.log("perm deny");
				docFrag = docFragPrompt;
			} else if(permissions[i].perm == -1) {
                console.log("perm prompt");
				docFrag = docFragDeny;
			}

			createPermissionEntry(permissions[i], docFrag, tab);
		}
	}
	domObjs[tab].allow.appendChild(docFragAllow);
	domObjs[tab].prompt.appendChild(docFragPrompt);
	domObjs[tab].deny.appendChild(docFragDeny);

	//dragDropInitDraggables();
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

function openProfile(id) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;
	//de-highlight old one
	if(domObjs[tab].currentProfileDiv) {
		removeClass(domObjs[tab].currentProfileDiv, 'selected');
	}
	//set active + higlight + draw
	setActiveProfile(id);
	drawDraggablePermissions();
}

function placesAddEditProfile() {
	var newName = domObjs.popupAddProfileName.value;
	if(newName == '') return;

	var id = domObjs.popupAddProfileId.value,
		profile;
	if(!id) { //new
		profile = {};
		profile.id = new Date().valueOf();
		profile.name = newName;

		appData.profiles.push(profile);
		//draw
		var docFrag = document.createDocumentFragment();
		createProfileListEntry(profile, docFrag);

		if(!appData.placesPolicies.currentProfileId) {
			setActiveProfile(profile.id);
		}

		domObjs.placesPolicies.profileListContainer.appendChild(docFrag);
	} else { //edit
		profile = getObjFromArrayById(id, appData.profiles);
		if(!profile) return;

		profile.name = newName;
		//re-draw
		domObjs.placesPolicies.profiles[id].textContent = newName;
	}
}

function placesDeleteProfile() {
	var id = appData.placesPolicies.profileToDelete;
	//delete profile
	var profile = getObjFromArrayById(id, appData.profiles, true);
	appData.profiles.splice(profile.pos,1);
	var profileDiv = domObjs.placesPolicies.profiles[id];
	profileDiv.parentNode.removeChild(profileDiv);
	delete domObjs.placesPolicies.profiles[id]; //remove reference
	domObjs.placesPolicies.currentProfileDiv = undefined;

	var removePermissionsHtml = false;
	if(appData.placesPolicies.currentProfileId == id) { //if current profile is being deleted select first one
		if(appData.profiles.length > 0) {
			openProfile(appData.profiles[0].id);
		} else {
			appData.placesPolicies.currentProfileId = undefined;
			removePermissionsHtml = true; //no other profile, so we must clear permissions from the view
		}
	}
	//remove permissions AFTER profile change, to avoid pointless redraws
	var permissions = appData.permissions,
		i = 0,
		j = permissions.length;

	for(i; i<j; i++) {
		if(permissions[i].profileId == id) {
			var permId = permissions[i].id;
			if(removePermissionsHtml) {
				var permissionDiv = domObjs.placesPolicies.permissions[permId].parentNode; //one node higher
				permissionDiv.parentNode.removeChild(permissionDiv);
			}
			delete domObjs.placesPolicies.permissions[permId]; //remove reference
			appData.permissions.splice(i,1);
			i--; //compensate for the missing element
			j--;
		}
	}
	appData.placesPolicies.profileToDelete = undefined;
}

function addEditPermission() {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;

	var app = domObjs.popupAddPermissionApp.value;
	var type = domObjs.popupAddPermissionType.value;
	var perm = domObjs.popupAddPermissionAction.value;
	var personId = appData[tab].currentPersonId;

	var newName = domObjs.popupAddPermissionName.value;
	if(newName == '') {
		newName = getObjFromArrayById(type, appData.services).name;
	}

	var destColumn;
	if(perm == 'allow') {
		perm = 1;
		destColumn = domObjs[tab].allow;
	} else if(perm == 'prompt') {
		perm = 0;
		destColumn = domObjs[tab].prompt;
	} else if(perm == 'deny') {
		perm = -1;
		destColumn = domObjs[tab].deny;
	}

	var id = domObjs.popupAddPermissionId.value,
		permission;

	if(!id) { //new
		permission = {};
		permission.id = new Date().valueOf();
		if(tab == 'placesPolicies') {
			permission.profileId = appData.placesPolicies.currentProfileId,
			permission.name = newName;
		}
		permission.appId = app;
		permission.serviceId = type;
		permission.perm = perm;
		permission.personId = personId;

		if(tab == 'appsPolicies') {
			appData.appPermissions.push(permission);
		} else if(tab == 'placesPolicies') {
			appData.permissions.push(permission);
		}

		//draw
		var docFrag = document.createDocumentFragment();
		createPermissionEntry(permission, docFrag);
		destColumn.appendChild(docFrag);
	} else { //edit
		if(tab == 'appsPolicies') {
			permission = getObjFromArrayById(id, appData.appPermissions);
		} else if(tab == 'placesPolicies') {
			permission = getObjFromArrayById(id, appData.permissions);
		}
		if(!permission) return;

		var permissionChanged = false;
		if(permission.perm != perm) {
			permissionChanged = true;
		}

		permission.appId = app;
		permission.serviceId = type;
		permission.perm = perm;
		permission.personId = personId;

		var nameHtml;
		if(tab == 'appsPolicies') {
			nameHtml = '<b>'+getObjFromArrayById(permission.serviceId, appData.services).name+'</b>';
		} else if(tab == 'placesPolicies') {
			permission.name = newName;
			nameHtml = '<b>'+permission.name+'</b>@'+getObjFromArrayById(permission.appId, appData.applications).name;
		}

		//re-draw
		domObjs[tab].permissions[id].innerHTML = nameHtml;
		if(permissionChanged) {
			destColumn.appendChild(domObjs[tab].permissions[id].parentNode);
		}
	}
}

function updatePermission(id, permission) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id,
		permissionObj;
	if(tab == 'appsPolicies') {
		permissionObj = getObjFromArrayById(id, appData.appPermissions);
	} else if(tab == 'placesPolicies') {
		permissionObj = getObjFromArrayById(id, appData.permissions);
	}
	if(!permissionObj) return;
	if(!isNaN(permission)) permissionObj.perm = permission;
}

function deletePermission() {
	var tab = domObjs.pages.tabsPolEd._currentPage.id,
		id = appData[tab].permissionToDelete,
		permission;
	if(tab == 'appsPolicies') {
		permission = getObjFromArrayById(id, appData.appPermissions, true);
		appData.appPermissions.splice(permission.pos,1);
	} else if(tab == 'placesPolicies') {
		permission = getObjFromArrayById(id, appData.permissions, true);
		appData.permissions.splice(permission.pos,1);
	}
	var permissionDiv = domObjs[tab].permissions[id].parentNode; //one node higher
	permissionDiv.parentNode.removeChild(permissionDiv);
	delete domObjs[tab].permissions[id]; //remove reference
	appData[tab].permissionToDelete = undefined;
}

/* POPUPS */
function profileEditPopup(id) {
	if(!id) { //new
		domObjs.popupAddProfileId.value = '';
		domObjs.popupAddProfileName.value = '';
	} else {
		var profile = getObjFromArrayById(id, appData.profiles);
		domObjs.popupAddProfileId.value = profile.id;
		domObjs.popupAddProfileName.value = profile.name;
	}
	showPopup(domObjs.popupAddProfile);
}

function profileDeletePopup(id) {
	appData.placesPolicies.profileToDelete = id;
	showPopup(domObjs.popupDeleteProfile);
}

function permissionEditPopup(newPermissionOrId) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;

	if(isNaN(newPermissionOrId)) { //new
		if(newPermissionOrId == "allow" || newPermissionOrId == 'prompt' || newPermissionOrId == 'deny') {
			domObjs.popupAddPermissionAction.value = newPermissionOrId;
		} else {
			domObjs.popupAddPermissionAction.options[0].selected = "selected";
		}
		//reset other fields
		domObjs.popupAddPermissionId.value = '';
		domObjs.popupAddPermissionName.value = '';
		if(tab == 'appsPolicies') {
			domObjs.popupAddPermissionApp.value = appData[tab].currentProfileId;
		} else {
			domObjs.popupAddPermissionApp.options[0].selected = "selected";
		}
		domObjs.popupAddPermissionType.options[0].selected = "selected";
	} else { //edit
		var permission;

		if(tab == 'appsPolicies') {
			permission = getObjFromArrayById(newPermissionOrId, appData.appPermissions);
		} else if(tab == 'placesPolicies') {
			permission = getObjFromArrayById(newPermissionOrId, appData.permissions);
		}

		var permValue;
		if(permission.perm == 1) {
			permValue = 'allow';
		} else if(permission.perm == 0) {
			permValue = 'prompt';
		} else if(permission.perm == -1) {
			permValue = 'deny';
		}

		domObjs.popupAddPermissionId.value = permission.id;
		domObjs.popupAddPermissionName.value = permission.name;
		domObjs.popupAddPermissionApp.value = permission.appId;
		domObjs.popupAddPermissionType.value = permission.serviceId;
		domObjs.popupAddPermissionAction.value = permValue;
	}

	if(tab == 'appsPolicies') {
		domObjs.popupAddPermissionNameContainer.style.display = "none";
		domObjs.popupAddPermissionAppContainer.style.display = "none";
	} else if(tab == 'placesPolicies') {
		domObjs.popupAddPermissionNameContainer.style.display = "block";
		domObjs.popupAddPermissionAppContainer.style.display = "block";
	}

	//TODO block here options that would collide with already set permissions
	//this would have to be pretty dynamic = not so easy

	showPopup(domObjs.popupAddPermission);
}

function permissionDeletePopup(id) {
	var tab = domObjs.pages.tabsPolEd._currentPage.id;
	appData[tab].permissionToDelete = id; //TODO meh
	showPopup(domObjs.popupDeletePermission);
}
