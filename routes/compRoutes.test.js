process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");

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

/* close db connection */
afterAll(async function() {
    await db.end();
})

describe("GET /companies", function() {
    test("Gets all companies", async function() {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            companies: [testCompany]
        })
    })
});

describe("GET /companies/:[code]", function() {
    test("Gets a single company", async function() {
        const response = await request(app).get(`/companies/${testCompany.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company: {
                code: testCompany.code,
                name: testCompany.name,
                description: testCompany.description,
                invoices: [testInvoice]
            }
        })
    })
})