// const http = require('http')
// const fs = require('fs')
// const path = require('path')
// const querystring = require('querystring')

// const PORT = 8080

// const server = http.createServer((req, res) => {
//     if (req.method == 'GET') {
//         switch (req.url) {
//             case '/': {
//                 fs.readFile(path.join(__dirname, 'index.html'), 'utf-8', (err, data) => {
//                     if (err) {
//                         res.writeHead(500, { 'Content-Type': 'text/plain' })
//                         res.end('Error reading the login page')
//                         return
//                     }
//                     res.writeHead(200, { 'Content-Type': 'text/html' })
//                     res.end(data)
//                 })
//                 break
//             }
//             case '/dashboard': {
//                 fs.readFile(path.join(__dirname, 'dashboard.html'), 'utf-8', (err, data) => {
//                     if (err) {
//                         res.writeHead(500, { 'Content-Type': 'text/plain' })
//                         res.end('Error reading the dashboard page')
//                         return
//                     }
//                     res.writeHead(200, { 'Content-Type': 'text/html' })
//                     res.end(data)
//                 })
//                 break
//             }
//             case '/register': {
//                 fs.readFile(path.join(__dirname, 'register.html'), 'utf-8', (err, data) => {
//                     if (err) {
//                         res.writeHead(500, { 'Content-Type': 'text/plain' })
//                         res.end('Error reading the registration page')
//                         return
//                     }
//                     res.writeHead(200, { 'Content-Type': 'text/html' })
//                     res.end(data)
//                 })
//                 break
//             }
//             default: {
//                 res.writeHead(404, { 'Content-Type': 'text/plain' })
//                 res.end('Not Found')
//             }
//         }
//     }
//     else if (req.method === 'POST') {
//         switch (req.url) {
//             case '/login': {
//                 let body = ''
//                 req.on('data', chunk => {
//                     body += chunk.toString()
//                 })

//                 req.on('end', () => {
//                     const { username, password } = querystring.parse(body)

//                     // Read the users from the users.json file
//                     fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
//                         if (err) {
//                             res.writeHead(500, { 'Content-Type': 'text/plain' })
//                             res.end('Error reading user data')
//                             return
//                         }

//                         // Parse the users data
//                         const users = JSON.parse(data)

//                         // Authenticate the user by checking the username and password
//                         const user = users.find(u => u.username === username && u.password === password)

//                         if (user) {
//                             // If user is found, redirect to the dashboard
//                             res.writeHead(302, { 'Location': '/dashboard' })
//                             res.end()
//                         } else {
//                             // If user is not found, redirect to the register page
//                             res.writeHead(302, { 'Location': '/register' })
//                             res.end()
//                         }
//                     })
//                 })
//                 break
//             }
//             case '/register': {
//                 let body = ''
//                 req.on('data', chunk => {
//                     body += chunk.toString()
//                 })

//                 req.on('end', () => {
//                     const { username, password } = querystring.parse(body)
//                     const userData = { username, password }

//                     // Read existing users from users.json or create an empty array if file doesn't exist
//                     fs.readFile(path.join(__dirname, 'users.json'), 'utf-8', (err, data) => {
//                         let users = []

//                         if (!err) {
//                             users = JSON.parse(data)
//                         }

//                         // Save new user to the users array
//                         users.push(userData)

//                         // Write the updated users array to users.json
//                         fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), (err) => {
//                             if (err) {
//                                 res.writeHead(500, { 'Content-Type': 'text/plain' })
//                                 res.end('Error saving registration data')
//                                 return
//                             }
//                             res.writeHead(302, { 'Location': '/' })
//                             res.end()
//                         })
//                     })
//                 })
//                 break
//             }
//             default: {
//                 res.writeHead(404, { 'Content-Type': 'text/plain' })
//                 res.end('Not Found')
//             }
//         }
//     }
// })

// server.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`)
// })



const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const querystring = require('querystring');

const PORT = 8080;

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        await handleGetRequest(req, res);
    } else if (req.method === 'POST') {
        await handlePostRequest(req, res);
    }
});

async function handleGetRequest(req, res) {
    const routes = {
        '/': 'index.html',
        '/login.html': 'login.html',
        '/register.html': 'register.html',
        '/adminDashboard.html': 'adminDashboard.html',
        '/studentDashboard.html': 'studentDashboard.html',
        '/staffDashboard.html': 'staffDashboard.html',
        '/courseMangmnt.html': 'courseMangmnt.html',
        '/attendance.html': 'attendance.html',
        '/anouncement.html': 'anouncement.html',
        '/contactus.html': 'contactus.html'
    };

    const filePath = routes[req.url] || 'error.html';
    await serveHtmlFile(res, filePath);
}

async function handlePostRequest(req, res) {
    if (req.url === '/register') {
        let body = '';
        for await (const chunk of req) {
            body += chunk.toString();
        }
        const formData = querystring.parse(body);
        await handleRegistration(formData, res);
    } else if (req.url === '/login') {
        // Implement login logic here
        res.writeHead(302, { 'Location': '/error.html' });
        res.end();
    } else {
        await serveHtmlFile(res, 'error.html', 404);
    }
}

async function handleRegistration(formData, res) {
    const { firstName, lastName, email, password, role } = formData;

    if (!firstName || !lastName || !email || !password || !role) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'All fields are required' }));
        return;
    }

    const newUser = { firstName, lastName, email, password, role };

    try {
        const usersFilePath = path.join(__dirname, 'public', 'users.json');
        let users = [];

        try {
            const data = await fs.readFile(usersFilePath, 'utf-8');
            users = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        if (users.some(user => user.email === email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User with this email already exists' }));
            return;
        }

        users.push(newUser);
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
    } catch (error) {
        console.error('Error handling registration:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

async function serveHtmlFile(res, fileName, statusCode = 200) {
    try {
        const filePath = path.join(__dirname, 'public', fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(data);
    } catch (error) {
        console.error(`Error serving ${fileName}:`, error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});