var gameList; // Holds contents of index.json on supported games
var currentGameIndex = -1; // Holds index of current game within gameList
var gameData; // Holds contents of game-specific json

var gameStylesheet = document.getElementById("gameStylesheet");
var tableDynamicStylesheet = document.getElementById("dynamicStylesheet");

var contentTable = document.getElementById("contentTable"); // Table element for fusion table

var optionGameSelect = document.getElementById("optionGameSelect"); // Game selection dropdown element

optionGameSelect.addEventListener('change', (event) => { // Monitor game selection for user input
	currentGameIndex = optionGameSelect.selectedIndex;
	location.hash = (gameList.games[currentGameIndex].identifier);
	loadGameData();
});

var optionHighlightMatchesManual = document.getElementById("optionHighlightMatchesManual");

optionHighlightMatchesManual.addEventListener('change', (event) => {
	if(optionHighlightMatchesManual.selectedIndex > 0){
		let arcanaNum = optionHighlightMatchesManual.selectedIndex-1;
		tableDynamicStylesheet.sheet.cssRules[7].selectorText = `td.arcana${arcanaNum}`;
	} else {
		tableDynamicStylesheet.sheet.cssRules[7].selectorText = `td.arcanamatch2`;
	}
});

window.onhashchange = function(event){ // Monitor page hash for user input
	if(currentGameIndex > -1){
		if(location.hash.substring(1) == gameList.games[currentGameIndex].identifier){
			return;
		}
	}
	for(const [index, game] of gameList.games.entries()){
		if(game.identifier == location.hash.substring(1)){
			currentGameIndex = index;
			break;
		}
	}
	loadGameData();
};

var mouseoverFrozen = false;

var optionHighlightMatchesAutoCheckbox = document.getElementById("optionHighlightMatchesAuto");
var optionHighlightMatchesAuto = optionHighlightMatchesAutoCheckbox.checked;
optionHighlightMatchesAutoCheckbox.addEventListener('change', (event) => {
	optionHighlightMatchesAuto = optionHighlightMatchesAutoCheckbox.checked;
});

var optionHighlightSameColAndRowCheckbox = document.getElementById("optionHighlightSameColAndRow");
var optionHighlightSameColAndRow = optionHighlightSameColAndRowCheckbox.checked;
optionHighlightSameColAndRowCheckbox.addEventListener('change', (event) => {
	optionHighlightSameColAndRow = optionHighlightSameColAndRowCheckbox.checked;
});

var optionHighlightTriangleMatchesCheckbox = document.getElementById("optionHighlightTriangleMatches");
var optionHighlightTriangleMatches = optionHighlightTriangleMatchesCheckbox.checked;
optionHighlightTriangleMatchesCheckbox.addEventListener('change', (event) => {
	optionHighlightTriangleMatches = optionHighlightTriangleMatchesCheckbox.checked;
});

var optionHideTriangleDataCheckbox = document.getElementById("optionHideTriangleData");
var optionHideTriangleData = optionHideTriangleDataCheckbox.checked;
optionHideTriangleDataCheckbox.addEventListener('change', (event) => {
	optionHideTriangleData = optionHideTriangleDataCheckbox.checked;
	if(optionHideTriangleData){
		tableDynamicStylesheet.sheet.cssRules[8].selectorText = `td.triangle`;
	} else {
		tableDynamicStylesheet.sheet.cssRules[8].selectorText = `td.spooky`;
	}
});

// Initial setup run when page finishes loading
async function init(){
	// Fetch contents of index.json
	let response = await fetch('./res/json/index.json');
	// Populate gameList with results
	gameList = await response.json();

	// Set up game selection
	populateGameSelects();

	// Automatically select game if the url contains a valid hash
	if(location.hash){
		for(const [index, game] of gameList.games.entries()){
			if(game.identifier == location.hash.substring(1)){
				currentGameIndex = index;
				break;
			}
		}
		if(currentGameIndex > -1){
			loadGameData();
		}
	}

	// 
}

// Populate optionGameSelect and fancyGameSelect with the contents of gameList
function populateGameSelects(){
	let fancyGameSelect = document.getElementById("fancyGameSelect");
	for(const [index, game] of gameList.games.entries()){
		// populate optionGameSelect
		let option = document.createElement("option");
		option.value = index;
		option.text = game.title;
		optionGameSelect.add(option);
		// populate fancyGameSelect
		let listItem = document.createElement("li");
		let link = document.createElement("a");
		listItem.appendChild(link);
		link.href = (`#${game.identifier}`);
		link.text = game.title;
		fancyGameSelect.appendChild(listItem);
		// style fancyGameSelect
		gameStylesheet.sheet.insertRule(`nav > ul > li > a[href="#${game.identifier}"] {background-image:url("../img/${game.identifier}.png");background-position:center;background-repeat:no-repeat;background-color:${game.bgcolor};color:${game.textcolor};}`);
	}
}

// Load data for specific game
async function loadGameData(){
	// Fetch game-specific json
	let response = await fetch(`./res/json/${gameList.games[currentGameIndex].identifier}.json`);
	// Populate gameData with results
	gameData = await response.json();
	// Ensure game select dropdown matches page hash
	optionGameSelect.selectedIndex = currentGameIndex;
	// Load game-specific CSS
	gameStylesheet.href = (`res/css/${gameList.games[currentGameIndex].identifier}.css`);
	// Update game title on page
	updateGameTitle();
	// Empty and rebuild main table
	rebuildTable();
}

// Updates page header to match the currently selected game
function updateGameTitle(){
	let header = document.getElementById("gameTitle");
	header.textContent = gameList.games[currentGameIndex].title;
}

// Empties the table if it already contains anything and rebuilds it based on the currently selected game
function rebuildTable(){
	while(contentTable.firstChild){
		contentTable.removeChild(contentTable.firstChild);
	}
	buildHeaderRow(-1);
	for (const [index, string] of gameData.strings.entries()){
		buildRow(index);
	}
	buildHeaderRow(gameData.strings.length);
	rebuildArcanaSelect();
}

function buildHeaderRow(rowIndex){
	let row = contentTable.insertRow();
	row.appendChild(buildHeaderCell(rowIndex,-1));
	for (const [index, string] of gameData.strings.entries()){
		row.appendChild(buildHeaderCell(rowIndex,index));
	}
	row.appendChild(buildHeaderCell(rowIndex,gameData.strings.length));
}

function buildHeaderCell(rowIndex, colIndex){
	let cellElement;
	cellElement = document.createElement("th");
	cellElement.classList.add(`row${rowIndex}`);
	cellElement.classList.add(`col${colIndex}`);
	if(rowIndex < 0 || rowIndex >= gameData.strings.length){
		cellElement.classList.add(`arcana${colIndex}`);
		if(!(colIndex < 0 || colIndex >= gameData.strings.length)){
			cellElement.appendChild(document.createTextNode(gameData.strings[colIndex]));
		}
	} else {
		cellElement.classList.add(`arcana${rowIndex}`);
		cellElement.appendChild(document.createTextNode(gameData.strings[rowIndex]));
	}
	return cellElement;
}

function buildRow(rowIndex){
	let row = contentTable.insertRow();
	row.appendChild(buildHeaderCell(rowIndex,-1));
	for (const [index, string] of gameData.strings.entries()){
		let cell = buildCell(rowIndex, index);
		row.appendChild(cell);
	}
	row.appendChild(buildHeaderCell(rowIndex,gameData.strings.length));
}

function buildCell(rowIndex, colIndex){
	let cellElement;
	cellElement = document.createElement("td");
	cellElement.classList.add(`row${rowIndex}`);
	cellElement.classList.add(`col${colIndex}`);
	if(gameData.fusions[rowIndex][colIndex] == -1){
		cellElement.classList.add("invalid");
	} else {
		cellElement.classList.add(`arcana${gameData.fusions[rowIndex][colIndex]}`);
		cellElement.appendChild(document.createTextNode(gameData.strings[gameData.fusions[rowIndex][colIndex]]));
	}
	if(colIndex<rowIndex){
		cellElement.classList.add("triangle");
	} else if (colIndex==rowIndex) {
		cellElement.classList.add("same");
	} else {
		cellElement.classList.add("normal");
	}
	return cellElement;
}

// Empties the arcana selection dropdown in the options and rebuilds it based on the currently selected game
function rebuildArcanaSelect(){
	while(optionHighlightMatchesManual.length>1){
		optionHighlightMatchesManual.remove(1);
	}
	for(const [index, string] of gameData.strings.entries()){
		let option = document.createElement("option");
		option.value = index;
		option.text = string;
		optionHighlightMatchesManual.add(option);
	}
}

contentTable.onmouseover = function(event){
	if(mouseoverFrozen) return;
	let target = event.target;
	if(!target || !(event.target.nodeName == "TD" || event.target.nodeName == "TH")) return;
	let row = target.classList.item(0);
	let column = target.classList.item(1);
	let arcana = target.classList.item(2);
	let fusionType = target.classList.item(3);
	let highlightTriangleMatches = (gameData.triangle && fusionType == "normal" && optionHighlightTriangleMatches);
	if(!(arcana == "invalid")){
		if(optionHighlightMatchesAuto){
			tableDynamicStylesheet.sheet.cssRules[6].selectorText = `td.${arcana}`;
		}
		if(highlightTriangleMatches){
			let arcanaNum = arcana.substring(6);
			tableDynamicStylesheet.sheet.cssRules[2].selectorText = `td.same.${arcana}`;
			tableDynamicStylesheet.sheet.cssRules[3].selectorText = `td.triangle.row${arcanaNum}, td.triangle.col${arcanaNum}`;
			tableDynamicStylesheet.sheet.cssRules[5].selectorText = `td.triangle.invalid.row${arcanaNum}, td.triangle.invalid.col${arcanaNum}`;
		}
	}
	if(optionHighlightSameColAndRow){
		tableDynamicStylesheet.sheet.cssRules[0].selectorText = `td.normal.${row}, td.normal.${column}`;
		tableDynamicStylesheet.sheet.cssRules[4].selectorText = `td.normal.invalid.${row}, td.normal.invalid.${column}`;
		tableDynamicStylesheet.sheet.cssRules[1].selectorText = `td.same.${row}, td.same.${column}`;
		if(!highlightTriangleMatches){
			tableDynamicStylesheet.sheet.cssRules[3].selectorText = `td.triangle.${row}, td.triangle.${column}`;
			tableDynamicStylesheet.sheet.cssRules[5].selectorText = `td.triangle.invalid.${row}, td.triangle.invalid.${column}`;
		}
	}
};

contentTable.onmouseout = function(event) {
	if(mouseoverFrozen) return;
	let target = event.target;
	if(!target || !(event.target.nodeName == "TD" || event.target.nodeName == "TH")) return;
	tableDynamicStylesheet.sheet.cssRules[0].selectorText = `td.normal.rowmatch, td.normal.colmatch`;
	tableDynamicStylesheet.sheet.cssRules[1].selectorText = `td.same.rowmatch, td.same.colmatch`;
	tableDynamicStylesheet.sheet.cssRules[2].selectorText = `td.same.arcanamatch`;
	tableDynamicStylesheet.sheet.cssRules[3].selectorText = `td.triangle.rowmatch, td.triangle.colmatch`;
	tableDynamicStylesheet.sheet.cssRules[4].selectorText = `td.normal.invalid.rowmatch, td.normal.invalid.colmatch`;
	tableDynamicStylesheet.sheet.cssRules[5].selectorText = `td.triangle.invalid.rowmatch, td.triangle.invalid.colmatch`;
	tableDynamicStylesheet.sheet.cssRules[6].selectorText = `td.arcanamatch1`;
};

contentTable.onclick = function(event) {
	mouseoverFrozen = !mouseoverFrozen;
};

init();