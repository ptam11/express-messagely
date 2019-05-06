process.env.NODE_ENV = 'test';

const request = require('supertest')
const app = require('./app')
let db = require('./db')

beforeAll( async function() {
    await db.query(`
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
        username text PRIMARY KEY,
        password text,
        first_name text NOT NULL,
        last_name text NOT NULL,
        phone text,
        email text,
        join_at timestamp without time zone NOT NULL,
        last_login_at timestamp without time zone
    );
    
    CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        from_username text NOT NULL REFERENCES users,
        to_username text NOT NULL REFERENCES users,
        body text NOT NULL,
        sent_at timestamp without time zone NOT NULL,
        read_at timestamp without time zone);
    `)
})


afterAll(function () {
    db.end()
})

describe('POST /register', function() {
    test('We are able to properly register a new user and return a token', async function() {
        const response = await request(app).post('auth/register/').send({
            username: 'pk',
            password: 'getrekt',
            first_name: 'pro',
            last_name: 'uber',
            phone: '4151111111'
        })
        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeTruthy()
    })
    
})
