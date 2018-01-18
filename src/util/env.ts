export const inBrowser = typeof window !== "undefined"
export const isProd = process.env.NODE_ENV === "production"

export const config = {
  productionTip: !isProd
}
