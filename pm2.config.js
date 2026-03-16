module.exports = {
    apps: [
        {
            name: "miki",
            script: "src/main.ts",
            interpreter: "deno",
            interpreter_args: "run --env-file -A --watch",
        },
    ],
};
