
const http = require('http');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is missing');
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

let todosCollection;

const server = http.createServer(async (req, res) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // CORS headers (we will restrict the origin after Vercel deployment)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        // GET: Fetch all todos
        if (pathname === '/api/todos' && req.method === 'GET') {
            const todos = await todosCollection
                .find({}, { projection: { _id: 0 } })
                .toArray();

            res.writeHead(200);
            return res.end(JSON.stringify(todos));
        }

        // POST: Create a new todo
        if (pathname === '/api/todos' && req.method === 'POST') {
            let body = '';

            for await (const chunk of req) {
                body += chunk.toString();
                if (body.length > 10000) {
                    res.writeHead(413);
                    return res.end(JSON.stringify({ error: 'Request too large' }));
                }
            }

            const { title } = JSON.parse(body);

            if (typeof title !== 'string' || !title.trim()) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid task title' }));
            }

            const highestTodo = await todosCollection
                .find()
                .sort({ id: -1 })
                .limit(1)
                .toArray();

            const nextId = highestTodo.length > 0
                ? highestTodo[0].id + 1
                : 1;

            const newTodo = {
                id: nextId,
                title: title.trim(),
                isCompleted: false
            };

            await todosCollection.insertOne(newTodo);

            res.writeHead(201);
            return res.end(JSON.stringify(newTodo));
        }

        // PUT: Update todo completion status
        if (pathname.startsWith('/api/todos/') && req.method === 'PUT') {
            const id = Number(pathname.split('/')[3]);

            if (!Number.isSafeInteger(id) || id <= 0) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid todo ID' }));
            }

            let body = '';
            for await (const chunk of req) {
                body += chunk.toString();
                if (body.length > 10000) {
                    res.writeHead(413);
                    return res.end(JSON.stringify({ error: 'Request too large' }));
                }
            }

            const { isCompleted } = JSON.parse(body);

            if (typeof isCompleted !== 'boolean') {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid completion status' }));
            }

            const result = await todosCollection.updateOne(
                { id },
                { $set: { isCompleted } }
            );

            if (result.matchedCount === 0) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: 'Todo not found' }));
            }

            res.writeHead(200);
            return res.end(JSON.stringify({ success: true }));
        }

        // DELETE: Remove a todo
        if (pathname.startsWith('/api/todos/') && req.method === 'DELETE') {
            const id = Number(pathname.split('/')[3]);

            if (!Number.isSafeInteger(id) || id <= 0) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Invalid todo ID' }));
            }

            const result = await todosCollection.deleteOne({ id });

            if (result.deletedCount === 0) {
                res.writeHead(404);
                return res.end(JSON.stringify({ error: 'Todo not found' }));
            }

            res.writeHead(200);
            return res.end(JSON.stringify({ success: true }));
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route not found' }));

    } catch (error) {
        console.error('API error:', error);

        if (!res.headersSent) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db('todo_db');
        todosCollection = db.collection('todos');

        console.log('Connected successfully to MongoDB Atlas');

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Todo API running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Startup failed:', error);
        process.exit(1);
    }
}

run();

process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    server.close();
    await client.close();
    process.exit(0);
});
