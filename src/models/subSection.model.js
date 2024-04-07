import { Schema, model } from "mongoose";

const subSectionSchema = new Schema({
    title:{
        type : String,
        required: true
    },
     timeDuration:{
        type : String,
        required: true

    },
    description:{
        type : String,
    },
    videoUrl:{
        type : String,
        required: true
    },
})

export default model('SubSection', subSectionSchema)

