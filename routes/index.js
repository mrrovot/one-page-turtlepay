var express = require('express');
var router = express.Router();
var axios = require('axios');

var _ = require('lodash')


//stuff to use a json file db.json as db to not complicate things
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter);



/* GET home page. */
router.get('/', function(req, res, next) {

    //clear cookies for the user when he visits the homepage
    res.clearCookie('txnHash')

    // get the namespace for sockets and to send tu trtl
    uniquePaymentIdentifier = res.locals.nameSpace;

        //send msg to client to make sure all working
        var socketio = req.app.get('socketio').of(`/${res.locals.nameSpace}`)
        socketio.emit('message', `you are connected  to ${res.locals.nameSpace}`)

    turtlePayData = {
        "amount": 1000,//change this to the price of your product
        "address": "TRTLv2n21XRdNr43DAp7WXYMm3MBcS9n8ZTsDcmZ7WVdM4J9uSTWsYAEFoWyvRCcgVesyGBjYkD4qF67R7R4odSQf7n7iE58hV6", //change this to your private TRTL address
        "callback": "https://whosen10turtles.info/turtlepay", //make sure you change this to your url
        "confirmations": 2, //you can pick here how many confirmatiions before you consider the payment done
        "userDefined": {
            "user": uniquePaymentIdentifier
        }
    }

    
    // //call turtlepay and pass our data
    // axios.post('https://api.turtlepay.io/v1/new', turtlePayData)
    //     .then(function(response) {
    //         console.log(response.data);

            
    //     })
    //     .catch(function(error) {
    //         console.log(error);
    //     });
        res.render('index', { title: 'Express', id: uniquePaymentIdentifier });

});


router.post('/get-turtlepay-wallet', (req,res,next) => {

    turtlePayData = {
        "amount": 100,//change this to the price of your product
        "address": "TRTLv2n21XRdNr43DAp7WXYMm3MBcS9n8ZTsDcmZ7WVdM4J9uSTWsYAEFoWyvRCcgVesyGBjYkD4qF67R7R4odSQf7n7iE58hV6", //change this to your private TRTL address
        "callback": "http://133f50e6.ngrok.io/turtlepay", //make sure you change this to your url
        "confirmations": 2, //you can pick here how many confirmatiions before you consider the payment done
        "userDefined": {
            "user": req.body.user
        }
    }

    
    //call turtlepay and pass our data
    axios.post('https://api.turtlepay.io/v1/new', turtlePayData)
        .then(function(response) {
            res.status(200).json({sendToAddress: response.data.sendToAddress, qrCode: response.data.qrCode, user: response.data.userDefined.user})
          

            
        })
        .catch(function(error) {
            console.log(error);
        });
})
//Thankyou page
router.get('/thankyou', (req, res, next) => {

    try {
        //seee if the person trying to access this page actually paid
        let user = db.get('users')
            .find({ txnHash: req.cookies.txnHash })
            .value()
        if (user) {

            //get all users from db.json
            users = db.get('users')
                .map('msg')
                .value()

            //filter users without msg 
            filteredUsers = _.filter(users, _.some);
            res.render('thankyou', { users: filteredUsers });
        } else {
            res.send('You can not access this page')
        }
    } catch (e) {
        console.log(e)
    }


})



//Thankyou page post req for msg submission
router.post('/thankyou', async (req, res, next) => {
    console.log(req.body.msg)

    db.get('users')
        .find({ txnHash: req.cookies.txnHash })
        .assign({ msg: req.body.msg })
        .write()
    res.status(200).send('Success')

})



// this is the callback url we provivde to turtlepay
router.post('/turtlepay', (req, res) => {
    //print the status turtlepay sends back in the console
    console.log(req.body);
    console.log(req.body.confirmationsRemaining)

    try {
        user = req.body.request.userDefined.user;
        var socketio = req.app.get('socketio').of(`/${user}`);
        if (req.body.status === 200 || req.body.status === 102) {

            //update the client with confirmations remaining
            socketio.emit('message', { status: req.body.status, confirmationsRemaining: req.body.confirmationsRemaining })

        }

        //if turtlepay transfered the funds to your main wallet
        if (req.body.status === 200) {
            console.log('went through,hash: ' + req.body.txnHash)

            
             db.get('users')
                .push({ txnHash: req.body.txnHash, createdAt: new Date() })
                .write()

            //send message to the client
            socketio.emit('message', { status: 200, txnHash: req.body.txnHash });



        }
        res.status(200).send('ok')
    } catch (e) {
        console.log(e)
    }

})


module.exports = router;