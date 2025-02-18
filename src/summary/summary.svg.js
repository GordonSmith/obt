import { parseArgs } from "node:util";
import { SummaryPlot } from "../lib/SummaryPlot.js";

const {
    values: { name }
} = parseArgs({
    options: { name: { type: "string" } }
});

const data = [];

process.stdout.write(SummaryPlot(data).outerHTML);
