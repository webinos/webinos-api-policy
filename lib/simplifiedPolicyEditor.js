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

var friendsURI = 'http://webinos.org/subject/id/known';

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
}

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
    });
};

var editPolicy = function (pe, ps, userId, serviceId, access, request, res) {
    var policy = ps.getPolicy([userId]);
    var position = 0;
    if (policy.matched.length > 0) {
        policy = policy.matched[0].toJSONObject();
        var path = JSON.parse(res.user.path);
        for (var i = 0; i < path.policy.length; i++) {
            if (path.policy[i].id == policy.$.id) {
                position = path.policy[i].position;
                break;
            }
        }
        // check if target contains the friends generi URI
        if (policy.target[0].subject[0]['subject-match'][0].$.match === friendsURI) {
            // make a copy of the policy (clone object)
            policy = JSON.parse(JSON.stringify(policy));
            // modify policy's and rules' ids
            policy.$.id = 'p_' + userId + '_' + new Date().getTime();
            policy.$.description = userId + '-policy';
            var date = new Date().getTime();
            for (var i = 0; i < policy.rule.length; i++) {
                policy.rule[i].$.id = 'r_' + userId + '_' + date;
                date++;
            }
            // modify target to replace the generic URI
            policy.target[0].subject[0]['subject-match'][0].$.match = userId;
        }
        else {
            // remove the old policy
            ps.removePolicy(policy.$.id);
        }

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
    ps.addPolicy(newPolicy, position);

    return ps;
};
