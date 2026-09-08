// 1. IMPORTS AT THE VERY TOP
const http = require('http');
const { MongoClient } = require('mongodb');

// 2. Connection URL for local MongoDB (make sure MongoDB service is running on your PC)
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db, todosCollection;

async function run() {
    try {
        await client.connect();
        db = client.db('todoDatabase');
        todosCollection = db.collection('todos');
        console.log("Connected successfully to MongoDB");

       // 3. SERVER CREATION & HEADERS
        const server = http.createServer(async (req, res) => {
            // Security Headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');

            // CORS Headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            // 4. READ: Get all tasks from MongoDB
            if (req.url === '/api/todos' && req.method === 'GET') {
                try {
                    const todos = await todosCollection.find({}, { projection: { _id: 0 } }).toArray();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(todos));
                } catch (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: "Failed to fetch todos" }));
                }
            } 
            // CREATE: Add a new task to MongoDB (Fixed ID generation)
            else if (req.url === '/api/todos' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const { title } = JSON.parse(body);
            
                        // Input validation check
                        if (!title || typeof title !== 'string' || !title.trim()) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Invalid task title" }));
                        return;
                        }

                        // Find the highest existing ID safely
                        const highestTodo = await todosCollection.find().sort({ id: -1 }).limit(1).toArray();
                        const nextId = highestTodo.length > 0 ? highestTodo[0].id + 1 : 1;

                        const newTodo = { id: nextId, title: title.trim(), isCompleted: false };
            
                        await todosCollection.insertOne(newTodo);
            
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newTodo));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Failed to create todo" }));
                    }
                });
            }
            
            // UPDATE: Mark task as complete/incomplete
            else if (req.url.startsWith('/api/todos/') && req.method === 'PUT') {
                const id = parseInt(req.url.split('/')[3]);
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const { isCompleted } = JSON.parse(body);
                        await todosCollection.updateOne(
                            { id: id },
                            { $set: { isCompleted: isCompleted } }
                        );
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } catch (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: "Failed to update todo" }));
                    }
                });
            } 
            // DELETE: Remove a task from MongoDB
            else if (req.url.startsWith('/api/todos/') && req.method === 'DELETE') {
                const id = parseInt(req.url.split('/')[3]);
                try {
                    await todosCollection.deleteOne({ id: id });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: "Failed to delete todo" }));
                }
            } 
            else {
                res.writeHead(404);
                res.end();
            }
        });

        server.listen(3000, () => {
            console.log('API Server running on http://localhost:3000');
        });

    } catch (err) {
        console.error("Database connection failed:", err);
    }
}

run();