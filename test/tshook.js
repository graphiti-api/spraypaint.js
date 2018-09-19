require("ts-node").register({
  typeCheck: true,
  compilerOptions: {
    module: "commonjs"
  }
})

process.on("unhandledRejection", (reason, p) => {
  console.log(`UNHANDLED PROMISE REJECTION: ${reason.stack}`)
})
