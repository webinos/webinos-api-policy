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
                        request.resourceInfo.apiFeature = serviceId;
                        var policy = ps.toJSONObject()
                        policyeditor.testPolicy(ps, request, function(res) {
                            if (res.effect == 0) {
                                successCB("enable");
                            }
                            else if (res.effect == 1) {
                                successCB("disable");
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
