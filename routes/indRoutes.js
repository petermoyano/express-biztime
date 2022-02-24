const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db")

/* GET /industries
Returns list of all industries, like {industries: [{code, industry}, ...]} */
router.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT * FROM industries');
        return res.json({ industries: results.rows });
    } catch (err) {
        return next(err)
    }
})

/*  POST /industries
    Adds an industry.
    Needs to be given JSON like: {code, industry}
    Returns obj of new industry: {industry: {code, industry}} */
router.post("/", async function(req, res, next) {
    try {
        const { code, industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        return res.status(201).json({
            industry: results.rows[0]
        });
    } catch (err) {
        return next(err)
    }
});

router.post("/companies", async function(req, res, next) {
    try {
        const { comp_code, ind_code } = req.body;
        const results = await db.query('INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code', [comp_code, ind_code]);
        return res.status(201).json({
            company_industry: results.rows[0]
        });
    } catch (err) {
        return next(err)
    }
});

module.exports = router;