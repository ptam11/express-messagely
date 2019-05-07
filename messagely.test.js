process.env.NODE_ENV = "test";

const request = require('supertest')
const app = require('./app')
let db = require('./db')
var token;
var msg; 

beforeAll(async function() {
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

    token = await request(app).post('/auth/register/').send({
        username: 'pk',
        password: 'getrekt',
        first_name: 'pro',
        last_name: 'uber',
        phone: '4151111111'
    })

    await request(app).post('/auth/register/').send({
        username: 'pkong',
        password: 'hello',
        first_name: 'pro',
        last_name: 'uber',
        phone: '4151111111'
    })

    msg = await request(app).post('/messages/').send({
        to_username: 'pkong',
        body: 'please stop spamming my inbox',
        _token: token.body.token
    })
})

beforeEach(function() {
    
})

afterAll(function () {
    db.end()
})

describe('POST /register', function() {
    test('We are able to properly register a new user and return a token', async function() {
        const response = await request(app).post('/auth/register/').send({
            username: 'pktony',
            password: 'getrekt',
            first_name: 'pro',
            last_name: 'uber',
            phone: '4151111111'
        })
        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeTruthy()
    })  
})

describe('POST /login', function() {
    test('We are able to properly login as an existing user and return a token', async function() {
        const response = await request(app).post('/auth/login/').send({
            username: 'pk',
            password: 'getrekt',
        })
        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeTruthy()
        expect(response.body.token).toEqual(token.body.token)
    })  
})

describe('GET /messages', function() {
    test('We are able to see detail of a message', async function() {
        const response = await request(app).get('/messages/1').send({
            _token = token.body.token
        })
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual(msg.body.body)
    })
})

