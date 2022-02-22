const express = require("express");

const router = new express.Router();
const ExpressError = require("./expressError");
const db = require("./db")

/* GET /companies
Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT * FROM companies');
        return res.json(results.rows);
    } catch (err) {
        return next(err)
    }
})

/* GET /companies/[code]
    Return obj of company: {company: {code, name, description}} */
router.get("/:code", async function(req, res, next) {
    try {
        const code = req.params.code
        const results = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [code])
        if (results.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        return res.json({
            company: {
                code: results.rows[0].code,
                name: results.rows[0].name,
                description: results.rows[0].description
            }
        })
    } catch (err) {
        return next(err);
    }
})

/*     POST /companies
    Adds a company.
    Needs to be given JSON like: {code, name, description}
    Returns obj of new company: {company: {code, name, description}} */
router.post("/", async function(req, res, next) {
    try {
        const { code, name, description } = req.body;
        console.log(code, name, description);
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        console.log(results.rows);
        return res.status(201).json({
            company: {
                name: results.rows[0].name,
                code: results.rows[0].code,
                description: results.rows[0].description
            }
        });
    } catch (err) {
        return next(err)
    }
});


/* PUT /companies/[code]
    Edit existing company.
    Should return 404 if company cannot be found.
    Needs to be given JSON like: {name, description}
    Returns update company object: {company: {code, name, description}} */
router.patch("/:code", async function(req, res, next) {
    try {
        const { name, description } = req.body;
        let code = req.params.code;
        console.log(name, description, code)
        const results = await db.query('UPDATE companies set name=$1, description=$2 WHERE code =$3 RETURNING code, name, description', [name, description, code]);
        return res.status(200).json({
            company: {
                name: results.rows[0].name,
                code: results.rows[0].code,
                description: results.rows[0].description
            }
        });
    } catch (err) {
        return next(err)
    }
});


/* DELETE /companies/[code]
Deletes company.
Should return 404 if company cannot be found. Returns { status: "deleted" } */
router.delete("/:code", async function(req, res, next) {
    try {
        const code = req.params.code
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code, name, description', [code])
        if (results.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        return res.json({ status: "deleted" })
    } catch (err) {
        return next(err);
    }
});

module.exports = router;