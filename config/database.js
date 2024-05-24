const mongoose = require("mongoose");
require("dotenv").config();


// Set up a Mongoose connection
mongoose.set("strictQuery", false);

const dev_db_url = "placeholder";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

// Wait for database connect. Logs error if fail to connect.
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}