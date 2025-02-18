import { parseArgs } from "node:util";
import { SummaryPlot } from "../lib/summaryPlot.js";
// import { fetchSummary } from "../lib/summary.js";

const {
    values: { name }
} = parseArgs({
    options: { name: { type: "string" } }
});

// const summaryData = await fetchSummary();
const data = [];
// for (const key in summaryData.when) {
//     data.push({
//         date: key,
//         value: summaryData.when[key].total
//     });
// }

process.stdout.write(SummaryPlot(data).outerHTML);
