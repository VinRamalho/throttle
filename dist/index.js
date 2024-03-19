"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)("core");
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map((delay) => () => new Promise((resolve) => {
    setTimeout(() => resolve(Math.floor(delay / 100)), delay);
}));
const throttle = async (workers, tasks) => {
    const results = [];
    const executing = [];
    async function execute(task) {
        const result = await task();
        results.push(result);
        // Remove the executing promise from the array when the task is done
        const index = executing.indexOf(p);
        if (index !== -1) {
            executing.splice(index, 1);
        }
        // If there are still tasks to execute, start executing them
        if (tasks.length) {
            await execute(tasks.shift());
        }
    }
    // Start executing tasks with a limit defined by the number of workers
    for (let i = 0; i < Math.min(workers, tasks.length); i++) {
        const task = tasks.shift();
        const p = execute(task);
        executing.push(p);
    }
    await Promise.all(executing);
    return results;
};
const bootstrap = async () => {
    logger("Starting...");
    const start = Date.now();
    const answers = await throttle(5, load);
    logger("Done in %dms", Date.now() - start);
    logger("Answers: %O", answers);
};
bootstrap().catch((err) => {
    logger("General fail: %O", err);
});
