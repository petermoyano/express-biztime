process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("./app");
const db = require("./db");


let testCompany;
let testInvoice;
beforeEach(async function() {
    let result = await db.query(`
    INSERT INTO
    companies (code, name, description)
    VALUES ('mdn', 'mozzilla', 'web site for JS docs')
    RETURNING code, name, description`);
    testCompany = result.rows[0];

    let res = await db.query(`
    INSERT INTO 
    invoices (comp_code, amt) 
    VALUES ('mdn', 100)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testInvoice = res.rows[0];
    /*     Turn date format into json */
    testInvoice.add_date = new Date(testInvoice.add_date).toJSON();
});

afterEach(async function() {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

/* close db connection automatically*/
afterAll(async function() {
    await db.end();
})

describe("GET /invoices", function() {
    test("Gets all invoices", async function() {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoices: [testInvoice]
        })
    })
});

describe("GET /invoices/:[id]", function() {
    test("Gets a single invoice", async function() {
        const response = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoice: {
                id: testInvoice.id,
                amt: testInvoice.amt,
                paid: testInvoice.paid,
                add_date: testInvoice.add_date,
                paid_date: testInvoice.paid_date,
                company: {
                    code: testCompany.code,
                    name: testCompany.name,
                    description: testCompany.description
                }
            }
        });
    });
});

describe("POST /invoices", function() {
    test("Creates a new invoice", async function() {
        const response = await request(app)
            .post('/invoices')
            .send({ comp_code: "mdn", amt: 200 });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: testCompany.code,
                amt: 200,
                paid: expect.any(Boolean),
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
});

describe("PATCH /invoices/:[id]", function() {
    test("Updates a single invoice", async function() {
        const response = await request(app)
            .patch(`/invoices/${testInvoice.id}`)
            .send({ amt: 400, paid: false });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoice: {
                id: testInvoice.id,
                comp_code: testCompany.code,
                amt: 400,
                paid: expect.any(Boolean),
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });
});

describe("DELETE /invoices/:[id]", function() {
    test("Deletes a single invoice", async function() {
        const response = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted" });
    });
});