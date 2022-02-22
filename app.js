/** BizTime express application. */

const appRoutes = require("./routes")
const express = require("express");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());
app.use("/companies", appRoutes)









/** 404 handler */

app.use(function(req, res, next) {
    const err = new ExpressError("Not Found", 404);
    console.log("404 not fiundeeeeeeed!")
    return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message;
    return res.status(status).json({ error: { message, status } });
});


module.exports = app;