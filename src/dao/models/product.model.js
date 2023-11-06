import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  code: String,
  stock: Number,
  category: String,
  thumbnail: String,
  owner: { type: String, default: 'admin', required: true}
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model("products", productSchema);
