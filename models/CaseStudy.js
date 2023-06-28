const mongoose = require("mongoose");

const CaseStudySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        subtitle: {
            type: String,
        },
        desc: {
            type: String,
            required: true,
        },
        result: {
            type: String,
            required: true,
        },
        expertises: {
            type: Array,
            required: true,
        },
        solution: {
            type: Array,
            required: false,
        },
        photo: {
            type: String,
            required: false,
        },
        username: {
            type: String,
            required: true,
        },
        approach: {
            type: Array,
            required: false,
        },
        isHomePage: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);
CaseStudySchema.index({ title: "text", desc: "text" });

module.exports = mongoose.model("CaseStudies", CaseStudySchema);
