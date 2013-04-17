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
 ******************************************************************************/

(function () {

    var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
    var implModule = require('./webinos.impl.policymanagement.js');

    var PolicyManagementModule = function (rpcHandler, params) {
        this.base = RPCWebinosService;
        this.base({api:'http://webinos.org/core/policymanagement'
            , displayName:'Policy Management API'
            , description:'API enabling policy management for applications'
        });
        this.rpcHandler = rpcHandler;
        this.params = params;
    }

    PolicyManagementModule.prototype = new RPCWebinosService;

    PolicyManagementModule.prototype.getPolicy = function (params, successCallback, errorCallback) {
        implModule.getPolicy(params[0]
            , function (prop) {
                successCallback(prop);
            }
            , function (err) {
                errorCallback(err);
            }
        );
    };

    PolicyManagementModule.prototype.setPolicy = function (params, successCallback, errorCallback) {
        implModule.setPolicy(params[0]
            , params[1]
            , function (prop) {
                successCallback(prop);
            }
            , function (err) {
                errorCallback(err);
            }
        );
    };

    exports.Service = PolicyManagementModule;

})();
