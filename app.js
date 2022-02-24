/** BizTime express application. */

const appCompRoutes = require("./routes/compRoutes");
const appInvRoutes = require("./routes/invoiceRoutes");
const appIndRoutes = require("./routes/indRoutes")
const express = require("express");
const ExpressError = require("./expressError")

const app = express();

app.use(express.json());

app.use("/companies", appCompRoutes)
app.use("/invoices", appInvRoutes)
app.use("/industries", appIndRoutes)

/** 404 handler */
app.use(function(req, res, next) {
    const err = new ExpressError("Not Found", 404);
    return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message;
    return res.status(status).json({ error: { message, status } });
});


/* we need app in server.js */
module.exports = app;