const express = require("express");

const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db")

/* GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]} */
router.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err)
    }
})

/* GET/invoices/[id]
Returns obj on given invoice.
If invoice cannot be found, returns 404.
Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}} */
router.get("/:id", async function(req, res, next) {
    try {
        const id = req.params.id;
        const invResults = await db.query('SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id=$1', [id]);
        if (invResults.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        console.log(`The invoice is: ${invResults.rows[0]}`);
        /* A second query to the db for company info */
        const comp_code = invResults.rows[0].comp_code;
        const compResults = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [comp_code])

        return res.json({
            invoice: {
                id: invResults.rows[0].id,
                amt: invResults.rows[0].amt,
                paid: invResults.rows[0].paid,
                add_date: invResults.rows[0].add_date,
                paid_date: invResults.rows[0].paid_date,
                company: {
                    code: compResults.rows[0].code,
                    name: compResults.rows[0].name,
                    description: compResults.rows[0].description
                }
            }
        })
    } catch (err) {
        return next(err);
    }
})

/*    POST /invoices
Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/
router.post("/", async function(req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        console.log(comp_code, amt);
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        if (results.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        return res.status(201).json({
            invoice: {
                id: results.rows[0].id,
                comp_code: results.rows[0].comp_code,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: results.rows[0].paid_date
            }
        });
    } catch (err) {
        return next(err)
    }
});


/* PUT /invoices/[id]
Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.patch("/:id", async function(req, res, next) {
    try {
        const { amt } = req.body;
        let id = req.params.id;
        console.log(amt, id);
        const results = await db.query('UPDATE companies SET amt=$1 WHERE id =$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        return res.status(200).json({
            invoice: {
                id: results.rows[0].id,
                comp_code: results.rows[0].comp_code,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: results.rows[0].paid_date
            }
        });
    } catch (err) {
        return next(err)
    }
});


/* DELETE /invoices/[id]
Deletes an invoice.
If invoice cannot be found, returns a 404.
Returns: {status: "deleted"} */
router.delete("/:id", async function(req, res, next) {
    try {
        const id = req.params.id
        console.log(id)
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id, comp_code', [id])
        if (results.rows.length === 0) {
            throw new ExpressError("Not found", 404);
        }
        return res.json({ status: "deleted" })
    } catch (err) {
        return next(err);
    }
});

module.exports = router;