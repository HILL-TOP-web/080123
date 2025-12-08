import { Meteor } from 'meteor/meteor';
import '../imports/startup/server';

Meteor.startup(() => {
  console.log("🚀 Mine App Server Running...");
  console.log("Connected to MongoDB:", process.env.MONGO_URL);
});
