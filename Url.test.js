const Url = require('./Url');
const {Socket} = require('node:net');

describe('http URLs', () => {
    
    let u = new Url('http://example.org');

    test('url initialised', () => {
        expect(u.scheme).toBe('http');
        expect(u.hostname).toBe('example.org');
        expect(u.port).toBe(80);
        expect(u.path).toBe('/');
    });
    
    test('http request', async () => {
        let spy = jest.spyOn(u,'request').mockImplementation(() => Promise.resolve({headers: {}, response: {}}));
        
        let {headers,response} = await u.request();
        expect(headers).toEqual({});
        expect(response).toEqual({});
        
        spy.mockRestore();
    });
    
});


describe('https URLs', () => {
    let u = new Url('https://example.org/index.html');

    test('https URLs', () => {    
        expect(u.scheme).toBe('https');
        expect(u.hostname).toBe('example.org');
        expect(u.port).toBe(443);
        expect(u.path).toBe('/index.html');
    });
    
    test('https request', async () => {
        let spy = jest.spyOn(u,'request').mockImplementation(() => Promise.resolve({headers: {}, response: {}}));
        
        let {headers,response} = await u.request();
        expect(headers).toEqual({});
        expect(response).toEqual({});
        
        spy.mockRestore();
    });
});


describe('file URLs', () => {
    let u = new Url('file:///home/h/raw/moose/app.js');

    test('file URLs', () => {
        expect(u.scheme).toBe('file');
        expect(u.path).toBe('/home/h/raw/moose/app.js');
    });
    
    test('file URL request', async () => {
        let {headers,response} = await u.request();
        expect(headers).toEqual({});
        expect(response).toBe(`\nconsole.log("app");\n\n`);
    });
});


describe('data URLs', () => {
    let u = new Url('data:text/html,Hello World');

    test('data URLs', () => {
        expect(u.scheme).toBe('data');
        expect(u.contentType).toBe('text/html');
        expect(u.content).toBe('Hello World');
    });
    
    test('data URL request', async () => {
        let {headers,response} = await u.request();
        expect(headers).toEqual({});
        expect(response).toBe('Hello World');
    })
});


test('view-source Urls', () => {
    let u = new Url('view-source:http://example.org/index.html');
    expect(u.scheme).toBe('view-source');
    expect(u.hostname).toBe('example.org');
    expect(u.port).toBe(80);
    expect(u.path).toBe('/index.html');
});

