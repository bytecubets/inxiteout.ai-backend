const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const { validate } = require("../middleware/validations");
const validation = require("../middleware/ValidationList");

//CREATE POST
router.post(
    "/",
    [auth, validate(validation.basicPostSchema)],
    async (req, res) => {
        const newPost = new Post(req.body);
        try {
            const savedPost = await newPost.save();
            return res.status(200).json(savedPost);
        } catch (err) {
            console.log("🚀 ~ file: posts.js:15 ~ router.post ~ err:", err);
            return res.status(500).json(err);
        }
    }
);

//UPDATE POST
router.put(
    "/:id",
    [auth, validate(validation.basicPostSchema)],
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
                    res.status(200).json(updatedPost);
                } catch (err) {
                    console.log(
                        "🚀 ~ file: posts.js:35 ~ router.put ~ err:",
                        err
                    );
                    res.status(500).json(err);
                }
            } else {
                res.status(401).json("You can update only your post!");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
);

//DELETE POST
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.username === req.body.username) {
            try {
                await post.delete();
                res.status(200).json("Post has been deleted...");
            } catch (err) {
                console.log(
                    "🚀 ~ file: posts.js:55 ~ router.delete ~ err:",
                    err
                );
                res.status(500).json(err);
            }
        } else {
            res.status(401).json("You can delete only your post!");
        }
    } catch (err) {
        console.log("🚀 ~ file: posts.js:62 ~ router.delete ~ err:", err);
        res.status(500).json(err);
    }
});

//GET POST
router.get("/:id", async (req, res) => {
    try {
        let post = await Post.find({ title: req.params.id.replace(/-/g, " ") });
        post = post.length === 0 ? await Post.findById(req.params.id) : post[0];
        // console.log("🚀 ~ file: posts.js:86 ~ router.get ~ post:", post);
        res.status(200).json(post);
    } catch (err) {
        console.log("🚀 ~ file: posts.js:73 ~ router.get ~ err:", err);
        res.status(500).json(err);
    }
});

//GET ALL POSTS
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    const searchText = req.query.search;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skipIndex = (page - 1) * limit;
    try {
        let posts;

        if (username) {
            posts = await Post.find({ username })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .exec();
        } else if (catName) {
            posts = await Post.find({
                categories: {
                    $in: [catName],
                },
            })
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
        return res.status(200).json(posts);
    } catch (err) {
        console.log("🚀 ~ file: posts.js:116 ~ router.get ~ err:", err);
        return res.status(500).json(err);
    }
});

module.exports = router;
