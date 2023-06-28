const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/CaseStudy");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validations");
const validation = require("../middleware/ValidationList");
//CREATE expertise
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE expertise
router.put(
    "/:id",
    // [auth, validate(validation.caseStudySchema)],
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (post.username === req.body.username) {
                try {
                    const updatedPost = await Post.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        { new: true }
                    );
                    return res.status(200).json(updatedPost);
                } catch (err) {
                    return res.status(500).json(err);
                }
            } else {
                return res.status(401).json("You can update only your post!");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

//DELETE expertise
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.username === req.body.username) {
            try {
                await post.delete();
                res.status(200).json("Post has been deleted...");
            } catch (err) {
                res.status(500).json(err);
            }
        } else {
            res.status(401).json("You can delete only your post!");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET expertise
router.get("/:id", async (req, res) => {
    try {
        let post = await Post.find({
            title: req.params.id.replace(/-/g, " "),
        });
        post = post.length === 0 ? await Post.findById(req.params.id) : post[0];
        // console.log("🚀 ~ file: caseStudy.js:67 ~ router.get ~ post:", post);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL expertise
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    const searchText = req.query.search;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const isHomePage = req.query.isHomePage;
    const skipIndex = (page - 1) * limit;
    let title = catName && req.query.cat.replace(/-/g, " ");
    title === "Data Science" ? (title = " " + title) : title;
    console.log("🚀 ~ file: caseStudy.js:89 ~ router.get ~ title:", title);
    try {
        let posts;
        if (username) {
            posts = await Post.find({ username })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();
        } else if (catName && catName != "null") {
            posts = await Post.find({
                solution: {
                    $in: [title || catName],
                },
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();

            if (posts.length === 0) {
                posts = await Post.find({
                    expertises: {
                        $in: [title || catName],
                    },
                })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(skipIndex)
                    .exec();
            }

            console.log(
                "🚀 ~ file: caseStudy.js:111 ~ router.get ~ posts:",
                posts
            );
        } else if (isHomePage) {
            posts = await Post.find({ isHomePage: "true" })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();
        } else if (searchText) {
            const query = { $text: { $search: searchText } };
            posts = await Post.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();
        } else {
            posts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();
        }
        res.status(200).json(posts);
        console.log("🚀 ~ file: caseStudy.js:134 ~ router.get ~ posts:", posts);
    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;
