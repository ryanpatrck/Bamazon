//Dependencies
const mysql = require('mysql'),
inquirer = require('inquirer'),
// Define the MySQL connection parameters
connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"root",
    database:"bamazon"
});
//promptManager will present menu options to the manager and trigger appropriate logic
connection.connect((err)=>{
    if (err) throw err;
    promptManager();
})

function promptManager (){
    //console.log('___ENTER promptManager___');
    inquirer.prompt([{
        name:'options',
        type: 'list',
        message: 'Please select an option:',
        choices: ['View Products for Sale', 'View Low Inventory','Add to Inventory', 'Add New Product','End Session' ]
    }]).then((answer) =>{
        switch(answer.options) {
            case 'View Products for Sale':
                viewProducts();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                newProduct();
                break;
            case 'End Session':
                console.log("Bye");
                break;
        }
        //End of switch

    });
}
function appContinue() {
    inquirer.prompt({
        name: "continue",
        type: "confirm",
        message: "Would you like to go back to the main menu?",
    }).then((answer)=> {
        if (answer.continue == true) {
            appStart();
        } else {
            console.log("Ending session with Bamazon Manager!");
            connection.end();
        }
    });
};

//views all inventory
var viewProducts = function(){
    console.log('>>>>>>Viewing Products<<<<<<');
    connection.query('SELECT * FROM Products', (err, res)=>{
        if(err) throw err;
        console.log('------------');

        for(var i=0; i<res.length; i++){
            console.log("ID: "+res[i].ItemID +" | "+ "Products: "+res[i].ProductName +" | "+
            + "Department: "+ res[i].DepartmentName + " | " + "Price: "+ res[i].Price +" | "+
            + "QTY: "+res[i].StockQuantity);
            console.log('-----------');
        }
        promptManager();
    })
}
//views inventory lower than 5
function lowInventory(){
    console.log('>>>>>>Viewing Low Inventory<<<<<<');

    connection.query('SELECT * FROM Products', (err, res)=>{
        if(err) throw err;
        console.log('------------');

        for(var i=0; i<res.length; i++){
            if(res[i].StockQuantity <= 5){
                console.log(res[i].ItemID+" || "+res[i].ProductName+" || "+
                res[i].DepartmentName+" || "+res[i].Price+" || "+res[i].StockQuantity+"\n");
            console.log('-----------');
            }
        }
        promptManager();
    })
}

//displays prompt to add more of an item to the store and asks how much
function addInventory(){
    console.log('>>>>>>Adding to Inventory<<<<<<');
  
    connection.query('SELECT * FROM Products', (err, res)=>{
    if(err) throw err;
    var itemArray = [];
    //pushes each item into an itemArray
    for(var i=0; i<res.length; i++){
      itemArray.push(res[i].ProductName);
    }
  
    inquirer.prompt([{
      type: "list",
      name: "product",
      choices: itemArray,
      message: "Which item would you like to add inventory?"
    }, {
      type: "input",
      name: "qty",
      message: "How much would you like to add?",
      validate: (value) =>{
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
      }]).then((ans) =>{
        var currentQty;
        for(var i=0; i<res.length; i++){
          if(res[i].ProductName === ans.product){
            currentQty = res[i].StockQuantity;
          }
        }
        connection.query('UPDATE Products SET ? WHERE ?', [
          {StockQuantity: currentQty + parseInt(ans.qty)},
          {ProductName: ans.product}
          ], (err, res) =>{
            if(err) throw err;
            console.log('The quantity was updated.');
            promptManager();
          });
        })
    });
  }

//allows manager to add a completely new product to store
function newProduct(){
    console.log('>>>>>>Adding New Product<<<<<<');
    var deptNames = [];
  //grab name of departments
    connection.query('SELECT * FROM Products', (err, res)=>{
    if(err) throw err;
    for(var i = 0; i<res.length; i++){
      deptNames.push(res[i].DepartmentName);
    }
  })
    inquirer.prompt([{
      type: "input",
      name: "product",
      message: "Product: ",
      validate: (value)=>{
        if(value){return true;}
        else{return false;}
      }
    }, {
      type: "list",
      name: "department",
      message: "Department: ",
      choices: deptNames

    }, {
      type: "input",
      name: "price",
      message: "Price: ",
      validate: (value)=>{
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
    }, {
      type: "input",
      name: "quantity",
      message: "Quantity: ",
      validate: (value)=>{
        if(isNaN(value) == false){return true;}
        else{return false;}
      }
    }]).then((ans)=>{
      connection.query('INSERT INTO Products SET ?',{
        ProductName: ans.product,
        DepartmentName: ans.department,
        Price: ans.price,
        StockQuantity: ans.quantity
      }, (err, res)=>{
        if(err) throw err;
        console.log('Another item was added to the store.');
      })
      promptManager();
    });
  }
  

  