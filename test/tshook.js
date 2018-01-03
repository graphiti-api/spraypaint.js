require("ts-node").register({
  compilerOptions: {
    noEmitHelpers: false,
    module: "commonjs"
  }
});

process.on('unhandledRejection', (reason, p) => {
  console.log(`UNHANDLED PROMISE REJECTION: ${reason.stack}`)
})
