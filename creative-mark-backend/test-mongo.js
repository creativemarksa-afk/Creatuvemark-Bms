import mongoose from "mongoose";

const uri = "mongodb+srv://creativemarkimad_db_user:Xs5iaujgO4uGjZrk@creativemarkbms.wiaeatn.mongodb.net/?retryWrites=true&w=majority&appName=CreativeMarkBMS";

mongoose.connect(uri)
  .then(() => console.log("✅ Connected successfully"))
  .catch((err) => console.error("❌ Connection failed:", err));
