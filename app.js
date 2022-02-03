//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Raghav:Test123@cluster0.f11fl.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("list",listSchema);

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to the todolist-v2"
});

const item2 = new Item({
  name: "Hit the + button to add items"
});

const item3 = new Item({
  name: "<-- Hit the checkbox to delete item"
});

const defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length == 0) {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully inserted items");
        }
      })
      res.redirect("/");
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  
  });



});

app.get("/:customListName",function(req,res){
  // console.log(req.params.customListName);
  const customName = _.capitalize(req.params.customListName);
  List.findOne({name: customName},function(err,foundlistName){
    if(!err){
      if(!foundlistName){
        // console.log("Doesn't exists");
        const list = new List({
          name: customName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customName);
      }else{
        // console.log("exists");
        res.render("list",{ listTitle: foundlistName.name , newListItems: foundlistName.items });
      }
    }
  });
 
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name: listName},function(err,foundlist){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
      })
      
  }
  });

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.list;

  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted");
      }
  
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItem}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
  

});



// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
