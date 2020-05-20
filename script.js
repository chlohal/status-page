let header = document.querySelector("header");

let headerImg = document.createElement("img");
headerImg.src = data.LogoImage;
header.appendChild(headerImg);

let headerH1 = document.createElement("h1");
headerH1.textContent = data.Title;
header.appendChild(headerH1);

let main = document.querySelector("main");

let statiHeader = document.createElement("h2");
statiHeader.textContent = "System Status:";
main.appendChild(statiHeader);

let stati = document.createElement("div");
stati.id = "stati";
main.appendChild(stati);

let uniqueMaps = {};
let uniqueNamesElems = {};

for(var i = 0; i < data.TestData.length; i++) {
    let bareName = getBareName(data.TestData[i].Name);

    if(!uniqueMaps[bareName]) uniqueMaps[bareName] = [];
    uniqueMaps[bareName].push(bareName);
}

//move disabled and in-maintenance tests to the bottom
for(var i = 0; i < data.TestData.length; i++) {
    if(getTestCodeFromObj(data.TestData[i]) == 2 ||
       getTestCodeFromObj(data.TestData[i]) == 3) {
        console.log(data.TestData[i])
        data.TestData.push(data.TestData.splice(i, 1)[0]);
    }
}

for(var i = 0; i < data.TestData.length; i++) {
    let bareName = getBareName(data.TestData[i].Name);

    let thisTest = data.TestData[i];
    let testElem = document.createElement("div");
    testElem.classList.add("status");
    let testDisabled = false, testInMaintenance = false;

    let testCode = getTestCodeFromObj(thisTest);
    
    if(testCode == 2) {
        testDisabled = true;
    } else if(testCode == 3) {
        testInMaintenance = true;
    }
    
    let testHead = document.createElement("div");
    testHead.classList.add("head");

    let testTitle = document.createElement("h3");
    testTitle.textContent = bareName;

    let testTitleAndStatusSeperator = document.createElement("span");
    testTitleAndStatusSeperator.innerHTML = "&nbsp;-&nbsp;";

    let testStatus = document.createElement("span");
    testStatus.textContent = testCodeDescription(testCode);
    testStatus.classList.add(thisTest.Status.toLowerCase());
    testStatus.classList.add("status-display");
    if(testDisabled) testStatus.textContent = "Not Online";

    testElem.setAttribute("data-test-state",testCode);
    testElem.classList.add(testCodeClassName(testCode));

    let testGraph = document.createElement("ul");
    for(var j = 0; j < thisTest.Uptime.length; j++) {
        let testUptimeNode = document.createElement("li");
        testUptimeNode.style.backgroundColor = `hsl(${Math.floor(thisTest.Uptime[j] / 100 * 120)}, 60%, 50%)`; 
        testUptimeNode.setAttribute("point",`${data.Dates[j]} - ${thisTest.Uptime[j]}%`)
        testGraph.appendChild(testUptimeNode);
    }
    testHead.appendChild(testTitle);
    testHead.appendChild(testTitleAndStatusSeperator);
    testHead.appendChild(testStatus);

    testElem.appendChild(testHead);

    let testBody = document.createElement("div");
    testBody.classList.add("test-body");
    testBody.classList.add(testCodeClassName(testCode));

    testBody.setAttribute("data-test-state",testCode);



    if(uniqueMaps[bareName].length > 1) {
        let testSubheading = document.createElement("h4");
        testSubheading.textContent = (/ \(([\w \d]+)\)/).exec(data.TestData[i].Name)[1] + " - ";

        let testSubheadingState = document.createElement("span");

        testSubheadingState.textContent = testCodeDescription(testCode);
        testSubheadingState.classList.add("status-display");

        testSubheading.appendChild(testSubheadingState);
        testBody.appendChild(testSubheading);

        testBody.classList.add("level-2");
    }
    
    if(!testDisabled && !testInMaintenance) {
        testBody.appendChild(testGraph);
    } else {
        let graphPlaceholder = document.createElement("div");
        if(testDisabled) {
            graphPlaceholder.classList.add("disabled-placeholder");
            testBody.classList.add("disabled");
        }
        if(testInMaintenance) {
            graphPlaceholder.classList.add("maintenance-placeholder");
            testBody.classList.add("maintenance");
        }

        testBody.appendChild(graphPlaceholder);
    }

    if(uniqueMaps[bareName].length > 1 && uniqueNamesElems[bareName]) {
        let testMainCurrentState = uniqueNamesElems[bareName].getAttribute("data-test-state");
        let thisTestSubtestCurrentState = testBody.getAttribute("data-test-state");

        let newMainTestCode = testCodeCombination(testMainCurrentState,thisTestSubtestCurrentState);

        console.log(testMainCurrentState,thisTestSubtestCurrentState, newMainTestCode);
        
        uniqueNamesElems[bareName].setAttribute("data-test-state",newMainTestCode);

        let statusTextElem = uniqueNamesElems[bareName].querySelector(".head span.status-display");

        if(statusTextElem)  {
            statusTextElem.textContent = testCodeDescription(newMainTestCode);
            uniqueNamesElems[bareName].classList.remove(testCodeClassName(testMainCurrentState));
            uniqueNamesElems[bareName].classList.add(testCodeClassName(newMainTestCode));
        }
            
        uniqueNamesElems[bareName].appendChild(testBody);
        uniqueNamesElems[bareName].classList.add("has-level-2")
    }
        
    

    if(!uniqueNamesElems[bareName]) {
        testElem.appendChild(testBody);
        
        stati.appendChild(testElem);

        uniqueNamesElems[bareName] = testElem;
    }

    
}

function testCodeCombination(num1,num2) {
    if(num1 == num2) return num2;

    let normalizedCombo = num1>num2 ? ""+num1+num2 : ""+num2+num1;
    
    let codeMap = {
        "10": 4,
        "21": 1,
        "30": 0,
        "31": 3,
        "32": 2,
        "40": 4,
        "41": 4,
        "42": 4,
        "43": 4,
    };

    return codeMap[normalizedCombo];
}

function testCodeClassName(code) {
    return testCodeDescription(code).replace(/\s/g,"-").toLowerCase();
}

function getBareName(encodedName) {
    return encodedName.replace(/ \([\w \d]+\)/, "").replace(/^\w+::/, "");
}

function testCodeDescription(code) {
    code = code + "";
    let descMap = {
        "0": "Outage",
        "1": "Operational",
        "2": "Not Online",
        "3": "In Maintenance",
        "4": "Partial Outage"
    }

    return descMap[code] || `Unknown Status ${code}`;
}

function getTestCodeFromObj(thisTest) {
    if(thisTest.Name.startsWith("NO::") || thisTest.CheckRate == "86400") {
        return 2;
    } else if(thisTest.Name.startsWith("IM::")) {
        return 3;
    } else if(thisTest.Status == "Up") {
        return 1;
    } else if(thisTest.Status == "Down") {
        return 0;
    } else {
        return -1;
    }
}

let announceHeader = document.createElement("h2");
announceHeader.textContent = "Status Log:";
main.appendChild(announceHeader);

let announce = document.createElement("p");
announce.id = "announce"
announce.innerHTML = data.Announce;
main.appendChild(announce);