const initData = require('./data.js');
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log('MongoDB Connected');
})
.catch(err => {
    console.error(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});//deletes all the documents in the collection if any exists in the collection already
    await Listing.insertMany(initData.data);//inserts the data from data.js into the collection(data : sampleListing)
    console.log("Database initialized");
};

initDB();