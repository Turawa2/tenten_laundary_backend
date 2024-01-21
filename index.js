const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
//bringing mysql to server
const mysql = require("mysql2");
const { response } = require("express");


// calling the declarations 3  ***//
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


//establishing the connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "loundarydb"
});






/*** api for post customers users from react to two tables in the database ***/
app.post("/api/post/customers", (req, res) => {
    const { Name, Amount, ClothSet, Resident } = req.body;

    // Define the SQL query for the first table (customers).
    const sqlInsertCustomers = "INSERT INTO customers (Name, Amount, ClothSet, Resident, Date) VALUES (?, ?, ?, ?, ?)";
    
    // Define the SQL query for the second table (secondcustomer).
    const sqlInsertSecondCustomer = "INSERT INTO secondcustomer (Name, Amount, ClothSet, Resident, Date) VALUES (?, ?, ?, ?, ?)";

    // Perform a transaction to ensure both inserts happen together or fail together.
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        
        connection.beginTransaction((transactionErr) => {
            if (transactionErr) {
                connection.release();
                return res.status(500).send(transactionErr.message);
            }

            // Insert data into the first table (customers).
            connection.query(sqlInsertCustomers, [Name, Amount, ClothSet, Resident, Date], (error1, result1) => {
                if (error1) {
                    connection.rollback(() => {
                        connection.release();
                        return res.status(400).send("Error inserting into customers table");
                    });
                } else {
                    // Insert data into the second table (secondcustomer).
                    connection.query(sqlInsertSecondCustomer, [Name, Amount, ClothSet, Resident, Date], (error2, result2) => {
                        if (error2) {
                            connection.rollback(() => {
                                connection.release();
                                return res.status(400).send("Error inserting into secondcustomer table");
                            });
                        } else {
                            connection.commit((commitErr) => {
                                if (commitErr) {
                                    connection.rollback(() => {
                                        connection.release();
                                        return res.status(500).send("Transaction commit error");
                                    });
                                } else {
                                    connection.release();
                                    res.send("Data inserted into both tables successfully!");
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});



// API endpoint to fetch customer data
app.get("/api/get/customers", (req, res) => {
    // Define the SQL query to select data from the "customers" table
    const sqlSelectCustomers = "SELECT * FROM customers";

    // Execute the query to fetch customer data
    db.query(sqlSelectCustomers, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result);
    });
});


// API endpoint to fetch secondcustomer data
app.get("/api/get/secondcustomer", (req, res) => {
    // Define the SQL query to select data from the "customers" table
    const sqlSelectCustomers = "SELECT * FROM secondcustomer";

    // Execute the query to fetch customer data
    db.query(sqlSelectCustomers, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result);
    });
});


// API endpoint to delete a customer by ID
app.delete("/api/delete/customer/:id", (req, res) => {
    const customerId = req.params.id;

    // Define the SQL query to delete a customer by ID
    const sqlDeleteCustomer = "DELETE FROM customers WHERE id = ?";

    // Execute the query to delete the customer
    db.query(sqlDeleteCustomer, [customerId], (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.send("Customer deleted successfully");
    });
});



// API endpoint to fetch Amount
app.get("/api/get/customer", (req, res) => {
    // Define the SQL query to select data from the "customers" table
    const sqlSelectCustomers = "SELECT Amount FROM customers";

    // Execute the query to fetch customer data
    db.query(sqlSelectCustomers, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }else{
            result.forEach((customer) => {
                // console.log('Amount: ' + customer.Amount)
            })
        }
        res.json(result);
    });
});


// API endpoint to fetch Amount secondcustomer
app.get("/api/get/secondcustomer", (req, res) => {
    // Define the SQL query to select data from the "customers" table
    const sqlSelectCustomers = "SELECT Amount FROM secondcustomer";

    // Execute the query to fetch customer data
    db.query(sqlSelectCustomers, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }else{
            result.forEach((customer) => {
                // console.log('Amount: ' + customer.Amount)
            })
        }
        res.json(result);
    });
});




//*** starting the server 3 ***//
app.listen(9000, () => {
    console.log("server is running on port 9000");
});