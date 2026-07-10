const mongoose = require("mongoose");
const MONGO_URI = "mongodb+srv://propvista:DQgyJbnfWsUFXyNv@cluster0.ob3bs2q.mongodb.net/propvista?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to DB successfully");
    const User = mongoose.model("User", new mongoose.Schema({
      name: String,
      email: String,
      password: String
    }, { collection: "users" }));

    const users = await User.find({}, { name: 1, email: 1, password: 1 });
    console.log("Users in database:");
    console.log(JSON.stringify(users, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
