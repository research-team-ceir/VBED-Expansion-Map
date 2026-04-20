// #region SETUP
d3.select("body")
    .append("div")
    .attr("id", "vbed-map")
    .style("display", "grid")
    .style("max-width", "666px")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("font-family", "'Source Serif 4', serif");

d3.select("#vbed-map")
    .append("h1")
    .text("Options to Vote Before Election Day, 2000-2026")

var yearList = [
    {option: "All Years",
        index: 0,
        years: [{year: 2000}, {year: 2002}, {year: 2004}, {year: 2006},
            {year: 2008}, {year: 2010}, {year: 2012}, {year: 2014}, {year: 2016}, 
            {year: 2018}, {year: 2020}, {year: 2022}, {year: 2024}, {year: 2026}]},
    {option: "Midterm Years",
        index: 1,
        years: [{year: 2002}, {year: 2006}, {year: 2010},
            {year: 2014}, {year: 2018}, {year: 2022}, {year: 2026}]},
    {option: "Presidential Years",
        index: 2,
        years: [{year: 2000}, {year: 2004}, {year: 2008},
            {year: 2012}, {year: 2016}, {year: 2020}, {year: 2024}]}
]

var width = 666;
var height = 750;

var svg = d3.select("#vbed-map")
  .append("svg")
  .attr("width", "100%")
  .attr("viewBox", "0 0 675 750");

var colorScale = d3.scaleOrdinal()
    .domain([4, 3, 2, 1])
    .range(["#3b9171", "#3b9171","#efc55b", "#ef7f4d"]);

var abbColorScale = d3.scaleOrdinal()
    .domain([4, 3, 2, 1])
    .range(["#ffffff", "#ffffff","#000000", "#000000"]);

var xScale = d3.scaleLinear()
    .domain([2000, 2026])
    .range([65, width-20]);

var policyScale = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range([
        "Early in-person and mail voting: ",
        "Early in-person voting: ",
        "No early in-person or mail voting: "
    ]);

var listScale = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range(["Green.png", "Yellow.png", "Red.png"])

var bodyWidth = document.getElementsByTagName("body")[0].getBoundingClientRect().width;

// #endregion

// #region LEGEND

var legend = svg.append("g")
    .attr("id", "legend")

legend
    .selectAll("rect")
    .data([3, 2, 1])
    .enter()
    .append("rect")
        .attr("fill", (d, i) => colorScale(d))
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 20)
        .attr("y", (d, i) => i * 45 + 600)

legendText = legend.append("g")
    .attr("id", "legend-text")
    .selectAll("text")
    .data([
        {
            text:"Options to vote early in-person and by mail",
            subtitle: "available to all voters."
        },
        {
            text: "Option to vote early in-person available to all",
            subtitle: "voters. Eligible reason required to vote by mail."
        },
        {
            text:"No early in-person voting option available to all",
            subtitle: "voters. Eligible reason required to vote by mail."
        }
    ])
    .enter()
    .append("text")
        .attr("x", 45)
        .attr("y", (d, i) => i * 45 + 605)
        .attr("font-size", "11pt")

legendText.append("tspan")
    .text(d => d.text);

legendText.append("tspan")
    .text(d => d.subtitle)
    .attr("x", 45)
    .attr("dy", "1.2em");

covidLegend = legend.append("text")
    .attr("id", "legend-covid")
    .text("*Indicates a temporary COVID-19 policy expansion due to the COVID-19 emergency.")
    .attr("x", 45)
    .attr("y", 605 - 30)
    .attr("opacity", 0)
    .attr("font-size", "10pt")

// #endregion

// #region SELECTION MENU

var selectionBarSelected = false; // tracks whether the dropdown menu is down
var selectionIndex = 0; // tracks which option is selected

// main selection bar
var selectionContainer = svg.append("g")
    .attr("id", "selection-container")

var selectionBar = selectionContainer.append("rect")
    .attr("width", 150)
    .attr("height", 25)
    .attr("x", (width-150) / 2)
    .attr("y", 65)
    .attr("fill", "#ebebeb")
    .on("mouseover", function() {
        d3.select(this)
            .style("stroke", "#243a76")
            .style("stroke-width", 0.7)
            .style("cursor", "pointer");
    })
    .on("mouseout", function() {
        d3.select(this)
            .style("stroke-width", 0);
    })
    .on("click", function() {
        if (!selectionBarSelected) {
            selections.attr("opacity", 1)
            selectionsText.attr("opacity", 1)
            selectionBarSelected = true;
            selectionTri.attr("fill", "#243a76")
        } else {
            selections.attr("opacity", 0)
            selectionsText.attr("opacity", 0)
            selectionBarSelected = false;
            selectionTri.attr("fill", "#dbdbdb")
        }
    })

// triangle on selection bar to indicate to click
var selectionTri = selectionContainer.append("path")
    .attr("d", "M1, 1 L1, 3 L2, 3 L1, 2")
    .attr("transform", "translate(" + ((width-150) / 2 + 100) + ", 65) scale(12) rotate(-45)")
    .attr("fill", "#dbdbdb")
    .style("pointer-events", "none");

var selectionBarText = selectionContainer.append("text")
    .text("All Years")
    .attr("fill", "black")
    .attr("x", (width-150) / 2 + 5)
    .attr("y", 82)
    .attr("font-size", "14px");

var selectionOptions = selectionContainer.append("g")
    .attr("id", "selection-options")

var selections = selectionOptions
    .selectAll("rect")
    .data(yearList)
    .enter()
    .append("rect")
        .attr("width", 150)
        .attr("height", 25)
        .attr("x", (width-150) / 2)
        .attr("y", (d, i) => (i + 1) * 25 + 65)
        .attr("fill", "#ebebeb")
        .attr("opacity", 0)
    .on("mouseover", function() {
        if (!selectionBarSelected) {
            d3.select(this)
                .style("cursor", "default");
        } else if (selectionBarSelected) {
            d3.select(this)
                .style("stroke", "#243a76")
                .style("stroke-width", 0.7)
                .style("cursor", "pointer");
        }
    })
    .on("mouseout", function() {
        d3.select(this)
            .style("stroke-width", 0);
    });

var selectionsText = selectionOptions
    .selectAll("text")
    .data(yearList)
    .enter()
    .append("text")
    .text(d => d.option)
    .attr("y", (d, i) => (i + 1) * 25 + 82)
    .attr("x", (width-150) / 2 + 8)
    .attr("fill", "black")
    .attr("opacity", 0)
    .attr("font-size", "14px");

// #endregion

// #region YEAR TIMELINE
var yearTimeline = svg.append("g")
    .attr("id", "year-timeline")

// rect connecting years
var yearRect = yearTimeline
    .append("rect")
    .attr("id", d => "year-rect")
    .attr("x", d => xScale(2000))
    .attr("y", 20)
    .attr("width", d => xScale(2026) - xScale(2000))
    .attr("height", 2)
    .attr("fill", "#bebebe");

// circles for each year 
var yearOptions = yearTimeline
    .append("g")
    .attr("id", "year-options")
    .selectAll("circle")
    .data(yearList[0].years)
    .enter()
    .append("circle")
        .attr("id", d => "circle-" + d.year)
        .attr("cx", d => xScale(d.year))
        .attr("cy", 20)
        .attr("r", 8)
        .style("fill", "#bebebe")
        .classed("presidential", d => (d.year - 2000) % 4 == 0)
        .classed("midterm", d => (d.year - 2000) % 4 != 0);

// add text below circles
var yearLabels = yearTimeline
    .append("g")
    .attr("id", "year-labels")
    .selectAll("text")
    .data(yearList[0].years)
    .enter()
    .append("text")
        .text(d => d.year)
        .attr("x", d => xScale(d.year))
        .attr("y", 45)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .classed("presidential-label", d => (d.year - 2000) % 4 == 0)
        .classed("midterm-label", d => (d.year - 2000) % 4 != 0);

let yearSelect = 0; // tracks year option selected (all, presidential, midterm)

// #endregion

// #region PLAY AND PAUSE BUTTONS
var playButton = svg.append("g")
    .attr("id", "play-button")
    .append("path")
        .attr("id", "play")
        .attr("d", "M0,0 L8,5 L0,10 L0,0")
        .attr("fill", "#243a76")
        .attr("transform", "translate(10, 10.1) scale(1.8)")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .style("stroke", "#243a76")
            .style("stroke-width", 0.3)
            .style("cursor", "pointer");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .style("stroke-width", 0);
    });

// pause button
var pauseButton = svg.append("g")
    .attr("id", "pause-button")
    .append("path")
        .attr("id", "pause")
        .attr("d", "M0,0 L0,10 L2,10 L2,0 L0,0 M4,0 L4,10 L6,10 L6,0 L4,0")
        .attr("fill", "#bebebe")
        .attr("transform", "translate(35, 10.1) scale(1.8)")
    .on("mouseover", function(event, d) {
        d3.select(this)
            .style("stroke", "#243a76")
            .style("stroke-width", 0.3)
            .style("cursor", "pointer");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .style("stroke-width", 0);
    });

// #endregion

// #region TEXT

var yearText = d3.select("#vbed-map")
    .append("div")
    .attr("id", "year-text")
    .style("max-width", "666px")
    .style("text-align", "left")

var policies = yearText.append("div")
    .attr("id", "policies-text")
    .append("ul")

// #endregion

// keeps track of the current year selected
let currYear = 0;


// load data
Promise.all([
    d3.csv("data/VBED.csv"),
    d3.json("data/tile_map.json"),
    d3.json("data/policy_text.json")
]).then(function([data, tileMap, policyText]) {
    // #region MAP SETUP
    var mapContainer = svg.append("g")
        .attr("id", "map-container")

    var mapSize = 8;

    // rectangles for map
    mapContainer.append("g")
        .attr("id", "map")
        .selectAll("rect")
        .data(tileMap.states)
        .enter()
        .append("rect")
            .attr("x", d => d.x * mapSize)
            .attr("y", d => d.y * mapSize)
            .attr("width", 5 * mapSize)
            .attr("height", 5 * mapSize)
            .attr("fill", "#bebebe");

    // state abbreviations for tiles
    var mapAbb = mapContainer.append("g")
        .attr("id", "map-abb")
        .selectAll("text")
        .data(tileMap.states)
        .enter()
        .append("text")
            .text(d => d.abb)
            .attr("x", d => d.x * mapSize + 19)
            .attr("y", d => d.y * mapSize + 25)
            .attr("fill", "#bebebe")
            .attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold");

    // COVID asterisks
    mapContainer.append("g")
        .attr("id", "map-ast")
        .selectAll("text")
        .data(tileMap.states)
        .enter()
        .append("text")
            .text("*")
            .attr("id", d => "ast-" + d.abb)
            .attr("x", d => d.x * mapSize + 32)
            .attr("y", d => d.y * mapSize + 23)
            .attr("fill", "white")
            .attr("font-size", "13px")
            .attr("text-anchor", "middle")
            .attr("opacity", 0)
            .classed("noAst", true);

    // centering map
    var mapWidth = d3.select('#map-container').node().getBoundingClientRect().width;
    var mapx = d3.select('#map-container').node().getBoundingClientRect().x;
    mapContainer.attr("transform", "translate(" + ((666-mapWidth) / 2 - (mapx-((bodyWidth-666)/2))) + ", 50)")

    // #endregion

    // #region BAR CHART SETUP
    var barData = d3.rollups(data,
        v => v.length,
        d => d.Value,
        d => d.Year
    );

    var barScaleX = d3.scaleLinear()
        .domain([0, 50])
        .range([0, 200]);

    var barScaleY = d3.scaleLinear()
        .domain([0, 2])
        .range([15, 105])

    // initial bar chart
    var barChart = svg.append("g")
        .attr("id", "barChart")

    var bar1 = barChart
        .append("rect")
            .attr("y", barScaleY(0))
            .attr("x", 0)
            .attr("height", 20)
            .attr("width", 150)
            .attr("fill", "#bebebe")

    var bar2 = barChart
        .append("rect")
            .attr("y", barScaleY(1))
            .attr("x", 0)
            .attr("height", 20)
            .attr("width", 150)
            .attr("fill", "#bebebe")

    var bar3 = barChart
        .append("rect")
            .attr("y", barScaleY(2))
            .attr("x", 0)
            .attr("height", 20)
            .attr("width", 150)
            .attr("fill", "#bebebe")

    var barText1 = barChart
        .append("text")
            .attr("y", barScaleY(0) + 15)
            .attr("x", 0)

    var barText2 = barChart
        .append("text")
            .attr("y", barScaleY(1) + 15)
            .attr("x", 0)

    var barText3 = barChart
        .append("text")
            .attr("y", barScaleY(2) + 15)
            .attr("x", 0)

    barChart.append("g")
        .attr("id", "barChart-x-axis")
        .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", 140)
            .attr("fill", "#555555ff")

    barChart
        .attr("transform", "translate (400, 585)")

    // #endregion


    // #endregion

    // #region UPDATE MAP
    function updateMap(inputYear) {
        currYear = (inputYear - 2000) / 2; // update currYear based on inputYear

        // select data based on variable
        for (var i = 0; i < data.length; i++) { // loop through VBED data
            var dataState = data[i].State;
            var dataValue = data[i].Value;
            var dataYear = data[i].Year;

            for (var j = 0; j < tileMap.states.length; j++) { // loop through json until match
                var mapState = tileMap.states[j].name;

                if (dataState == mapState && dataYear == inputYear) {
                    tileMap.states[j].value = dataValue; // once match is found, update value based on year

                    if (data[i].COVID == 1) {
                        d3.select("#ast-" + tileMap.states[j].abb)
                            .classed("noAst", false)
                            .classed("ast", true)
                    } else {
                        d3.select("#ast-" + tileMap.states[j].abb)
                            .classed("noAst", true)
                            .classed("ast", false);
                    }

                    break;
                }
            }

        }

        // update asterisk
        d3.selectAll(".noAst")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".ast")
            .transition()
            .duration(500)
            .attr("opacity", 1);

        if (inputYear == 2020 | inputYear == 2022) {
            covidLegend
                .transition()
                .duration(500)
                .attr("opacity", 1);
        } else {
            covidLegend
                .transition()
                .duration(500)
                .attr("opacity", 0);
        }

        // update map
        svg.select("#map")
            .selectAll("rect")
            .transition()
            .duration(750)
            .attr("fill", function(d) {
                return colorScale(d.value)
            });

        mapAbb
            .transition()
            .duration(750)
            .attr("fill", d => abbColorScale(d.value))

        // update circle selection
        d3.selectAll("circle")
            .transition()
            .duration(500)
            .style("fill", "#bebebe")

        d3.select("#circle-" + inputYear)
            .transition()
            .duration(500)
            .style("fill", "#243a76")

        // update bar chart
        bar1
            .transition()
            .duration(750)
            .attr("fill", "#3b9171")
            .attr("width", barScaleX(barData[1][1].sort()[currYear][1]));

        bar2
            .transition()
            .duration(750)
            .attr("fill", "#efc55b")
            .attr("width", barScaleX(barData[2][1].sort()[currYear][1]));

        bar3
            .transition()
            .duration(750)
            .attr("fill", "#ef7f4d")
            .attr("width", barScaleX(barData[0][1].sort()[currYear][1]));

        barText1
            .transition()
            .duration(750)
            .attr("x", barScaleX(barData[1][1].sort()[currYear][1]) + 10)
            .text(barData[1][1].sort()[currYear][1]);

        barText2
            .transition()
            .duration(750)
            .attr("x", barScaleX(barData[2][1].sort()[currYear][1]) + 10)
            .text(barData[2][1].sort()[currYear][1]);

        barText3
            .transition()
            .duration(750)
            .attr("x", barScaleX(barData[0][1].sort()[currYear][1]) + 10)
            .text(barData[0][1].sort()[currYear][1]);

        // update text
        d3.selectAll("li").remove(); // remove any bullets to get a clear page

        var policyBullets = policies
            .selectAll("li")
            .data(policyText.policy[currYear])
            .enter()
            .append("li")
                .text((d, i) => policyScale(i))
                .style("list-style-image", (d, i) => "url(images/" + listScale(i) + ")");

        policyBullets
            .append("span")
                .style("font-weight", "bold")
                .text(d => d.change + " ");

        policyBullets.each(function(d) {
            var currList = d3.select(this)
                .append("ul")

            if (d.bullets != null) {
                d.bullets.forEach(function(d) {
                    currList
                        .append("li")
                        .text(d)
                        .style("list-style-image", "none");
                })

            }    
        });

        d3.selectAll("li")
            .style("font-size", "1.25rem")
    }

    // #endregion

    // #region TIMER
    var timerFunc = function() {
        if (yearSelect == 2) { // presidential
            currYear = (currYear + 2) % 14;
            updateMap(2000 + currYear * 2);
        } else if (yearSelect == 1) { // midterm
            currYear = (currYear + 2) % 14;
            updateMap(2000 + currYear * 2);
        } else { // all
            currYear = (currYear + 1) % 14; 
            updateMap(2000 + currYear * 2);
        }
    }

    // timer needs to be initialized so when the year options are clicked,
    // it has something to reference and stop
    let timer = d3.interval(timerFunc, 2500);

    // boolean to keep track of whether the animation is playing
    let playing = true;

    // play button behavior when clicked
    playButton
        .on("click", function() {
            if (playing) { return; } // prevents the playButton from activating when already playing

            playing = true;

            timer = d3.interval(timerFunc, 2500);
            d3.select(this)
                .attr("fill", "#243a76");

            d3.select("#pause")
                .transition()
                .duration(500)
                .attr("fill", "#bebebe");
        })

    // pause button behavior when clicked
    pauseButton 
        .on("click", function() {
            timer.stop();

            playing = false;

            d3.select(this)
                .attr("fill", "#243a76");

            d3.select("#play")
                .transition()
                .duration(500)
                .attr("fill", "#bebebe");
        })

    // #endregion

    // #region YEAR TIMELINE BUTTON FUNCTIONS
    function enableYearOptions(type) {
        d3.selectAll("." + type)
            .attr("opacity", 1)
            .on("click", function(e,d) {
                timer.stop()
                playing = false;
                updateMap(d.year)

                d3.select(this)
                    .style("fill", "#243a76")

                d3.select("#play")
                    .transition()
                    .duration(500)
                    .attr("fill", "#bebebe");

                d3.select("#pause")
                    .transition()
                    .duration(500)
                    .attr("fill", "#bebebe");
            })
            .on("mouseover", function(e, d) {
                d3.select(this)
                    .style("stroke", "#243a76")
                    .style("stroke-width", 1.2)
                    .style("cursor", "pointer");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("stroke-width", 0);
            });
        
        d3.selectAll("." + type + "-label")
            .attr("opacity", 1);
    }

    enableYearOptions("presidential");
    enableYearOptions("midterm");

    function disableYearOptions(type) {
        d3.selectAll("." + type)
            .attr("opacity", 0.1)
            .on("click", function() {
                return;
            })
            .on("mouseover", function() {
                return;
            })
            .on("mouseout",function() {
                return;
            });

        d3.selectAll("." + type + "-label")
            .attr("opacity", 0.1);
    }

    // #region SELECTION BEHAVIOR

    // stops timer and updates map to smallest year in selected option
    // then deactivates the deselected years
    selections
        .on("click", function(e, d, i) {
            if (!selectionBarSelected) {
                return;
            }

            // update selections
            selections.attr("opacity", 0);
            selectionsText.attr("opacity", 0);
            selections.style("cursor", "default");

            // update selection bar
            selectionBarSelected = false;
            selectionBarText.text(d.option);

            // update arrow
            selectionTri.attr("fill", "#dbdbdb");

            // reset timer
            timer.stop();
            playButton
                .transition()
                .duration(500)
                .attr("fill", "#bebebe");

            yearSelect = d.index;

            if (yearSelect == 1) { // midterm
            yearRect // update year rectangle
                .attr("x", xScale(2002))
                .attr("width", xScale(2026) - xScale(2002))

            enableYearOptions("midterm");
            disableYearOptions("presidential");
            updateMap(2002);

        } else if (yearSelect == 2) { // presidental
            yearRect
                .attr("x", xScale(2000))
                .attr("width", xScale(2024) - xScale(2000));

            enableYearOptions("presidential");
            disableYearOptions("midterm");
            updateMap(2000);

        } else if (yearSelect == 0) { // all
            yearRect
                .attr("x", xScale(2000))
                .attr("width", xScale(2026) - xScale(2000));

            enableYearOptions("presidential");
            enableYearOptions("midterm");
            updateMap(2000);
        }
    })

    // #endregion

    d3.selectAll("text").style("pointer-events", "none");

    updateMap(2000);

});

// event listeners
