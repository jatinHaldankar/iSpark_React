const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


mongoose.connect('mongodb+srv://haldankarjatin:DrgFhWCMs5R7gZiK@cluster0.wddcbrl.mongodb.net/iSpark');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const port = 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://ispark.onrender.com");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});




const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  account_no: String,
  balance: Number,
  date: {
    type: Date,
    default: Date.now()
  }
})

const User = mongoose.model('User', UserSchema);

app.post("/userData", (req, res) => {
  User.find().then((user) => {
    res.send(user);
  }).catch((err) => {
    console.log(err);
  })
})

app.post("/addUser", (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    account_no: req.body.account_no,
    balance: req.body.balance,
  })

  
  newUser.save().then(() => {
    res.json({ success: true, message: "account created successfully" });
  }).catch((err) => {
    console.log(err);
    res.json({ success: false, message: "there is an error while opening an account" });
  })
})


const TransferSchema = new mongoose.Schema({
  creditNumber: String,
  debitNumber: String,
  amount: Number,
})

const Transfer = mongoose.model('Transfer', TransferSchema);

app.post("/historyData", (req, res) => {
  Transfer.find().then((transfer) => {
    res.send(transfer);
  }).catch((err) => {
    console.log(err);
  })
})

app.post("/transferData", async (req, res) => {
  try {
    const { creditAccountNumber, debitAccountNumber, amount } = req.body;

    const creditors = await User.findOne({ account_no: creditAccountNumber });
    if (!creditors) {
      return res.json({ success: false, message: "credited account not found" });
    }

    const debitors = await User.findOne({ account_no: debitAccountNumber });
    if (!debitors) {
      return res.json({ success: false, message: "debited account not found" });
    }

    if (amount > debitors.balance) {
      return res.json({ success: false, message: "insufficient balance" });
    }

    await User.updateOne({ account_no: debitAccountNumber }, { $inc: { balance: -amount } });
    await User.updateOne({ account_no: creditAccountNumber }, { $inc: { balance: amount } });

    const newTransfer = new Transfer({
      creditNumber: creditAccountNumber,
      debitNumber: debitAccountNumber,
      amount: amount,
    });

    await newTransfer.save();

    res.json({ success: true, message: "transfer successful" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "invalid details" });
  }
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  problem: String
})

const Contact = mongoose.model("Contact", contactSchema);

app.post('/contactData', (req, res) => {
  const newContact = new Contact({
    name: req.body.name,
    email: req.body.email,
    problem: req.body.problem
  })

  newContact.save().then(() => {
    res.json({ success: true, message: "your problem will resloved soon!" })
  }).catch((err) => {
    console.error(err);
    res.json({ success: false, message: "try after some time" });
  })
})

app.listen(process.env.PORT || port, () => {
  console.log(`server is running on http://localhost:${port}`)
})