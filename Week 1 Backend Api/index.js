const express = require("express");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "Backend server is running!"
    });
});

app.get("/hello", (req, res) => {
    res.json({
        name: "Nerain Prakash",
        role: "Backend AI Engineering Intern"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});