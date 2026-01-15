// setup for express

const express=require("express");
const app=express();
let port=8080;
const Listing=require("./models/listing.js");
const Review=require("./models/review.js")
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");

const wrapAsync=require("./utils/wrapAsync.js")

const ExpressError=require("./utils/ExpressError.js")

// requiring listing routes
const listingRouter=require("./routes/listing.js")

// requiring review routes
const reviewRouter=require("./routes/review.js");

// requirng singup routes
const userRouter=require("./routes/user.js")

const session=require("express-session");

const flash=require("connect-flash");

// requiring password and authantication related library

const passport=require("passport");
const LocalStrategy=require("passport-local")
const User=require("./models/user.js");


const path=require("path");
app.set("view engine","ejs");

app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


// setup for mongoose

const mongoose=require("mongoose");
const { clearCache } = require("ejs");
// const listing = require("./models/listing.js");


main().then((result)=>{
    console.log("database connected successful")
}).catch((err)=>{
    console.log(err);
})

async function main(params) {
    
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');

}


// create first route to check setup
// app.get("/",(req,res)=>{
//     res.send("Hii it is basic or root page");
// })
// connecting session 
const sessionOptions={
    secret:"Mysecretstring",
    resave:false,
    saveUninitialized:true,
    cookies:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}


app.use(session(sessionOptions));
// connecting flash
app.use(flash());


app.use(passport.initialize());
app.use(passport.session()); 

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// middleware for authentication and authorization



app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"danish.com",
//         username:"akhtar"

//     })
//     let registerUser=await User.register(fakeUser,"khan");
//     res.send(registerUser);
// })



// listings related routes
app.use("/listings",listingRouter);

// reviews related routes
app.use("/listings/:id/reviews",reviewRouter);

// user relate routes

app.use("/",userRouter);

// page not found error

app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"))
})

// Error handling middleware
app.use((err,req,res,next)=>{
    // res.send("Something went wrong!")
    let {status=500,message="something went wrong!"}=err;
    // res.status(status).send(message);
    res.render("listings/error.ejs",{message})
})

app.listen(port,(req,res)=>{
    console.log("server is working with port 8080");
})