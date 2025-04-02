const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path'); 
const methodOverride = require("method-override"); 
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require('./schema.js');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));//parsing
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', (req, res) => {
  res.send('Hello World');
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);

    }else{
        next();
    }
};

//index route
app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // res.send(listings);
    res.render("listings/index.ejs", {allListings});
}));

// new route
app.get('/listings/new', (req, res) => {
    res.render("listings/new.ejs");
});

//create route
app.post('/listings',validateListing, wrapAsync(async(req, res)=>{
    // let{title, price, country,.....} = req.body;
    //we another things making a key value pair "listing"in new.ejs listing[title]...
        // if(!req.body.listing){
        //     throw new ExpressError(400, "Send valid data for listing");
        // } 
        // ye na likh kar "joi" use karege
        // if(!newListing.title){
        //     throw new ExpressError(400, "Title is required");
        // }

        // let result = listingSchema.validate(req.body); // Validate the request body using Joi
        // console.log(result);
        // if (result.error) {
        //     throw new ExpressError(400, result.error); // Throw an error if validation fails
        // }validateListing use kiya tabhi hatatya hai
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings")
    })
);

//Edit route
app.get("/listings/:id/edit",wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//put request(update route)(updated by  me not the actual code by SD)
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // }validateListing use kiya tabhi hatatya hai
    //mam ka code
    // let {id} = req.params;
    // let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    // res.redirect(`/listings/${id}`); 

    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    // Update listing fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // Check if image URL is provided; update correctly
    if (req.body.listing.image && req.body.listing.image.trim() !== "") {
        listing.image = {
            filename: listing.image?.filename || "default", // Keep old filename if available
            url: req.body.listing.image // Update only the URL
        };
    }

    await listing.save(); // Save the updated listing
    res.redirect(`/listings/${id}`);
}));



//delete 
app.delete("/listings/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//show route (it is "read" operation in CRUD)
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//new route
// app.get('/listings/new', (req, res) => {
//     res.render("listings/new.ejs");
// });


// app.get('/testlistings', async (req, res) => {
//     // console.log(res);
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the Beach",
//         price: 1100,
//         location: "Calungute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample saved");
//     res.send("successfull testing");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    // res.status(statusCode).send(message);   
    // res.status(statusCode).reder("error.ejs", {err});   
    res.status(statusCode).render("error.ejs", {message});   
    // res.send("Something went wrong");
});

app.listen(8080, () => {
    console.log('Server is listening ot port 8080');
});