import "../infer/index.js";
import { listRule } from "../infer/rules/list.js";
import { keyValueRule } from "../infer/rules/key-value.js";

const main = () => {
    console.log("----MAIN");
    // const result1 = keyValueRule.tryInfer({
    //     name: "APP_CONFIG",
    //     rawValue: "c=2",
    // });
    // console.log(a);
    const result2 = listRule.tryInfer({
        name: "ALLOWED_LIST",
        rawValue: "a=b;x=p;e=f;g=h",
    });
    // const result = inferSimpleSchemaForListItem("x:p");
    console.log(JSON.stringify(result2, null, 2));
};

main();
