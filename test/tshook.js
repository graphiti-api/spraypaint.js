require("ts-node").register({
  compilerOptions: {
    module: "commonjs"
  }
})

process.on("unhandledRejection", (reason, p) => {
  console.log(`UNHANDLED PROMISE REJECTION: ${reason.stack}`)
})
