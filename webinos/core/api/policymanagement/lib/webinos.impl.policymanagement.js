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
 *******************************************************************************/
(function () {
    "use strict";

    var fs = require('fs');
    var xml2js = require('xml2js');
    var convert2xml = require('data2xml')({attrProp:'$'});
    var path = require('path');

    var dependencies = require("find-dependencies")(__dirname);
    var webinosPath = dependencies.global.require(dependencies.global.pzp.location).getWebinosPath();

    var policyFiles = [
        path.join(webinosPath, "policies/policy.xml")
    ];

    function getPolicy(id, successCB, errorCB) {
        console.log(id);
        console.log(policyFiles[id]);
        
        var xmlParser = new xml2js.Parser(xml2js.defaults['0.2']);
        var xmlPolicy = fs.readFileSync(policyFiles[id]);
        xmlParser.parseString(xmlPolicy, function(err, data) {
            console.log( data['policy-set'] );
            successCB( data['policy-set'] );
        });
    }

    function setPolicy(id, policy, successCB, errorCB) {
        var data = convert2xml('policy-set', policy);
        fs.writeFileSync(policyFiles[id], data);
        successCB(data);
    }

    exports.getPolicy = getPolicy;
    exports.setPolicy = setPolicy;

})(module.exports);
