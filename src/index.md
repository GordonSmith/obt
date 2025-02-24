---
toc: false
---

<div class="hero">
  <h2>Last Updated:  ${lastUpdate}</h2>
</div>

```js
const lastUpdate =  await FileAttachment("./data/lastUpdate.txt").text();
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Number of OBT runs</h2>
    <span class="big">${data.runCount}</span>
    <span class="muted"> In the last ${d3.utcDay.count(since, Date.now())} days</span>
  </div>
  <div class="card">
    <h2>Total number of tests</h2>
    <span class="big">${numberFormat(data.total)}</span>
    <span class="muted"> taking ${durationFormat(data.seconds)}</span>
  </div>
</div>
<div class="grid grid-cols-4">
  <div class="card">
    <h2>Passed</h2>
    <span class="big green">${pctFormat(data.pass/data.total)}</span>
  </div>
  <div class="card">
    <h2>Failed</h2>
    <span class="big red">${pctFormat(data.fail/data.total)}</span>
  </div>
  <div class="card">
    <h2>Error</h2>
    <span class="big red">${pctFormat(data.error/data.total)}</span>
  </div>
  <div class="card">
    <h2>Timeout</h2>
    <span class="big yellow">${pctFormat(data.timeout/data.total)}</span>
  </div>
</div>

```js
const xdomain = d3.extent(dataTasks, d => d.date);
const groupedTasks = d3.groups(dataTasks, d => d.task)
    .map(([key, data]) => ({
      "Test": key,
      "Pass": data[0].pass,
      "Fail": data[0].fail,
      "Error": data[0].error,
      "Timeout": data[0].timeout,
      "Trend": data
    }));
```

```js
const taskTable = Inputs.table(groupedTasks, {
      columns: ["Test", "Pass", "Trend", "Fail", "Error", "Timeout"], 
      sort: "date", 
      format: {
          Trend: data => sparkarea({
            data,
            x: data.map(d => d.date),
            y: data.map(d => d.fail),
            xdomain
          })
        }
      });

```

```js
function sparkarea({
  data = [],
  x: X,
  y: Y,
  xdomain = d3.extent(X),
  ydomain = d3.extent([0,...Y, 1]),
  width = 240,
  height = 20
}) {
  const x = d3.scaleUtc(xdomain, [0, width]);
  const y = d3.scaleLinear(ydomain, [height, 0]);
  const area = d3.area()
      .x((d, i) => x(X[i]))
      .y1((d, i) => y(Y[i]))
      .y0(height)
      .curve(d3.curveStep)
      .defined((d, i) => !isNaN(X[i]) && !isNaN(Y[i]))
      ;
  // debugger;
  return d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .style("vertical-align", "middle")
      .style("margin", "-3px 0")
      .call(g => g.append("path")
        .attr("fill", "#faa")
        .attr("d", area(data)))
      .call(g => g.append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("d", area.lineY1()(data)))
    .node();
}

const runsTable = Inputs.table(dataRuns, {
      columns: ["date", "pass", "fail", "error", "timeout"], 
    });
```

<div class="grid grid-cols-1">
  <div class="card">
    <h2><b>Most Recent</b>: ${dataTasks[0].date ?? ""}</h2>
    <span>${taskTable}</span>
  </div>
</div>
<div class="grid grid-cols-1">
  <div class="card">
    <h2>All</h2>
    <span>${runsTable}</span>
  </div>
</div>
<div class="grid grid-cols-1">
  <div class="card">
    <h2>Totals</h2>
    <span>${taskPlot(taskPlotData)}</span>
  </div>
</div>
<!-- <div class="grid grid-cols-1">
  <div class="card">
    <h2>Branches</h2>
    <span>${taskPlot(branchesPlotData, "branch")}</span>
  </div>
</div>
<div class="grid grid-cols-1">
  <div class="card">
    <h2>Build systems</h2>
    <span>${taskPlot(buildSystemsPlotData, "buildSystem")}</span>
  </div>
</div> -->

```js
import { fetchSummary } from "./lib/summary.js";

const summaryData = await fetchSummary();
const dataRuns = [];
const dataTasks = [];
for (const key in summaryData.when) {
  dataRuns.push({
    date: new Date(key),
    pass: summaryData.when[key].pass,
    fail: summaryData.when[key].fail,
    error: summaryData.when[key].error,
    timeout: summaryData.when[key].timeout,
    payload: summaryData.when[key]
  });
  for (const task in summaryData.when[key].tasks) {
    dataTasks.push({
      date: new Date(key),
      task: task,
      pass: summaryData.when[key].tasks[task].pass,
      fail: summaryData.when[key].tasks[task].fail,
      error: summaryData.when[key].tasks[task].error,
      timeout: summaryData.when[key].tasks[task].timeout,
      payload: summaryData.when[key].tasks[task]
    });
  }
}
dataRuns.sort((a, b) => b.date - a.date);
dataTasks.sort((a, b) => b.date - a.date);
```


```ts
import { fetchSummary } from "./lib/summary.js";

const data = await fetchSummary();
const since =  new Date(data.since);
const numberFormat = d3.format(",");

const _pctFormat = d3.format(".2~%");
function pctFormat(value) {
  const retVal = _pctFormat(value);
  if (value > 0 && retVal === "0%") {
    return "< 0.01%";
  }else if (value < 1 && retVal === "100%") {
    return ">99.99%";
  }
  return retVal;
}

function durationFormat(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}
```

```ts
//  Task Plot ---
function taskData(root) {
    return Object.keys(root).map(key => {
        const task = root[key];
        return {
            name:key,
            seconds: task.seconds ?? 0,
            color: (task.fail ?? 0) > 0 || (task.error ?? 0) > 0 ? red : 
                    (task.timeout ?? 0) > 0 ? yellow : green
        };
    });
}
const taskPlotData = taskData(data.tasks);

const branchesPlotData = [];
Object.keys(data.branches).forEach(branch => {
    taskData(data.branches[branch].tasks).forEach(row=>{
        row.branch = branch;
        branchesPlotData.push(row);
    });
});

const buildSystemsPlotData = [];
Object.keys(data.buildSystems).forEach(buildSystem => {
    taskData(data.buildSystems[buildSystem].tasks).forEach(row=>{
        row.buildSystem = buildSystem;
        buildSystemsPlotData.push(row);
    });
});

function taskPlot(data, facet = "") {
    return Plot.plot({
        fill: {legend: true},
        marginLeft: 180,
        marginRight: facet ? 80 : 0,
        marks: [
            Plot.barX(data, {
                x: "seconds",
                y: "name",
                fy: facet,
                fill: "color",
                stroke: "color"
            })
        ]
    });
}
```

```js exec hide
//  Theme Colors ---
const div = document.querySelector("div");
const style = getComputedStyle(div);
const red = style.getPropertyValue("--theme-red");
const green = style.getPropertyValue("--theme-green");
const yellow = style.getPropertyValue("--theme-yelow");
```

---

## Debugging

_The following ${data.errors.length} errors that occured during the parsing of the OBT data_

```js
Inputs.table(data.errors)
```


```js
display(dataRuns);
display(dataTasks);
display(groupedTasks);
```

<style>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 2rem 0 2rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
