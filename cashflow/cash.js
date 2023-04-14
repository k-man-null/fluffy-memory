const IntaSend = require('intasend-node');

const intasendPublishable = process.env.INTASEND_PUBLISHABLE_TOKEN;
const intasendSecret = process.env.INTASEND_SECRET_TOKEN;

let intasend = new IntaSend(
    intasendSecret,
    intasendPublishable,
    true, // Test ? Set true for test environment
);

console.log(intasend);



exports.intasend = intasend;