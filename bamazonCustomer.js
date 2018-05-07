//Dependencies
const mysql = require('mysql'),
inquirer = require('inquirer'),
connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"root",
    database:"Bamazon"
});

connection.connect((err) =>{
    if (err) throw err;
    console.log("connection successful!");
    createTable();
})
//function to create products table from bamazon database on the console
var createTable = function(){
    connection.query("SELECT * FROM products", (err,res) =>{
        for(var i=0; i<res.length; i++){
            console.log(res[i].ItemID+" || "+res[i].ProductName+" || "+
        res[i].DepartmentName+" || "+res[i].Price+" || "+res[i].StockQuantity+"\n");
        }
    promptCustomer(res);
    })
}
//Function to have customer pay for items in the database
var promptCustomer = (res)=>{
    inquirer.prompt([{
        type:"input",
        name:"choice",
        message:"What would you like to purchase? [Quit with Q]"
    }]).then((answer) =>{
        var correct = false;
        if (answer.choice.toUpperCase()=="Q"){
            process.exit();
        }
        for(var i=0; i<res.length; i++){
            if (res[i].ProductName==answer.choice){
                correct=true;
                var product=answer.choice;
                var id=i;
            inquirer.prompt([{
            type:"input",
            name:"quant",
            message:"How many would you like to buy?",
            validate: (value) =>{
                if(isNaN(value)==false){
                    return true;
                } else {
                    return false;
                }
            }
                }]).then((answer) =>{
                    if((res[id].StockQuantity-answer.quant)>0){
                    connection.query("UPDATE products SET stock_quantity='"+(res[id].StockQuantity-answer.quant)
                        +  "' WHERE productname='"+product+"'", (err,res2)=>{
                        console.log("Product Bought! ");
                        createTable();
                })
                    } else {
                        console.log("Not a valid selection!");
                              promptCustomer(res);
                    }
                })
            }
        }
       if(i==res.length && correct==false){
           console.log("Not a valid selection!");
           promptCustomer(res);
       } 
    })
}