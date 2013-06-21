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
(function() {

    PolicyManagementModule = function (obj) {
        this.base = WebinosService;
        this.base(obj);
    };

    PolicyManagementModule.prototype = new WebinosService;

    PolicyManagementModule.prototype.bindService = function (bindCB, serviceId) {
        this.policy = policy;
        this.policyset = policyset;
        this.getPolicySet = getPolicySet;
        this.testPolicy = testPolicy;
        this.save = save;

        if (typeof bindCB.onBind === 'function') {
            bindCB.onBind(this);
        };
    }

    
        var policy = function(ps, id, combine, description){
        
        var _ps = ps;
        if(ps)
            _ps = ps;
        else{
            _ps = {};
            _ps['$'] = {};
            _ps['$']["id"] = (id) ? id : getNewId();
        }

        if(combine)
            _ps['$']["combine"] = combine;
        if(description)
            _ps['$']["description"] = description;

        function getNewId(type) {
            return new Date().getTime();
        };

        this.getInternalPolicy = function(){
            return _ps;
        };

        //this.updateRule = function(ruleId, effect, updatedCondition){
        this.updateRule = function(ruleId, key, value){
            if(!_ps) {
                return null;
            }

//            if(effect != 'permit' && effect != 'prompt-oneshot' && effect != 'prompt-session' && effect != 'prompt-blanket' && effect != 'deny') {
//                effect = "";
//            }

            //console.log("Effect :: "+effect);
            var policy = _ps;
            var rule;
            var count=0;
            for(var i in policy["rule"]) {
                if(policy["rule"][i]['$']["id"] == ruleId) {
                    rule = policy["rule"][i];
                    break;
                }
                count++;
            }

            if(rule){


                if(key == "effect"){
                    if(value)
                        rule['$']["effect"] = value;
                    else
                        rule['$']["effect"] = "permit";
                }
                else if(key == "condition"){

                    if(value){
                        if(rule.condition){
                            //check first child
                            var parent = rule["condition"];
                            
                            var tmp = parent[0];
                            console.log(JSON.stringify(rule["condition"]));
                            if(tmp['$']["id"] == value['$']["id"]){
                                parent[0] = value;
                                return;
                            }

                            //check other children
                            while(true){
                                if(tmp.condition && value){

                                    if(tmp.condition[0]['$']["id"] == value['$']["id"]){
                                        tmp.condition[0] = value;
                                        return;
                                    }
                                    else
                                        tmp = tmp.condition;
                                }
                                else
                                    break;
                            }
                        }
                        else{
                            rule["condition"] = [value];
                        }
                    }
                    else{
                        if(rule.condition){
                            rule.condition = undefined;
                        }
                        else
                        {
                            ;
                        }
                    }
                }
/*
                if(!updatedCondition)
                    if(rule["condition"])
                        rule["condition"] = undefined;

                else if(!rule.condition){
                    console.log("No condition");
                    rule["condition"] = new Array();
                    rule["condition"][0] = updatedCondition;
                }

                else{
                    
                    //check first child
                    var parent = rule["condition"];
                    
                    var tmp = parent[0];

                    if(tmp['$']["id"] == updatedCondition['$']["id"]){
                        parent[0] = updatedCondition;
                        return;
                    }

                    //check other children
                    while(true){
                        if(tmp.condition && updatedCondition){
                            if(tmp.condition[0]['$']["id"] == updatedCondition['$']["id"]){
                                tmp.condition[0] = updatedCondition;
                                return;
                            }
                            else
                                tmp = tmp.condition;
                        }
                        else
                            break;
                    }
                }*/
            }
        }

        this.addRule = function(newRuleId, effect, newCondition, rulePosition){
            if(!_ps) {
                return null;
            }

            //Check if effect is valid value (deny is included in default rule)
            if(effect != 'permit' && effect != 'prompt-oneshot' && effect != 'prompt-session' && effect != 'prompt-blanket' && effect != 'deny') {
                effect = "permit";
            }

            //console.log("Effect :: "+effect);
            var policy = _ps;

            var rule;
            for(var i in policy['rule']) {
                if(policy['rule'][i]['$']['effect'] == effect) {
                    rule = policy['rule'][i];
                    break;
                }
            }
            //console.log("rule :: "+rule);

            if(!rule){
                var id = (newRuleId) ? newRuleId : new Date().getTime();
                rule = {"$": {"id" : id, "effect" : effect}};
                var position = 0;
                if(rulePosition && (rulePosition<0 || policy["rule"].length == 0))
                    policy["rule"].length;
                if(!rulePosition && policy["rule"])
                    position = policy["rule"].length;
                
                console.log("position : "+position);
                if(!policy["rule"])
                    policy["rule"] = [rule];
                else    
                    policy["rule"].splice(position, 0, rule);
            }

            if(newCondition){
                if(!rule.condition){
                    console.log("No condition");
                    rule["condition"] = [newCondition];
                }
                else{
                    var tmp = rule["condition"][0];
                    while(true){
                        if(tmp.condition){
                            tmp = tmp.condition[0];
                        }
                        else
                            break;
                    }

                    tmp["condition"] = [newCondition];
                }
            }
        };

        this.removeRule = function(ruleId) {
            if(!_ps) {
                return null;
            }
            if(ruleId == null) {
                return null;
            }

            var policy = _ps;

            //console.log("PRE : " + JSON.stringify(policy["rule"]));
            if(policy["rule"]){
                var index = -1;
                var count = 0;

                for(var i in policy["rule"]){
                    if(policy["rule"][i]["$"]["id"] && policy["rule"][i]["$"]["id"] == ruleId){
                        index = i;
                        //break;
                    }
                    count ++;
                }
                if(index != -1){
                    console.log("Removing rule " + index);
                    policy["rule"].splice(index,1);
                    if(count == 1)
                        policy["rule"] = undefined; 
                }
                   
                
            }
            else
                console.log("No rules");
        };

        this.addSubject = function(newSubjectId, matches){
            if(!_ps) {
                return null;
            }

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;

            if(policy == null) {
                return null;
            }
           
            var id = (newSubjectId) ? newSubjectId : new Date().getTime();
            var newsubj = {"$" : {"id" : id} , "subject-match" : [] };
        
            for(var i in matches){
                if(i == "subject-match")
                    newsubj["subject-match"].push(matches[i]);
            }

            if(!policy.target)
                policy.target = [{}];
            if(!policy.target[0]["subject"])
                policy.target[0]["subject"] = [];

            //console.log(JSON.stringify(policy.target[0]));
            for(var i =0; i<policy.target[0]["subject"].length; i++){
                    if(policy.target[0]["subject"][i]['$']["id"] == newSubjectId){
                        console.log("A subject with " + newSubjectId + " is already present");
                        return;
                    }
                } 
            policy.target[0]["subject"].push(newsubj);
            //console.log(JSON.stringify(policy.target[0]));

        };
/*
        this.getSubjects = function(policyId){
            if(!_ps) {
                return null;
            }

            var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;

            if(policy == null) {
                return null;
            }
            var subjects = policy.target[0]["subject"];

            return subjects;
        };*/

        this.removeSubject = function(subjectId) {
            if(!_ps) {
                return null;
            }
            /*
            if(policyId == null) {
                return;
            }*/

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;
            
            //console.log(policy);

            var count = 0;

            if(policy.target && policy.target[0] && policy.target[0]["subject"]){
                var index = -1;
                for(var i in policy.target[0]["subject"]){
                    console.log(policy.target[0]["subject"][i]["$"]["id"]);
                    if(policy.target[0]["subject"][i]["$"]["id"] && policy.target[0]["subject"][i]["$"]["id"] == subjectId){
                        index = i;
                        //break;
                    }
                    count++;
                }
                if(index != -1){
                    console.log("remove "+index);
                    policy.target[0]["subject"].splice(index,1);
                }
                if(count == 1)
                    //policy.target = [];
                    policy.target = undefined;
            }
            //console.log("AFTER : " + JSON.stringify(policy["rule"]));
        };

        this.updateSubject = function(subjectId, matches){
            if(!_ps) {
                return null;
            }

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;

            if(policy == null) {
                return null;
            }
            if(policy.target && policy.target[0] && policy.target[0]["subject"]){
                var subjects = policy.target[0]["subject"];
                for(var i in subjects){
                    if(subjects[i]['$']["id"] == subjectId)
                        subjects[i]["subject-match"] = matches["subject-match"];
                }
            }
        };

        this.updateAttribute = function(key, value){
            if (!key) {
                return;
            }
            if (key == "combine") {
                _ps['$']["combine"] = value;
            }
            else if (key == "description") {
                _ps['$']["description"] = value;
            }
                
        };

        this.toJSONObject = function(){
            return _ps;
        };
    };

    var policyset = function(ps ,type, basefile, fileId, id, combine, description){
        var _type = type;
        var _basefile = basefile;
        var _fileId = fileId;

        var _parent;

        //var id = (newSubjectId) ? newSubjectId : new Date().getTime();
        var _ps = ps;
        if(ps)
            _ps = ps;
        else{
            _ps = {};
            _ps['$'] = {};
            _ps['$']["id"] = (id) ? id : getNewId();
        }

        if(combine)
            _ps['$']["combine"] = combine;
        if(description)
            _ps['$']["description"] = description;
        
        this.getBaseFile = function(){
            return _basefile;
        };

        this.getFileId = function(){
            return _fileId;
        };

        function getNewId(type) {
            return new Date().getTime();
        }

        function getPolicyById(policySet, policyId) {
            //console.log('getPolicyById - policySet is '+JSON.stringify(policySet));
            /*
            if(policyId == null || (policySet['$']['id'] && policySet['$']['id'] == policyId)) {
                return policySet;
            }
            */
            if(policySet['policy']) {
                for(var j in policySet['policy']) {
                    if(policySet['policy'][j]['$']['id'] == policyId) {
                        return policySet['policy'][j];
                    }
                }
            }
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policyId) {
                        return policySet['policy-set'][j];
                    }
                    var tmp = getPolicyById(policySet['policy-set'][j], policyId);
                    if(tmp != null) {
                        return tmp;
                    }
                }
            }
            return null;
        };

        function getPolicySetById(policySet, policyId) {
            //console.log('getPolicyById - policySet is '+JSON.stringify(policySet));
            
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policyId) {
                        return policySet['policy-set'][j];
                    }
                    var tmp = getPolicyById(policySet['policy-set'][j], policyId);
                    if(tmp != null) {
                        return tmp;
                    }
                }
            }
            return null;
        };

        this.removeSubject = function(subjectId, policyId) {
            if(!_ps) {
                return null;
            }
            if(policyId == null) {
                return;
            }

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;
            
            //console.log(policy);

            if(policy.target[0]["subject"]){
                var index = -1;
                for(var i in policy.target[0]["subject"]){
                    console.log(policy.target[0]["subject"][i]["$"]["id"]);
                    if(policy.target[0]["subject"][i]["$"]["id"] && policy.target[0]["subject"][i]["$"]["id"] == subjectId){
                        index = i;
                        break;
                    }
                }
                if(index != -1){
                    console.log("remove "+index);
                    policy.target[0]["subject"].splice(index,1);
                }
            }
            //console.log("AFTER : " + JSON.stringify(policy["rule"]));
        };


        function removePolicySetById(policySet, policySetId) {
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policySetId) {
                        policySet['policy-set'].splice(j, 1);
                        return true;
                    }
                    /*if(removePolicyById(policySet['policy-set'][j], policyId)) {
                        return true;
                    }*/
                }
            }
            return false;
        }

        function removePolicyById(policySet, policyId) {
            //console.log('removePolicyById - id is '+policyId+', set is '+JSON.stringify(policySet));
            if(policySet['policy']) {
                for(var j in policySet['policy']) {
                    if(policySet['policy'][j]['$']['id'] == policyId) {
                        policySet['policy'].splice(j, 1);
                        return true; 
                    }
                }
            }
            /*
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policyId) {
                        policySet['policy-set'].splice(j, 1);
                        return true;
                    }
                    if(removePolicyById(policySet['policy-set'][j], policyId)) {
                        return true;
                    }
                }
            }*/
            return false;
        }

        this.getInternalPolicySet = function(){
            return _ps;
        };

        this.createPolicy = function(policyId, combine, description){
//        function createPolicy(policyId, combine, description){
            return new policy(null, policyId, combine, description);
        };

        this.createPolicySet = function(policySetId, combine, description){
       //function createPolicySet(policySetId, combine, description){
            return new policyset(null, policySetId, _basefile, _fileId, policySetId, combine, description);
        };


      this.addPolicy = function(newPolicy, newPolicyPosition){
//      this.addPolicy = function(policyId, combine, description, newPolicyPosition, succCB){
//      var newPolicy = createPolicy(policyId, combine, description);
            if(!_ps) 
                return null;
            
            if(!_ps["policy"])
                _ps["policy"] = new Array();
            else{
                for(var i =0; i<_ps["policy"].length; i++){
                    console.log(JSON.stringify(newPolicy.getInternalPolicy()));
                    if(_ps["policy"][i]['$']["id"] == newPolicy.getInternalPolicy()['$']["id"]){
                        console.log("A policy with " + newPolicy.getInternalPolicy()['$']["id"] + " is already present");
                        return;
                    }
                }
            }
            var position = (newPolicyPosition == undefined || newPolicyPosition<0 || _ps["policy"].length == 0) ? _ps["policy"].length : newPolicyPosition;
            _ps['policy'].splice(position, 0, newPolicy.getInternalPolicy());
            //succCB(newPolicy);
            
        };

        this.addPolicySet = function(newPolicySet, newPolicySetPosition){
        //this.addPolicySet = function(policySetId, combine, description, newPolicySetPosition){
            //var newPolicySet = createPolicySet(policySetId, combine, description);
            if(!_ps) 
                return null;
            
            if(!_ps['policy-set'])
                _ps['policy-set'] = new Array();
            else{
                for(var i =0; i<_ps['policy-set'].length; i++){
                    console.log(JSON.stringify(newPolicySet.getInternalPolicySet()));
                    if(_ps['policy-set'][i]['$']['id'] == newPolicySet.getInternalPolicySet()['$']['id']){
                        console.log("A policyset with " + newPolicySet.getInternalPolicySet()['$']['id'] + " is already present");
                        return;
                    }
                }
            }
            var position = (newPolicySetPosition == undefined || newPolicySetPosition<0 || _ps['policy-set'].length == 0) ? _ps['policy-set'].length : newPolicySetPosition;
            _ps['policy-set'].splice(position, 0, newPolicySet.getInternalPolicySet());
            /*
            if(!_ps) 
                return null;
            
            if(!_ps["policy-set"])
                _ps["policy-set"] = new Array();

            var position = (newPolicySetPosition == undefined || newPolicySetPosition<0 || _ps["policy-set"].length == 0) ? _ps["policy-set"].length : newPolicySetPosition;
//            var position = (!newPolicySetPosition || _ps["policy-set"].length == 0) ? 0 : newPolicySetPosition;

            _ps['policy-set'].splice(position, 0, newPolicySet.getInternalPolicySet());
            */
        };

        

        // add subject to policyset
        this.addSubject = function(newSubjectId, matches){
            if(!_ps) {
                return null;
            }

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;

            if(policy == null) {
                return null;
            }
           
            var id = (newSubjectId) ? newSubjectId : new Date().getTime(); //Ecco perchè inserendo ID vuoto metto la data
            var newsubj = {"$" : {"id" : id} , "subject-match" : [] };
        
            for(var i in matches){
                if(i == "subject-match")
                    newsubj["subject-match"].push(matches[i]);
            }
            if(!policy.target)
                policy.target = [{}];

            if(!policy.target[0]["subject"])
                policy.target[0]["subject"] = [];
                
            //console.log(JSON.stringify(policy.target[0]));
            for(var i =0; i<policy.target[0]["subject"].length; i++){
                    if(policy.target[0]["subject"][i]['$']["id"] == newSubjectId){
                        console.log("A subject with " + newSubjectId + " is already present");
                        return;
                    }
                }    
            policy.target[0]["subject"].push(newsubj);
            //console.log(JSON.stringify(policy.target[0]));

        };

        //this.getPolicy = function(policyId, succCB, errCB){
        this.getPolicy = function(policyId){
            //console.log(_ps);
            if(policyId){
                var tmp = getPolicyById(_ps, policyId);
                if(tmp){
                    return new policy(tmp);
                    //succCB(new policy(tmp));
                    return;
                }
            }
            //errCB();
        };

        //this.getPolicySet = function(policySetId, succCB, errCB){
        this.getPolicySet = function(policySetId){
            if(policySetId){
                var tmp = getPolicySetById(_ps, policySetId);
                if(tmp){
                    return new policyset(tmp, "policy-set", _basefile, _fileId);
                    //succCB(new policyset(tmp, "policy-set", _basefile, _fileId));
                }
            }
            //errCB();
        };

/*
        this.getSubjects = function(policyId){
            if(!_ps) {
                return null;
            }

            var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;

            if(policy == null) {
                return null;
            }
            var subjects = policy.target[0]["subject"];

            return subjects;
        };
*/
        this.updateSubject = function(subjectId, matches){
        //this.updateSubject = function(subjectId, matches/*, policyId*/ ){
            if(!_ps) {
                return null;
            }

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;

            if(policy == null) {
                return null;
            }
            
            if(policy.target && policy.target[0] && policy.target[0]["subject"]){
                var subjects = policy.target[0]["subject"];
                for(var i in subjects){
                    console.log(subjects[i]['$']["id"]);
                    if(subjects[i]['$']["id"] == subjectId)
                        subjects[i]["subject-match"] = matches["subject-match"];
                }
            }
        };

        this.removePolicy = function(policyId){
            if(!_ps) {
                return null;
            }
            if(policyId == null) {
                return;
            }
            if (!_ps['policy']) {
                return null;
            }
            removePolicyById(_ps, policyId);
            if (_ps['policy'].length == 0) {
                _ps['policy'] = undefined;                
            }
        };

        this.removePolicySet = function(policySetId){
            if(!_ps) {
                return null;
            }
            if(policySetId == null) {
                return;
            }
            if (!_ps['policy-set']) {
                return null;
            }
            removePolicySetById(_ps, policySetId);
            console.log(_ps['policy-set']);
            if (_ps['policy-set'].length == 0) {
                _ps['policy-set'] = undefined;
            }   
        };

        

        this.removeSubject = function(subjectId) {
            if(!_ps) {
                return null;
            }
            /*
            if(policyId == null) {
                return;
            }*/

            //var policy = (policyId) ? getPolicyById(_ps, policyId) : _ps;
            var policy = _ps;
            
            //console.log(policy);

            var count = 0;

            if(policy.target && policy.target[0] && policy.target[0]["subject"]){
                var index = -1;
                for(var i in policy.target[0]["subject"]){
                    console.log(policy.target[0]["subject"][i]["$"]["id"]);
                    if(policy.target[0]["subject"][i]["$"]["id"] && policy.target[0]["subject"][i]["$"]["id"] == subjectId){
                        index = i;
                        //break;
                    }
                    count++;
                }
                if(index != -1){
                    console.log("remove "+index);
                    policy.target[0]["subject"].splice(index,1);
                    if(count == 1)
                        policy.target = undefined;
                }
                
            }
            //console.log("AFTER : " + JSON.stringify(policy["rule"]));
        };

        this.updateAttribute = function(key, value){
          if(key == "combine" || key == "description"){
            _ps['$'][key] = value;
          }
        };
        /*function(policySetId, combine, description){
            if(policySetId)
                _ps['$']["id"] = policySetId;
            if(combine)
                _ps['$']["combine"] = combine;
            if(description)
                _ps['$']["description"] = description;};*/
        

        this.toJSONObject = function(){
            return _ps;
            //return "ID : " + _id + ", DESCRIPTION : " + _ps.$.description + ", PATH : " + _basefile;
        }
    }

    var policyFiles = new Array();

    function getPolicySet(policyset_id, success, error) {
        var successCB = function(params){
            var ps = new policyset(params, "policy-set", policyset_id) ;
            console.log(ps);
            success(ps);
        }

        if(!policyFiles || policyFiles.length == 0) {
            var rpc = webinos.rpcHandler.createRPC(this, "getPolicy", [policyset_id]); // RPC service name, function, position options
            webinos.rpcHandler.executeRPC(rpc
                , function (params) {
                    successCB(params);
                }
                , function (error) {
                    console.log(error);
                }
            );
        }
        else {
            success(new policyset(policyFiles[policyset_id].content, "policy-set", policyset_id));              
        }
    };

    function save(policyset, successCB, errorCB) {
        var rpc = webinos.rpcHandler.createRPC(this, "setPolicy", [policyset.getBaseFile(), policyset.toJSONString()]);
        webinos.rpcHandler.executeRPC(rpc
            , function (params) {
                successCB(params);
            }
            , function (error) {
                errorCB(error);
            }
        );
    };

    function testPolicy(policyset, request, successCB, errorCB) {
        var rpc = webinos.rpcHandler.createRPC(this, "testPolicy", [policyset.getBaseFile(), JSON.stringify(request)]);
        webinos.rpcHandler.executeRPC(rpc
            , function (params) {
                successCB(params);
            }
            , function (error) {
                errorCB(error);
            }
        );
    };
})();
