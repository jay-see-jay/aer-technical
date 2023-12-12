import express from 'express'
import * as console from "console";

const app = express()

export const server = app.listen(3000, () => {
    console.log("Express up!")
})
