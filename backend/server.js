const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.post("/run-test", async (req, res) => {
    const { functionName, users, token, payload } = req.body;

    if (!token) {
        return res.json({ error: "Token missing. Login first." });
    }

    const payloadString = JSON.stringify(payload || {});

    const command = `
    k6 run script.js \
    -e FUNCTION=${functionName} \
    -e USERS=${users} \
    -e TOKEN="${token}" \
    -e PAYLOAD='${payloadString}'
    `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.json({ error: error.message });
        }

        res.json({
            output: stdout,
            error: stderr
        });
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});