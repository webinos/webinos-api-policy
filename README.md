webinos-api-policy
==================

#Policy Managegement API

This implementation contains the following asynchronous methods:

* **[getPolicySet](#getPolicySet_ref)** (policysetId, successCB, errorCB)
* **[save](#save_ref)** (policyset, successCB, errorCB)

getPolicySets returns through the successCB an object of type policyset which is described below:


###policyset

* **[addPolicy](#addPolicy_ref)** (newPolicy, position)
* **[addPolicySet](#addPolicySet_ref)** (newPolicyset, position)
* **[addSubject](#addSubject_ref)** (subjectId, matches)
* policy **[createPolicy](#createPolicy_ref)** (newPolicyId, combine, description)
* policyset **[createPolicySet](#createPolicySet_ref)** (newPolicysetId, combine, description)
* policy **[getPolicy](#getPolicy_ref)** (policyId)
* policyset **[getPolicySet](#getPolicySet2_ref)** (policySetId)
* **[removePolicy](#removePolicy_ref)** (policyId)
* **[removePolicySet](#removePolicySet_ref)** (policySetId)
* **[removeSubject](#removeSubject_ref)** (subjectId)
* Object **[toJSONObject](#toJSONObject_ref)**()
* **[updateAttribute](#updateAttribute_ref)** (key, value)
* **[updateSubject](#updateSubject_ref)** (subjectId, matches)


###policy

* **[addRule](#addRule_ref)** (ruleId, effect, condition, position)
* **[addSubject](#addSubject2_ref)** (subjectId, matches)
* **[removeRule](#removeRule_ref)** (ruleId)
* **[removeSubject](#removeSubject2_ref)** (subjectId)
* Object **[toJSONObject](#toJSONObject2_ref)** ()
* **[updateAttribute](#updateAttribute2_ref)** (key, value)
* **[updateRule](#updateRule_ref)** (ruleId, key, value)
* **[updateSubject](#updateSubject2_ref)** (subjectId, matches)


##Description


### <a id="getPolicySet_ref"></a> getPolicySet ( policysetId, successCB, errorCB )

####Description
This method returns one of the three root policysets (manufacturer, user, application).

####Params

##### policySetId
The policyset's id. Accepted values are:

* 0, returns manufacturer policyset
* 1, returns user policyset
* 2, returns application policyset

##### successCB
Success callback. Receives the required policyset object as parameter.

##### errorCB
Error callback

####Example
<pre><code>
webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), 
    {onFound: function (service){ 
        policyeditor =  service;
        policyeditor.bindService({onBind: function (service) {
            policyeditor.getPolicySet(0, function(ps){
                console.log(JSON.stringify(ps.toJSONObject()));
            }, null);
        }});
    }
});
</code></pre>


### <a id="save_ref"></a> save ( policyset, successCB, errorCB )

####Description
This method saves on the filesystem the policyset

####Params

##### policyset
The policyset object to save

##### successCB
Success callback

##### errorCB
Error callback

####Example
<pre><code>
function succCB(){
    alert("Policyset saved");
}

function errCB(){
    alert("Error while saving policyset");
}

webinos.discovery.findServices(new ServiceType('http://webinos.org/core/policymanagement'), 
    {onFound: function (service){ 
        policyeditor =  service;
        policyeditor.bindService({onBind: function (service) {
            policyeditor.getPolicySet(0, function(ps){
                ps.updateAttribute("description", "new policyset description");
                policyeditor.save(ps, succCB, errCB);
            }, null);
        }});
    }
});
</code></pre>

------------------------

### <a id="getPolicySet_ref"></a> getPolicySet ( policyset_id, successCB, errorCB )

####Description
This method returns a policyset

####Params

##### policySetId
The policyset's id

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var policyset = ps.getPolicySet("ps10");
});
</code></pre>



### <a id="addPolicy_ref"></a> policyset::addPolicy ( newPolicy, position )

####Description
This method adds a policy to a policyset

####Params

##### newPolicy
A policy object

##### position
The policy's position in the policyset. A value of -1 means at the end.

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.addPolicy(aPolicy, 0);
});
</code></pre>


### <a id="addPolicySet_ref"></a> policyset::addPolicySet ( newPolicySet, position )

####Description
This method adds a policyset to a policyset

####Params

##### newPolicySet
A policyset object

##### position
The policyset's position in the policyset. A value of -1 means at the end.

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.addPolicySet(aPolicySet, 0);
});
</code></pre>


### <a id="addSubject_ref"></a> policyset::addSubject ( newPolicy, position )

####Description
This method adds a subject to a policyset

####Params

##### subjectId
The subject's id

##### matches
The subject's match attributes. It is a JSON object wich contains an array of subject-match 

<pre><code>
{
    "subject-match" : [   
        {"$" : {"attr" : "id", "match" : "123456"}},
        {"$" : {"attr" : "author-key-cn", "match" : "google"}}
    ]
}
</code></pre>

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var matches = 
    {
        "subject-match" : [   
            {"$" : {"attr" : "id", "match" : "123456"}},
            {"$" : {"attr" : "author-key-cn", "match" : "google"}}
        ]
    };    
    
    ps.addSubject("s10", matches);
});
</code></pre>


### <a id="createPolicy_ref"></a> policy policyset::createPolicy ( newPolicyId, combine, description )

####Description
This method creates and returns a new policy object. This method does not add the just created policy to the parent policyset.

####Params

##### newPolicyId
The new policy's id

##### combine
The policy's combine algorithm. *combine* may assume values:

* deny-overrides (default)
* permit-overrides
* first-applicable

##### Description
A policy's description


####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var newPolicy = ps.createPolicy("newPol", "permit-overrides", "A policy for …");
});
</code></pre>


### <a id="createPolicySet_ref"></a> policy policyset::createPolicySet ( newPolicySetId, combine, description )

####Description
This method creates and returns a new policyset object. This method does not add the just created policyset to the parent policyset.

####Params

##### newPolicySetId
The new policyset's id

##### combine
The policy's combine algorithm. *combine* may assume values:

* deny-overrides (default)
* permit-overrides
* first-matching-target

##### Description
A policyset's description


####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var newPolicySet = ps.createPolicySet("newPolSet", "permit-overrides", "A policyset for …");
});
</code></pre>


### <a id="getPolicy_ref"></a> policy policyset::getPolicy ( policyId )

####Description
This method returns a policy

####Params

##### policyId
The policy's id

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var policy = ps.getPolicy("p10");
});
</code></pre>



### <a id="getPolicySet2_ref"></a> policy policyset::getPolicySet ( policySetId )

####Description
This method returns a policyset

####Params

##### policySetId
The policyset's id

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    var policyset = ps.getPolicySet("ps10");
});
</code></pre>


### <a id="removePolicy_ref"></a> policyset::removePolicy ( policyId )

####Description
This method removes a policy

####Params

##### policyId
The policy's id

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.removePolicy("p10");
});
</code></pre>


### <a id="removePolicySet_ref"></a> policyset::removePolicySet ( policySetId )

####Description
This method removes a policyset

####Params

##### policySetId
The policyset's id

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.removePolicySet("ps10");
});
</code></pre>


### <a id="removeSubject_ref"></a> policyset::removeSubject ( subjectId )

####Description
This method remove a subject from the policyset

####Params

##### subjectId
The id of the subject to be removed

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.removeSubject("s10");
});
</code></pre>


### <a id="toJSONObject_ref"></a> object policyset::toJSONObject ( )

####Description
This method returns a JSON representation of the policyset object

####Params

none

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    alert(JSON.stringify(ps.toJSONObject()));
});
</code></pre>


### <a id="updateAttribute_ref"></a> policyset::updateAttribute (key, value)

####Description
This method updates a policyset's attributes

####Params

#####key
key parameter can assume string values

* combine
* description


#####value
The accepted values are:

If key is "combine" , value can assume one of ["deny-overrides", "permit-overrides", "first-matching-target"]

If key is "description", value is the new policy's description

####Example
<pre><code>
policyeditor.getPolicySet(0, function(ps){
    ps.updateAttribute("combine", "permit-overrides");
});
</code></pre>



### <a id="updateSubject_ref"></a> policyset::updateSubject ( subjectId, matches )

####Description
This method updates a policyset's subject

####Params

##### subjectId
The subject's id

##### matches
The subject's match attributes which will replace the existent ones. It is a JSON object wich contains an array of subject-match:

<pre><code>
{
    "subject-match" : [   
        {"$" : {"attr" : "id", "match" : "123456"}},
        {"$" : {"attr" : "author-key-cn", "match" : "google"}}
    ]
}
</code></pre>

####Example
<pre><code>
var updatedMatches = 
    {
        "subject-match" : [   
            {"$" : {"attr" : "id", "match" : "123456"}},
            {"$" : {"attr" : "author-key-cn", "match" : "samsung"}}
        ]
    };
policyeditor.getPolicySet(0, function(ps){
    policy.updateSubject("s10", updatedMatches);    
});
</code></pre>

------------------------

### <a id="addRule_ref"></a> policy::addRule ( ruleId, effect, condition, position )

####Description
This method adds a rule to a policy

####Params

##### ruleId
The rule's id

##### effect
The rule's effect. *effect* may assume values:

* permit (default)
* deny
* primpt-oneshot
* prompt-session
* prompt-blanket


##### condition 
The rule's condition. It is a JSON object wich contains an array of resource-match 

<pre><code> 
{
    "$":{"id":"cond1", "combine":"or"},
    "resource-match": [
            {"$":{"attr":"api-feature", "match":"http://webinos.org/api/nfc"}},
            {"$":{"attr":"api-feature", "match":"http://webinos.org/api/sensor"}}
     ]
}
</code></pre>

##### position
The rule's position. A value of -1 means at the end.

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
var condition = 
    {
        "$":{"id":"cond1", "combine":"or"},
        "resource-match": [
            {"$":{"attr":"api-feature", "match":"http://webinos.org/api/messaging"}},
            {"$":{"attr":"api-feature", "match":"http://webinos.org/api/actuator"}}
        ]
    };
    
policy.addRule("r10", "deny", condition, 0);
</code></pre>


### <a id="addSubject2_ref"></a> policy::addSubject ( subjectId, matches )

####Description
This method adds a subject to a policy

####Params

##### subjectId
The id of the subject to be removed

##### matches
The subject's match attributes. It is a JSON object wich contains an array of subject-match 

<pre><code>
{
    "subject-match" : [   
        {"$" : {"attr" : "id", "match" : "123456"}},
        {"$" : {"attr" : "author-key-cn", "match" : "google"}}
    ]
}
</code></pre>

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
var matches = 
    {
        "subject-match" : [   
            {"$" : {"attr" : "id", "match" : "123456"}},
            {"$" : {"attr" : "author-key-cn", "match" : "google"}}
        ]
    };
    
policy.addSubject("s10", matches);
</code></pre>


### <a id="removeRule_ref"></a> policy::removeRule ( ruleId )

####Description
This method remove a rule from a policy

####Params

##### ruleId
The id of the rule to be removed

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
policy.removeRule("r10");
</code></pre>



### <a id="removeSubject2_ref"></a> policy::removeSubject ( subjectId )

####Description
This method remove a subject from the policy

####Params

##### subjectId
The subject's id

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
policy.removeSubject("s10");
</code></pre>


### <a id="toJSONObject2_ref"></a> object policy::toJSONObject ( )

####Description
This method returns a JSON representation of the policy object

####Params

none

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
alert(JSON.stringify(policy.toJSONObject()));
</code></pre>


### <a id="updateRule_ref"></a> policy::updateRule ( ruleId, key, value )

####Description
This method updates a policy's rule

####Params

##### ruleId
The rule's id

##### key
key parameter can assume string values

* effect
* condition


##### value
The accepted values are:

If key is "effect" , value can assume one of ["permit", "deny", "prompt-oneshot", "prompt-session", prompt-blanket]

If key is "condition", value must be JSON object as the following: 

<pre><code> 
{
    "$":{"id":"cond1", "combine":"or"},
    "resource-match": [
        {"$":{"attr":"api-feature", "match":"http://webinos.org/api/nfc"}},
        {"$":{"attr":"api-feature", "match":"http://webinos.org/api/sensor"}}
    ]
}
</code></pre>

##### position
The rule's position

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");

policy.updateRule("r10", "effect", "prompt-session");

var updatedCondition = 
    {
        "$":{"id":"cond1", "combine":"or"},
        "resource-match": [
            {"$":{"attr":"api-feature", "match":"http://webinos.org/api/filesystem"}}
        ]
    };
policy.updateRule("r10", "condition", updatedCondition);

</code></pre>


### <a id="updateAttribute2_ref"></a> policy::updateAttribute (key, value)

####Description
This method updates a policy's attributes

####Params

#####key
key parameter can assume string values

* combine
* description

#####value
The accepted values are:

If key is "combine" , value can assume one of ["deny-overrides", "permit-overrides", "first-applicable"]

If key is "description", value is the new policy's description

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
policy.updateAttribute("combine", "first-applicable");
</code></pre>



### <a id="updateSubject2_ref"></a> policy::updateSubject ( subjectId, matches )

####Description
This method updates a policy's subject

####Params

##### subjectId
The subject's id

##### matches
The subject's match attributes which will replace the existent ones. It is a JSON object wich contains an array of subject-match:

<pre><code>
{
    "subject-match" : [   
        {"$" : {"attr" : "id", "match" : "123456"}},
        {"$" : {"attr" : "author-key-cn", "match" : "google"}}
    ]
}
</code></pre>

####Example
<pre><code>
var policy = aPolicySet.getPolicy("p1");
var updatedMatches = 
    {
        "subject-match" : [   
            {"$" : {"attr" : "id", "match" : "123456"}},
            {"$" : {"attr" : "author-key-cn", "match" : "samsung"}}
        ]
    };
    
policy.updateSubject("s10", updatedMatches);
</code></pre>
