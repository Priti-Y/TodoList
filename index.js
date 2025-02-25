import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  database : 'permalist',
  user: 'postgres',
  password: 'admin',
  port: 5432,
  host: "localhost",
}
);

db.connect();

async function getAllItems(){

  let items = await db.query("SELECT * from items");
  return items.rows;
}

async function saveItem(newItem,updatedCategory) {
    var result = await db.query("INSERT INTO ITEMS (title,category) values ($1,$2) returning *",[newItem,updatedCategory] );
    return result;
}

app.get("/", async (req, res) => {
  let items = await getAllItems();
  let todayList = [];
  let weekly = [];
  let monthly = [];

  for(var i = 0 ; i< items.length;i++){
     if (items[i].category == "Today") {
        todayList.push(items[i]);
     } else if(items[i].category == "Weekly"){
      weekly.push(items[i]);
     }else {
      monthly.push(items[i]);
     }
  }

  res.render("index.ejs", {
    listTitle: ["Today","Weekly","Monthly"],
    listItems: [todayList, weekly , monthly],
  });
});


async function updateTitle(id,title){
  var result = await db.query("UPDATE ITEMS set title = $1 where id = $2",[title,id] );
  return result;
}
app.post("/add",async (req, res) => {
  const newItem = req.body.newItem;
  const updatedCategory = req.body.updatedCategory;

  var result = await saveItem(newItem,updatedCategory);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
 
  const modId = req.body.updatedItemId;
  const modItem = req.body.updatedItemTitle;
  var result= await updateTitle(modId,modItem);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const delId = req.body.deleteItemId;
  var result = await db.query("delete from items where id = $1;",[delId] );
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
