import path from "path";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default {
    external(id) {
        return Object.keys(pkg.dependencies).includes(id) || id.startsWith("dayjs")
    },
    input: "./src/index.ts",
    output: {
        file: path.resolve(__dirname, "dist", "esm", "index.esm.js"),
        format: "esm",
    },
    plugins: [
        typescript({
            check: false,
            rollupCommonJSResolveHack: true,
            tsconfigOverride: {
                compilerOptions: {
                    module: "es2015",
                    declaration: false,
                },
            },
        }),
        commonjs({extensions: [ ".js", ".ts" ]}),
    ],
};
