
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({ room:{type:String,required:true}, sender:{type:Schema.Types.ObjectId,ref:'User',required:true}, receiver:{type:Schema.Types.ObjectId,ref:'User',required:true}, content:{type:String,required:true}, type:{type:String,enum:['text','image'],default:'text'}, delivered:{type:Boolean,default:false}, seen:{type:Boolean,default:false} }, { timestamps:true });
module.exports = mongoose.model('Message', messageSchema);
