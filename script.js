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

let uniqueNames = [];
let uniqueMaps = {};
let uniqueNamesElems = {};
for(var i = 0; i < data.TestData.length; i++) {
    let bareName = data.TestData[i].Name.replace(/ \([\w \d]+\)/, "");

    if(!uniqueMaps[bareName]) uniqueMaps[bareName] = [];
    uniqueNames.push(bareName);
    uniqueMaps[bareName].push(bareName);
}

for(var i = 0; i < data.TestData.length; i++) {
    if(data.TestData[i].CheckRate == "86400") {
        data.TestData.push(data.TestData.splice(i, 1)[0]);
    }
}

for(var i = 0; i < data.TestData.length; i++) {
    let bareName = data.TestData[i].Name.replace(/ \([\w \d]+\)/, "");

    let thisTest = data.TestData[i];
    let testElem = document.createElement("div");
    testElem.classList.add("status");
    let testDisabled = false;
    
    if(thisTest.CheckRate == "86400") {
        testDisabled = true;
        testElem.classList.add("disabled");
    }
    
    let testHead = document.createElement("div");
    testHead.classList.add("head");

    let testTitle = document.createElement("h3");
    testTitle.textContent = bareName;

    let testTitleAndStatusSeperator = document.createElement("span");
    testTitleAndStatusSeperator.innerHTML = "&nbsp;-&nbsp;";

    let testStatus = document.createElement("span");
    if(thisTest.Status == "Up") testStatus.textContent = "Operational";
    else testStatus.textContent = "Outage";
    testStatus.classList.add(thisTest.Status.toLowerCase());
    if(testDisabled) testStatus.textContent = "Not Online";

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

    

    if(uniqueMaps[bareName].length > 1) {
        let testSubheading = document.createElement("h4");
        testSubheading.textContent = (/ \(([\w \d]+)\)/).exec(data.TestData[i].Name)[1] + " - ";

        let testSubheadingState = document.createElement("span");

        if(thisTest.Status == "Up") testSubheadingState.textContent = "Operational";
        else testSubheadingState.textContent = "Outage";
        testSubheadingState.classList.add(thisTest.Status.toLowerCase());

        if(testDisabled) testSubheadingState.textContent = "Not Online";

        testSubheading.appendChild(testSubheadingState);
        testBody.appendChild(testSubheading);

        testBody.classList.add("level-2");
    }
    
    if(!testDisabled) {
        testBody.appendChild(testGraph);
    } else {
        let disabledPlaceholder = document.createElement("div");
        disabledPlaceholder.classList.add("disabled-placeholder");

        testBody.appendChild(disabledPlaceholder);

        testBody.classList.add("disabled");
    }

    if(uniqueMaps[bareName].length > 1 && uniqueNamesElems[bareName]) {
        uniqueNamesElems[bareName].appendChild(testBody);
    }
        
    

    if(!uniqueNamesElems[bareName]) {
        testElem.appendChild(testBody);
        
        stati.appendChild(testElem);
    }

    uniqueNamesElems[bareName] = testElem;
}

let announceHeader = document.createElement("h2");
announceHeader.textContent = "Status Notif:";
main.appendChild(announceHeader);

let announce = document.createElement("p");
announce.id = "announce"
announce.innerHTML = data.Announce;
main.appendChild(announce);