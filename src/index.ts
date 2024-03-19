import "dotenv/config";
import debug from "debug";

const logger = debug("core");
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map(
    (delay) => (): Promise<number> =>
        new Promise((resolve) => {
            setTimeout(() => resolve(Math.floor(delay / 100)), delay);
        }),
);

type Task = () => Promise<number>;

const throttle = async (workers: number, tasks: Task[]) => {
    const results: number[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < tasks.length; ) {
        const workerTasks: Task[] = [];
        for (let j = 0; j < workers && i < tasks.length; j++, i++) {
            workerTasks.push(tasks[i]);
        }

        executing.push(
            (async () => {
                for (const task of workerTasks) {
                    const result = await task();
                    results.push(result);
                }
            })(),
        );
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
