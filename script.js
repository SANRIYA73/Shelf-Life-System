/*==================================================
 IQC SMART SHELF LIFE DECISION SYSTEM
 Part 1 - Master Data & Utility Functions
==================================================*/

// ---------------------------
// Global Variables
// ---------------------------

let currentRule = null;
let currentMfgDate = null;
let currentPrefix = "";

// ---------------------------
// DC Matrix Master
// ---------------------------

const materialRules = {

    // Electronic Components
    AC:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    CC:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    AT:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    AJ:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    AW:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    JF:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    FJ:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    JS:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    LM:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    QT:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    WI:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    CE:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    CN:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    FP:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    FM:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    FN:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    QC:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    CT:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},
    JH:{category:"Electronic Component",normal:2,trial:3.5,deviation:5},

    // Packing
    SG:{category:"Packing Material",normal:2,visual:5},
    ZA:{category:"Packing Material",normal:2,visual:5},

    // PCB
    SB:{category:"PCB",normal:0.5,use:1,bake:2,deviation:3.5},

    // Plastic
    UA:{category:"Plastic",normal:3,visual:4.5,deviation:6},
    SQ:{category:"Plastic",normal:3,visual:4.5,deviation:6},

    // Metal
    UC:{category:"Metal",normal:1,visual:2.5,deviation:4},
    UG:{category:"Metal",normal:1,visual:2.5,deviation:4},
    WC:{category:"Metal",normal:1,visual:2.5,deviation:4},

    // Label
    ZZ:{category:"Label",normal:1,visual:2.5,deviation:4},

    // Glue
    XD:{category:"Glue",normal:0.5,deviation:0.75},
    XW:{category:"Glue",normal:0.5,deviation:0.75},

    // Battery
    BA:{category:"Battery",normal:0.5,deviation:3.5}

};

// ---------------------------
// Date Type Change
// ---------------------------

function toggleInput(){

    let type=document.getElementById("dateType").value;

    document.getElementById("mfgDiv").style.display=
    type=="mfg" ? "block":"none";

    document.getElementById("dcDiv").style.display=
    type=="dc" ? "block":"none";

}

// ---------------------------
// Date Code (WWYY)
// ---------------------------

function dateCodeToDate(code){

    if(code.length!=4)
        return null;

    let week=parseInt(code.substring(0,2));
    let year=2000+parseInt(code.substring(2,4));

    let firstDay=new Date(year,0,1);

    firstDay.setDate(firstDay.getDate()+((week-1)*7));

    return firstDay;

}

// ---------------------------
// Add Years
// ---------------------------

function addYears(date,years){

    let d=new Date(date);

    d.setMonth(d.getMonth()+(years*12));

    return d;

}

// ---------------------------
// Format Date
// ---------------------------

function formatDate(date){

    let dd=String(date.getDate()).padStart(2,"0");
    let mm=String(date.getMonth()+1).padStart(2,"0");
    let yy=date.getFullYear();

    return dd+"/"+mm+"/"+yy;

}

// ---------------------------
// Material Age
// ---------------------------

function calculateAge(date){

    let today=new Date();

    let months=
    (today.getFullYear()-date.getFullYear())*12+
    (today.getMonth()-date.getMonth());

    let years=Math.floor(months/12);

    let remain=months%12;

    return{

        years:years,
        months:remain,
        total:years+(remain/12),

        text:years+" Years "+remain+" Months"

    };

}
/*==================================================
 PART 2 - Material Calculation
==================================================*/

function calculate(){

    // Reset
    document.getElementById("status").innerHTML="-";
    document.getElementById("action").innerHTML="-";
    document.getElementById("finalExpiry").innerHTML="-";

    // Part Number

    let part=document.getElementById("partNo").value
        .trim()
        .toUpperCase();

    if(part==""){

        alert("Please enter Part Number");

        return;

    }

    currentPrefix=part.substring(0,2);

    currentRule=materialRules[currentPrefix];

    if(currentRule==null){

        alert("Part Number Prefix Not Available");

        return;

    }

    // Manufacturing Date

    let type=document.getElementById("dateType").value;

    if(type=="mfg"){

        let input=document.getElementById("mfgDate").value;

        if(input==""){

            alert("Please Select Manufacturing Date");

            return;

        }

        currentMfgDate=new Date(input);

    }

    else{

        let dc=document.getElementById("dateCode").value;

        currentMfgDate=dateCodeToDate(dc);

        if(currentMfgDate==null){

            alert("Invalid Date Code");

            return;

        }

    }

    // Category

    document.getElementById("category").innerHTML=
        currentRule.category;

    // Age

    let age=calculateAge(currentMfgDate);

    document.getElementById("age").innerHTML=
        age.text;

    // Expiry Dates

    let normalExpiry=
        addYears(currentMfgDate,currentRule.normal);

    document.getElementById("normalExpiry").innerHTML=
        formatDate(normalExpiry);

    // Trial / Visual / Bake

    let trial="-";

    if(currentRule.trial){

        trial=formatDate(
            addYears(currentMfgDate,currentRule.trial)
        );

    }

    if(currentRule.visual){

        trial=formatDate(
            addYears(currentMfgDate,currentRule.visual)
        );

    }

    if(currentRule.use){

        trial=formatDate(
            addYears(currentMfgDate,currentRule.use)
        );

    }

    if(currentRule.bake){

        trial=formatDate(
            addYears(currentMfgDate,currentRule.bake)
        );

    }

    document.getElementById("trialExpiry").innerHTML=
        trial;

    // Deviation

    let deviation="-";

    if(currentRule.deviation){

        deviation=formatDate(
            addYears(currentMfgDate,currentRule.deviation)
        );

    }

    document.getElementById("deviationExpiry").innerHTML=
        deviation;

    // ----------------------------
    // Determine Current Stage
    // ----------------------------

    let stage="";

    if(currentRule.category=="Electronic Component"){

        if(age.total<=2)
            stage="NORMAL";

        else if(age.total<=3.5)
            stage="TRIAL";

        else if(age.total<=5)
            stage="DEVIATION";

        else
            stage="REJECT";

    }

    else if(currentRule.category=="Packing Material"){

        if(age.total<=2)
            stage="NORMAL";

        else if(age.total<=5)
            stage="VISUAL";

        else
            stage="REJECT";

    }

    else if(currentRule.category=="PCB"){

        if(age.total<=0.5)
            stage="NORMAL";

        else if(age.total<=1)
            stage="USE";

        else if(age.total<=2)
            stage="BAKE";

        else if(age.total<=3.5)
            stage="DEVIATION";

        else
            stage="REJECT";

    }

    else if(currentRule.category=="Plastic"){

        if(age.total<=3)
            stage="NORMAL";

        else if(age.total<=4.5)
            stage="VISUAL";

        else if(age.total<=6)
            stage="DEVIATION";

        else
            stage="REJECT";

    }

    else if(currentRule.category=="Metal" ||
            currentRule.category=="Label"){

        if(age.total<=1)
            stage="NORMAL";

        else if(age.total<=2.5)
            stage="VISUAL";

        else if(age.total<=4)
            stage="DEVIATION";

        else
            stage="REJECT";

    }

    else if(currentRule.category=="Glue"){

        if(age.total<=0.5)
            stage="NORMAL";

        else
            stage="DEVIATION";

        document.getElementById("receivedDiv").style.display="block";

    }

    else if(currentRule.category=="Battery"){

        if(age.total<=0.5)
            stage="NORMAL";

        else if(age.total<=3.5)
            stage="DEVIATION";

        else
            stage="REJECT";

    }

    document.getElementById("stage").innerHTML=stage;

    // Auto call final decision

    updateDecision();

}
/*==================================================
 PART 3 - Smart Decision Engine
==================================================*/

function updateDecision(){

    if(currentRule==null || currentMfgDate==null)
        return;

    let approval=document.getElementById("approval").value;
    let stage=document.getElementById("stage").innerHTML;

    let finalExpiry="-";
    let status="";
    let action="";

    let decision=document.getElementById("decisionCard");

    decision.className="statusCard";

    // ---------------- NORMAL ----------------

    if(stage=="NORMAL"){

        finalExpiry=formatDate(
            addYears(currentMfgDate,currentRule.normal)
        );

        status="VALID";

        action="Material can be used";

        decision.innerHTML="🟢 NORMAL USE";

        decision.classList.add("green");

    }

    // ---------------- TRIAL ----------------

    else if(stage=="TRIAL"){

        if(approval=="trial"){

            finalExpiry=formatDate(
                addYears(currentMfgDate,currentRule.trial)
            );

            status="VALID";

            action="Use with Trial Validation";

            decision.innerHTML="🟡 TRIAL VALIDATION APPROVED";

            decision.classList.add("yellow");

        }
        else{

            finalExpiry=formatDate(
                addYears(currentMfgDate,currentRule.normal)
            );

            status="EXPIRED";

            action="Trial Validation Required";

            decision.innerHTML="⚠ TRIAL VALIDATION REQUIRED";

            decision.classList.add("yellow");

        }

    }

    // ---------------- VISUAL ----------------

    else if(stage=="VISUAL"){

        if(approval=="trial"){

            finalExpiry=formatDate(
                addYears(currentMfgDate,currentRule.visual)
            );

            status="VALID";

            action="Visual Inspection OK";

            decision.innerHTML="🟠 VISUAL INSPECTION";

            decision.classList.add("orange");

        }
        else{

            status="EXPIRED";

            action="Visual Inspection Required";

            decision.innerHTML="⚠ VISUAL INSPECTION REQUIRED";

            decision.classList.add("orange");

        }

    }

    // ---------------- USE ----------------

    else if(stage=="USE"){

        finalExpiry=formatDate(
            addYears(currentMfgDate,currentRule.use)
        );

        status="VALID";

        action="Material Can Be Used";

        decision.innerHTML="🟢 USE MATERIAL";

        decision.classList.add("green");

    }

    // ---------------- BAKE ----------------

    else if(stage=="BAKE"){

        if(approval=="trial"){

            finalExpiry=formatDate(
                addYears(currentMfgDate,currentRule.bake)
            );

            status="VALID";

            action="Bake PCB Before Use";

            decision.innerHTML="🟣 BAKE REQUIRED";

            decision.classList.add("purple");

        }
        else{

            status="EXPIRED";

            action="Bake Approval Required";

            decision.innerHTML="⚠ BAKE REQUIRED";

            decision.classList.add("purple");

        }

    }

    // ---------------- DEVIATION ----------------

    else if(stage=="DEVIATION"){

        if(approval=="deviation"){

            finalExpiry=formatDate(
                addYears(currentMfgDate,currentRule.deviation)
            );

            status="VALID";

            action="Use with Deviation";

            decision.innerHTML="🔵 DEVIATION APPROVED";

            decision.classList.add("blue");

        }
        else{

            status="EXPIRED";

            action="Deviation Approval Required";

            decision.innerHTML="⚠ DEVIATION REQUIRED";

            decision.classList.add("blue");

        }

    }

    // ---------------- REJECT ----------------

    else{

        status="REJECT";

        action="Material Shelf Life Exceeded";

        finalExpiry="-";

        decision.innerHTML="🔴 REJECT MATERIAL";

        decision.classList.add("red");

    }

    // ---------------- GLUE ----------------

    if(currentRule.category=="Glue"){

        if(stage=="DEVIATION"){

            let received=document.getElementById("receivedDate").value;

            if(received!=""){

                let r=new Date(received);

                r.setMonth(r.getMonth()+3);

                finalExpiry=formatDate(r);

            }

        }

    }

    // ---------------- Display ----------------

    document.getElementById("status").innerHTML=status;

    document.getElementById("action").innerHTML=action;

    document.getElementById("finalExpiry").innerHTML=finalExpiry;

}
/*==================================================
 PART 4 - Smart UI & Kaizen Features
==================================================*/

// ---------------------------
// Enable / Disable Approval
// ---------------------------

function setApprovalOptions(stage){

    let approval=document.getElementById("approval");

    approval.disabled=false;

    approval.value="none";

    switch(stage){

        case "NORMAL":

            approval.disabled=true;

            break;

        case "TRIAL":

            approval.innerHTML=`
                <option value="none">None</option>
                <option value="trial">Trial Validation Available</option>
            `;
            break;

        case "VISUAL":

            approval.innerHTML=`
                <option value="none">None</option>
                <option value="trial">Visual Inspection OK</option>
            `;
            break;

        case "USE":

            approval.disabled=true;

            break;

        case "BAKE":

            approval.innerHTML=`
                <option value="none">None</option>
                <option value="trial">Bake Completed</option>
            `;
            break;

        case "DEVIATION":

            approval.innerHTML=`
                <option value="none">None</option>
                <option value="deviation">Deviation Approved</option>
            `;
            break;

        case "REJECT":

            approval.disabled=true;

            break;

    }

}

// ---------------------------
// Status Colour
// ---------------------------

function paintStatus(){

    let status=document.getElementById("status");

    status.className="";

    switch(status.innerHTML){

        case "VALID":

            status.classList.add("ok");

            break;

        case "EXPIRED":

            status.classList.add("trial");

            break;

        case "REJECT":

            status.classList.add("reject");

            break;

    }

}

// ---------------------------
// Reset
// ---------------------------

function clearResult(){

    document.getElementById("category").innerHTML="-";

    document.getElementById("age").innerHTML="-";

    document.getElementById("normalExpiry").innerHTML="-";

    document.getElementById("trialExpiry").innerHTML="-";

    document.getElementById("deviationExpiry").innerHTML="-";

    document.getElementById("stage").innerHTML="-";

    document.getElementById("status").innerHTML="-";

    document.getElementById("action").innerHTML="-";

    document.getElementById("finalExpiry").innerHTML="-";

    document.getElementById("decisionCard").innerHTML=
    "Waiting for Verification...";

    document.getElementById("decisionCard").className="statusCard";

}

// ---------------------------
// Auto Uppercase
// ---------------------------

document.getElementById("partNo").addEventListener("keyup",function(){

    this.value=this.value.toUpperCase();

});

// ---------------------------
// Enter Key
// ---------------------------

document.getElementById("partNo").addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        calculate();

    }

});

// ---------------------------
// Auto Approval
// ---------------------------

document.getElementById("approval").addEventListener("change",function(){

    updateDecision();

    paintStatus();

});

// ---------------------------
// Auto Stage
// ---------------------------

const oldCalculate=calculate;

calculate=function(){

    oldCalculate();

    let stage=document.getElementById("stage").innerHTML;

    setApprovalOptions(stage);

    paintStatus();

}

// ---------------------------
// Version
// ---------------------------

console.log("IQC Smart Shelf Life Decision System v1.0");