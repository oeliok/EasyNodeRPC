const express = require('express');
const router = express.Router();
module.exports = router;

const { say } = require("../service/HelloService");

router.get("/hello", async (req, res) => {
    try {
        let r = await say(req.query.word);
        res.json({ word: r });
    } catch (e) {
        res.json(e);
    }
});